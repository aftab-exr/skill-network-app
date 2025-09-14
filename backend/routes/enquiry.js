const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// POST /api/enquiry
router.post('/enquiry', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:C', // Assumes you want to write to columns A, B, C
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, email, message, new Date().toLocaleString()]], // Adds a timestamp
      },
    });

    res.status(200).json({ success: 'Enquiry submitted successfully!' });

  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to submit enquiry.' });
  }
});

module.exports = router;
