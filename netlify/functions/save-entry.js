import { google } from 'googleapis';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'METHOD NOT ALLOWED' };

  try {
    const data = JSON.parse(event.body);

    for (let key in data) {
      if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
    }

    const formatFecha = (fechaISO) => {
      if (!fechaISO) return '';
      const [year, month, day] = fechaISO.split('-');
      return `${day}/${month}/${year}`;
    };

    const fechaExcel = formatFecha(data.fecha);
    const proximaSesionExcel = formatFecha(data.proximaSesion);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/calendar']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const calendar = google.calendar({ version: 'v3', auth });
    const promises = [];

    const sheetPromise = sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '2026!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.nombre,
          data.dni,
          data.edad,
          data.telefono,
          fechaExcel,
          data.procedimiento,
          data.cantidad,
          data.estadoPago,
          data.zona,
          data.profesional,
          proximaSesionExcel,
          data.hora,
          data.procRealizar,
          data.estadoRetoque,
          data.observaciones
        ]],
      },
    });
    promises.push(sheetPromise);

    if (data.proximaSesion && data.hora) {
      const startDateTime = `${data.proximaSesion}T${data.hora}:00`;
      const endDateTime = new Date(new Date(startDateTime).getTime() + 30 * 60000).toISOString();

      const calendarPromise = calendar.events.insert({
        calendarId: process.env.CALENDAR_ID,
        requestBody: {
          summary: `CITA: ${data.nombre}`,
          description: `PROCEDIMIENTO: ${data.procRealizar}\nOBS: ${data.observaciones}`,
          start: { dateTime: startDateTime, timeZone: 'America/Lima' },
          end: { dateTime: endDateTime, timeZone: 'America/Lima' },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 }
            ],
          },
        },
      });
      promises.push(calendarPromise);
    }

    await Promise.all(promises);
    return { statusCode: 200, body: JSON.stringify({ message: "SUCCESS" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};