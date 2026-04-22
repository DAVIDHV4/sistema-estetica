import { google } from 'googleapis';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'METHOD NOT ALLOWED' };
  }

  try {
    const data = JSON.parse(event.body);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar'
      ]
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const calendar = google.calendar({ version: 'v3', auth });

    const sheetPromise = sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '2026!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.nombre, data.dni, data.edad, data.telefono, data.fecha,
          data.procedimiento, data.cantidad, data.estadoPago, data.zona,
          data.profesional, data.proximaSesion, data.procRealizar,
          data.estadoRetoque, data.observaciones
        ]],
      },
    });

    const promises = [sheetPromise];

    if (data.proximaSesion) {
      const calendarPromise = calendar.events.insert({
        calendarId: process.env.CALENDAR_ID,
        requestBody: {
          summary: `CITA: ${data.nombre}`,
          description: `PROCEDIMIENTO: ${data.procRealizar}\nOBS: ${data.observaciones}`,
          start: { date: data.proximaSesion },
          end: { date: data.proximaSesion },
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