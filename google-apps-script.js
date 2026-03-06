/**
 * ══════════════════════════════════════════════════════════════
 *  On Road — Google Apps Script Backend
 *  Paste this entire file into Google Apps Script, then deploy
 *  as a Web App. The URL you get goes into travel-agency.html.
 * ══════════════════════════════════════════════════════════════
 *
 *  SETUP STEPS (takes ~3 minutes):
 *  ──────────────────────────────
 *  1. Open your Google Sheet (or create a new blank one).
 *  2. In the menu bar: Extensions → Apps Script
 *  3. Delete any existing code in the editor.
 *  4. Paste THIS entire file.
 *  5. Click 💾 Save (Ctrl/Cmd + S). Name the project anything.
 *  6. Click "Deploy" → "New Deployment"
 *  7. Click the gear icon ⚙️ next to "Type" → select "Web App"
 *  8. Set:   Execute as:        Me (your Google account)
 *            Who has access:    Anyone
 *  9. Click "Deploy" → authorize when prompted → click "Allow"
 * 10. Copy the Web App URL that appears.
 * 11. Open travel-agency.html in a text editor.
 * 12. Replace "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
 *     with the URL you copied.
 * 13. Save the HTML file. Done!
 *
 *  SPREADSHEET COLUMNS CREATED AUTOMATICALLY:
 *  ───────────────────────────────────────────
 *  Timestamp | Tour Name | Tour ID | Full Name |
 *  Phone | Participants | Preferred Date
 * ══════════════════════════════════════════════════════════════
 */

// ── CONFIG ──────────────────────────────────────────────────
// Leave SHEET_NAME as "Bookings" (the script creates the tab
// automatically) OR change it to match an existing tab name.
const SHEET_NAME = "Bookings";

// Optional: set to your email to receive a notification email
// for every new booking. Leave as "" to disable.
const NOTIFY_EMAIL = "davitghlijyan@gmail.com";
// ────────────────────────────────────────────────────────────


/**
 * Handles POST requests from the web app form.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendBooking(data);
    if (NOTIFY_EMAIL) sendNotification(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests (for quick health-check testing in browser).
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Booking API is running." }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Appends a new booking row to the spreadsheet.
 */
function appendBooking(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // Create the sheet + header row if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "Timestamp",
      "Tour Name",
      "Tour ID",
      "Full Name",
      "Phone",
      "Participants",
      "Preferred Date"
    ];
    sheet.appendRow(headers);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1a6b5c");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 240); // Tour Name
    sheet.setColumnWidth(4, 180); // Full Name
    sheet.setColumnWidth(5, 160); // Phone
  }

  // Format the timestamp nicely
  const submittedAt = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString("en-US", { timeZone: "America/New_York" })
    : new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  sheet.appendRow([
    submittedAt,
    data.tourName     || "",
    data.tourId       || "",
    data.name         || "",
    data.phone        || "",
    data.participants || "",
    data.preferredDate || ""
  ]);
}

/**
 * Sends a notification email when a new booking comes in.
 * Only runs if NOTIFY_EMAIL is set above.
 */
function sendNotification(data) {
  const subject = `New Booking: ${data.tourName} — ${data.name}`;
  const body = `
A new tour booking has been submitted:

  Tour:         ${data.tourName}
  Customer:     ${data.name}
  Phone:        ${data.phone}
  Participants: ${data.participants}
  Date:         ${data.preferredDate}
  Submitted:    ${data.submittedAt}

View all bookings in your Google Sheet.
  `.trim();

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
