/**
 * AKARDAYA MYADS - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * 
 * Petunjuk Pemasangan:
 * 1. Buka Google Spreadsheet baru di Google Drive Anda (beri judul: "Database Akardaya MyAds")
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script"
 * 3. Hapus semua kode default, lalu salin dan tempelkan (Paste) seluruh isi file ini
 * 4. Klik ikon "Simpan" (Save)
 * 5. Klik tombol "Terapkan" (Deploy) -> "Penerapan Baru" (New deployment)
 * 6. Pilih jenis: "Aplikasi Web" (Web app)
 *    - Deskripsi: API Akardaya MyAds
 *    - Jalankan sebagai: "Saya" (Me - email akun Google Anda)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone) -> WAJIB 'Anyone' agar website bisa membaca & menulis data
 * 7. Klik "Terapkan" (Deploy) dan salin Web App URL yang berakhiran "/exec"
 * 8. Masukkan URL tersebut ke menu Admin Akardaya MyAds (Tab "Koneksi Google Spreadsheet")
 */

// Nama Sheet Database
const SHEET_DATA = "APP_DATA";
const SHEET_ORDERS = "ORDER_LEADS";
const SHEET_REVIEWS = "TESTIMONIALS";

/**
 * Inisialisasi Sheet jika belum ada
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!ss.getSheetByName(SHEET_DATA)) {
    const sheet = ss.insertSheet(SHEET_DATA);
    sheet.appendRow(["KEY", "JSON_PAYLOAD", "LAST_UPDATED"]);
    sheet.setFrozenRows(1);
  }
  
  if (!ss.getSheetByName(SHEET_ORDERS)) {
    const sheet = ss.insertSheet(SHEET_ORDERS);
    sheet.appendRow(["ID", "WAKTU", "NAMA", "WHATSAPP", "PAKET", "SALURAN", "STATUS", "CATATAN"]);
    sheet.setFrozenRows(1);
  }
  
  if (!ss.getSheetByName(SHEET_REVIEWS)) {
    const sheet = ss.insertSheet(SHEET_REVIEWS);
    sheet.appendRow(["ID", "WAKTU", "NAMA_BISNIS", "PEMILIK", "RATING", "ULASAN", "VERIFIKASI"]);
    sheet.setFrozenRows(1);
  }
}

/**
 * Handle GET Request (Mengambil Data untuk Website Pengguna & Admin)
 */
function doGet(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_DATA";

  try {
    if (action === "GET_DATA") {
      const sheet = ss.getSheetByName(SHEET_DATA);
      const data = sheet.getDataRange().getValues();
      
      let appData = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === "MAIN_CONFIG") {
          try {
            appData = JSON.parse(data[i][1]);
          } catch (err) {
            appData = null;
          }
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: appData,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "GET_LEADS") {
      const sheet = ss.getSheetByName(SHEET_ORDERS);
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const leads = [];

      for (let i = 1; i < rows.length; i++) {
        leads.push({
          id: rows[i][0],
          createdAt: rows[i][1],
          clientName: rows[i][2],
          phone: rows[i][3],
          packageName: rows[i][4],
          channel: rows[i][5],
          status: rows[i][6],
          notes: rows[i][7]
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: leads
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action not supported"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST Request (Menyimpan Perubahan Admin, Order Baru & Review)
 */
function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    let requestBody = {};
    if (e && e.postData && e.postData.contents) {
      requestBody = JSON.parse(e.postData.contents);
    }

    const action = requestBody.action || (e && e.parameter && e.parameter.action) || "SAVE_DATA";

    // 1. Simpan Seluruh Setting Admin (Paket, Tarif, Diskon, Kontak, Kantor)
    if (action === "SAVE_DATA") {
      const sheet = ss.getSheetByName(SHEET_DATA);
      const data = sheet.getDataRange().getValues();
      const payloadString = JSON.stringify(requestBody.payload);
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === "MAIN_CONFIG") {
          sheet.getRange(i + 1, 2).setValue(payloadString);
          sheet.getRange(i + 1, 3).setValue(now);
          found = true;
          break;
        }
      }

      if (!found) {
        sheet.appendRow(["MAIN_CONFIG", payloadString, now]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data berhasil disimpan ke Google Spreadsheet",
        updatedAt: now
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Simpan Order / Leads Pemesanan Baru
    if (action === "ADD_LEAD") {
      const sheet = ss.getSheetByName(SHEET_ORDERS);
      const lead = requestBody.lead || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      sheet.appendRow([
        lead.id || "lead-" + Date.now(),
        now,
        lead.clientName || "",
        lead.phone || "",
        lead.packageName || "",
        lead.channel || "",
        lead.status || "PENDING",
        lead.notes || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Pemesanan berhasil dicatat di Spreadsheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Simpan Ulasan Testimoni Pelanggan
    if (action === "ADD_REVIEW") {
      const sheet = ss.getSheetByName(SHEET_REVIEWS);
      const review = requestBody.review || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      sheet.appendRow([
        review.id || "rev-" + Date.now(),
        now,
        review.businessName || "",
        review.ownerName || "",
        review.rating || 5,
        review.comment || "",
        "VERIFIED"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Ulasan berhasil dicatat di Spreadsheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action unknown"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
