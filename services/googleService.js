// // Backend/services/googleService.js

// const { google } = require("googleapis");

// const auth = new google.auth.GoogleAuth({
//   credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
// });

// const sheets = google.sheets({ version: "v4", auth });

// async function appendAdmissionRow(row) {
//   const spreadsheetId = process.env.SHEET_ID;

//   await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range: "Sheet1!A1",
//     valueInputOption: "USER_ENTERED",
//     requestBody: {
//       values: [row],
//     },
//   });

//   console.log("📊 Data appended to Google Sheet");
// }

// module.exports = {
//   appendAdmissionRow,
// };











// Backend/services/googleService.js

const { google } = require("googleapis");

/* ===============================
   DECODE BASE64 SERVICE ACCOUNT
================================ */
if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
  throw new Error("❌ GOOGLE_SERVICE_ACCOUNT_BASE64 is missing");
}

const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
    "base64"
  ).toString("utf8")
);

/* ===============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

/* ===============================
   APPEND ROW
================================ */
async function appendAdmissionRow(row) {
  const spreadsheetId = process.env.SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("❌ SHEET_ID is missing");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });

  console.log("📊 Data appended to Google Sheet");
}

module.exports = {
  appendAdmissionRow,
};
