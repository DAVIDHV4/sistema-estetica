import { google } from 'googleapis';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'METHOD NOT ALLOWED' };
  }

  try {
    const data = JSON.parse(event.body);

    // NUEVO: Convertir todos los campos de texto a MAYÚSCULAS
    for (let key in data) {
      if (typeof data[key] === 'string') {
        data[key] = data[key].toUpperCase();
      }
    }

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

    // Ejecución en paralelo para mayor velocidad
    const promises = [];

    // Promesa 1: Google Sheets (Columnas A a N)
    const sheetPromise = sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '2026!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.nombre,          // A
          data.dni,             // B
          data.edad,            // C
          data.telefono,        // D
          data.fecha,           // E (Ahora manual/editable)
          data.procedimiento,   // F
          data.cantidad,        // G
          data.estadoPago,      // H
          data.zona,            // I
          data.profesional,     // J
          data.proximaSesion,   // K
          data.procRealizar,    // L
          data.estadoRetoque,   // M (Estado/Retoque)
          data.observaciones    // N
        ]],
      },
    });
    promises.push(sheetPromise);

    // Promesa 2: Google Calendar
    if (data.proximaSesion) {
      const calendarPromise = calendar.events.insert({
        calendarId: process.env.CALENDAR_ID,
        requestBody: {
          summary: `CITA: ${data.nombre}`,
          description: `PENDIENTE: ${data.procRealizar}\nOBS: ${data.observaciones}`,
          start: { date: data.proximaSesion },
          end: { date: data.proximaSesion },
        },
      });
      promises.push(calendarPromise);
    }

    await Promise.all(promises);

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "SUCCESS" }) 
    };
  } catch (error) {
    console.error("ERROR:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};