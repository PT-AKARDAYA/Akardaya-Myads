/**
 * AKARDAYA MYADS - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * Multi-Sheet Database Architecture (Satu Menu Satu Sheet Khusus)
 * 
 * Daftar 7 Sheet Database yang dibuat otomatis:
 * 1. PAKET_LANGGANAN     -> Data 8 Paket Langganan & Detail Fasilitas
 * 2. DISKON_ISI_ULANG    -> Setting Diskon Saldo, Timer Promo & Badge
 * 3. TARIF_SALURAN_IKLAN -> Katalog 20 Tarif SMS, LBA, MMS, RCS, WA WABA
 * 4. PENGATURAN_UMUM     -> Nomor WhatsApp, Brand, Email, Jam Operasional & Pengumuman
 * 5. LOKASI_CABANG       -> Daftar Kantor Cabang TDC Gresik, Surabaya, Jakarta, dll.
 * 6. TESTIMONI           -> Ulasan & Review Kepuasan Pelanggan
 * 7. PESANAN_LEADS       -> Catatan Formulir Masuk Pemesanan Klien
 * 
 * -------------------------------------------------------------
 * PETUNJUK PENERAPAN (DEPLOY):
 * 1. Buat Google Spreadsheet baru di Google Drive Anda (Beri nama: "Database Akardaya MyAds")
 * 2. Di Spreadsheet, klik menu: "Ekstensi" (Extensions) -> "Apps Script"
 * 3. Hapus semua kode bawaan, lalu Salin & Tempel (Paste) seluruh isi file ini
 * 4. Klik ikon "Simpan" (Save) 💾
 * 5. Klik tombol biru "Terapkan" (Deploy) -> "Penerapan Baru" (New deployment)
 * 6. Pilih jenis konfigurasi: "Aplikasi Web" (Web app)
 *    - Deskripsi: Database Multi-Sheet Akardaya MyAds
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses (Who has access): WAJIB pilih "Siapa saja" (Anyone)
 * 7. Klik "Terapkan" (Deploy), lalu Salin Web App URL (yang berakhiran "/exec")
 * 8. Tempelkan URL tersebut di Dashboard Admin Akardaya MyAds (Tab "Database Spreadsheet")
 * -------------------------------------------------------------
 */

// Konstanta Nama-Nama Sheet Sesuai Menu Dashboard
const SHEET_PACKAGES = "PAKET_LANGGANAN";
const SHEET_DISCOUNT = "DISKON_ISI_ULANG";
const SHEET_RATES = "TARIF_SALURAN_IKLAN";
const SHEET_CONFIG = "PENGATURAN_UMUM";
const SHEET_OFFICES = "LOKASI_CABANG";
const SHEET_TESTIMONIALS = "TESTIMONI";
const SHEET_LEADS = "PESANAN_LEADS";

/**
 * Inisialisasi Otomatis Seluruh Sheet & Header Kolom
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet PAKET_LANGGANAN
  if (!ss.getSheetByName(SHEET_PACKAGES)) {
    const s = ss.insertSheet(SHEET_PACKAGES);
    s.appendRow([
      "ID", "KATEGORI", "JUDUL_KATEGORI", "NAMA_PAKET", "TIER_BUDGET", "TAGLINE",
      "MIN_BUDGET", "MAX_BUDGET", "HARGA_TAMPILAN", "BADGE", "POPULER",
      "GRATIS_KONTEN_BULAN", "GRATIS_WEBSITE_BULAN", "TIPE_AKUN", "INFO_SALDO",
      "DESKRIPSI", "HIGHLIGHT_FITUR", "ID_TARIF_AKTIF"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#1E40AF"); // Blue header
  }

  // 2. Sheet DISKON_ISI_ULANG
  if (!ss.getSheetByName(SHEET_DISCOUNT)) {
    const s = ss.insertSheet(SHEET_DISCOUNT);
    s.appendRow([
      "PERSEN_DISKON", "STATUS_PROMO", "JUDUL_PROMO", "BADGE_PROMO",
      "DESKRIPSI_PROMO", "TANGGAL_BERAKHIR", "TERAKHIR_UPDATE"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#059669"); // Emerald header
  }

  // 3. Sheet TARIF_SALURAN_IKLAN
  if (!ss.getSheetByName(SHEET_RATES)) {
    const s = ss.insertSheet(SHEET_RATES);
    s.appendRow([
      "ID", "FASILITAS", "NAMA_FITUR", "TARIF_PER_UNIT", "TARIF_TAMPILAN",
      "SATUAN", "DESKRIPSI"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#4F46E5"); // Indigo header
  }

  // 4. Sheet PENGATURAN_UMUM
  if (!ss.getSheetByName(SHEET_CONFIG)) {
    const s = ss.insertSheet(SHEET_CONFIG);
    s.appendRow([
      "NAMA_BRAND", "TAGLINE", "NO_WHATSAPP", "TAMPILAN_NO_WA", "EMAIL_SUPPORT",
      "ALAMAT_KANTOR", "JAM_OPERASIONAL", "TEKS_PENGUMUMAN", "TAMPILKAN_PENGUMUMAN", "TERAKHIR_UPDATE"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#D97706"); // Amber header
  }

  // 5. Sheet LOKASI_CABANG
  if (!ss.getSheetByName(SHEET_OFFICES)) {
    const s = ss.insertSheet(SHEET_OFFICES);
    s.appendRow([
      "ID", "NAMA_CABANG", "TIPE", "KOTA", "ALAMAT_LENGKAP",
      "LATITUDE", "LONGITUDE", "NO_TELEPON", "WHATSAPP", "JAM_OPERASIONAL",
      "CABANG_UTAMA", "CATATAN"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#2563EB"); // Blue header
  }

  // 6. Sheet TESTIMONI
  if (!ss.getSheetByName(SHEET_TESTIMONIALS)) {
    const s = ss.insertSheet(SHEET_TESTIMONIALS);
    s.appendRow([
      "ID", "WAKTU", "NAMA_KLIEN", "BISNIS_TOKO", "PERAN_JABATAN",
      "RATING_BINTANG", "ISI_ULASAN", "NAMA_PAKET", "TERVERIFIKASI"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#7C3AED"); // Purple header
  }

  // 7. Sheet PESANAN_LEADS
  if (!ss.getSheetByName(SHEET_LEADS)) {
    const s = ss.insertSheet(SHEET_LEADS);
    s.appendRow([
      "ID", "WAKTU_ORDER", "NAMA_PELANGGAN", "NO_WHATSAPP", "NAMA_BISNIS",
      "PAKET_PILIHAN", "ESTIMASI_ANGGARAN", "TARGET_WILAYAH", "STATUS", "CATATAN"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#DC2626"); // Red header
  }

  // 8. Sheet ANALITIK_PENGUNJUNG (Analytics_Logs)
  if (!ss.getSheetByName("Analytics_Logs")) {
    const s = ss.insertSheet("Analytics_Logs");
    s.appendRow([
      "Tanggal (WIB)", "Visitor ID", "Total Hits", "Halaman Dikunjungi", "Perangkat", "Browser", "Sumber / Referrer", "Waktu Pertama (WIB)", "Terakhir Aktif (WIB)"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#0F766E"); // Teal header
  }

  // Hapus Sheet1 default jika kosong
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

/**
 * Utility Styling Header
 */
function formatHeader(sheet, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  headerRange.setBackground(bgColor);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
}

/**
 * Handle GET Request (Mengambil Data Lengkap dari 7 Sheet)
 */
function doGet(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_DATA";

  try {
    if (action === "GET_DATA") {
      const appData = readAllSheets(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: appData,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "GET_LEADS") {
      const leads = readLeadsSheet(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: leads
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "GET_ANALYTICS") {
      const analyticsLogs = readAnalyticsSheet(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: analyticsLogs,
        count: analyticsLogs.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Dukungan pelacakan via GET request
    if (action === "track_visitor") {
      const p = e && e.parameter ? e.parameter : {};
      const trackResult = recordVisitorLogConsolidated(ss, p);
      return ContentService.createTextOutput(JSON.stringify(trackResult)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenal"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST Request (Menyimpan Perubahan Langsung ke Sheet Terkait)
 */
function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    let requestBody = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        requestBody = {};
      }
    }
    if (e && e.parameter) {
      requestBody = Object.assign({}, e.parameter, requestBody);
    }

    const action = requestBody.action || (e && e.parameter && e.parameter.action) || "SAVE_DATA";

    // 1. Simpan Seluruh Pengaturan Admin ke Masing-Masing Sheet
    if (action === "SAVE_DATA") {
      const payload = requestBody.payload || {};
      saveAllSheets(ss, payload);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Semua pengaturan berhasil disimpan ke 7 sheet masing-masing di Google Spreadsheet",
        updatedAt: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Tambah Pesanan / Lead Baru ke Sheet PESANAN_LEADS
    if (action === "ADD_LEAD") {
      const sheet = ss.getSheetByName(SHEET_LEADS);
      const lead = requestBody.lead || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      sheet.appendRow([
        lead.id || "lead-" + Date.now(),
        now,
        lead.clientName || lead.customerName || "",
        lead.phone || lead.whatsapp || "",
        lead.businessName || "",
        lead.packageName || lead.selectedPackageName || "",
        lead.channel || lead.estimatedBudget || "",
        lead.targetCityOrArea || "",
        lead.status || "PENDING",
        lead.notes || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Pesanan baru berhasil dicatat di sheet PESANAN_LEADS"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Tambah Testimoni Baru ke Sheet TESTIMONI
    if (action === "ADD_REVIEW") {
      const sheet = ss.getSheetByName(SHEET_TESTIMONIALS);
      const review = requestBody.review || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      sheet.appendRow([
        review.id || "rev-" + Date.now(),
        now,
        review.name || review.ownerName || "",
        review.companyOrStore || review.businessName || "",
        review.role || "Pemilik Usaha",
        review.rating || 5,
        review.comment || "",
        review.packageName || "Paket MyAds",
        review.verified ? "YA" : "TIDAK"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Testimoni baru berhasil dicatat di sheet TESTIMONI"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Fitur Pelacakan Analitik Pengunjung (Hemat Baris per Hari)
    if (action === "track_visitor") {
      const trackResult = recordVisitorLogConsolidated(ss, requestBody);
      return ContentService.createTextOutput(JSON.stringify(trackResult)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenal"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * =========================================================================
 * FUNGSI BACA (READ) DARI 7 SHEET
 * =========================================================================
 */
function readAllSheets(ss) {
  const result = {
    packages: [],
    discountConfig: null,
    channelRates: [],
    companyConfig: null,
    offices: [],
    testimonials: [],
    orders: [],
    lastUpdated: new Date().toISOString()
  };

  // 1. Baca Sheet PAKET_LANGGANAN
  const sPkg = ss.getSheetByName(SHEET_PACKAGES);
  if (sPkg && sPkg.getLastRow() > 1) {
    const rows = sPkg.getRange(2, 1, sPkg.getLastRow() - 1, sPkg.getLastColumn()).getValues();
    result.packages = rows.map(r => ({
      id: String(r[0]),
      category: String(r[1]),
      categoryTitle: String(r[2]),
      name: String(r[3]),
      tierName: String(r[4]),
      tagline: String(r[5]),
      minBudget: Number(r[6]) || 0,
      maxBudget: r[7] ? Number(r[7]) : undefined,
      priceDisplay: String(r[8]),
      badge: r[9] ? String(r[9]) : undefined,
      isPopular: String(r[10]).toUpperCase() === "YA" || r[10] === true,
      freeContentPerMonth: Number(r[11]) || 0,
      freeWebsiteMonths: Number(r[12]) || 0,
      accountType: String(r[13]) || "Akun AD",
      saldoInfo: String(r[14]) || "SESUAI PAKET",
      description: String(r[15]),
      keyHighlights: r[16] ? String(r[16]).split("\n").filter(Boolean) : [],
      enabledRateIds: r[17] ? String(r[17]).split(",").map(s => s.trim()).filter(Boolean) : []
    }));
  }

  // 2. Baca Sheet DISKON_ISI_ULANG
  const sDisc = ss.getSheetByName(SHEET_DISCOUNT);
  if (sDisc && sDisc.getLastRow() > 1) {
    const r = sDisc.getRange(2, 1, 1, sDisc.getLastColumn()).getValues()[0];
    result.discountConfig = {
      reloadDiscountPercent: Number(r[0]) || 2,
      isPromoActive: String(r[1]).toUpperCase() === "AKTIF" || r[1] === true,
      promoTitle: String(r[2] || ""),
      promoBadge: String(r[3] || ""),
      promoDescription: String(r[4] || ""),
      promoCountdownEnd: r[5] ? String(r[5]) : undefined
    };
  }

  // 3. Baca Sheet TARIF_SALURAN_IKLAN
  const sRates = ss.getSheetByName(SHEET_RATES);
  if (sRates && sRates.getLastRow() > 1) {
    const rows = sRates.getRange(2, 1, sRates.getLastRow() - 1, sRates.getLastColumn()).getValues();
    result.channelRates = rows.map(r => ({
      id: String(r[0]),
      facility: String(r[1]),
      featureName: String(r[2]),
      ratePerUnit: Number(r[3]) || 0,
      rateDisplay: String(r[4]),
      unit: String(r[5]),
      description: String(r[6])
    }));
  }

  // 4. Baca Sheet PENGATURAN_UMUM
  const sConf = ss.getSheetByName(SHEET_CONFIG);
  if (sConf && sConf.getLastRow() > 1) {
    const r = sConf.getRange(2, 1, 1, sConf.getLastColumn()).getValues()[0];
    result.companyConfig = {
      brandName: String(r[0] || ""),
      brandTagline: String(r[1] || ""),
      waNumber: String(r[2] || ""),
      waDisplayNumber: String(r[3] || ""),
      supportEmail: String(r[4] || ""),
      officeAddress: String(r[5] || ""),
      operatingHours: String(r[6] || ""),
      announcementText: String(r[7] || ""),
      showAnnouncement: String(r[8]).toUpperCase() === "YA" || r[8] === true
    };
  }

  // 5. Baca Sheet LOKASI_CABANG
  const sOff = ss.getSheetByName(SHEET_OFFICES);
  if (sOff && sOff.getLastRow() > 1) {
    const rows = sOff.getRange(2, 1, sOff.getLastRow() - 1, sOff.getLastColumn()).getValues();
    result.offices = rows.map(r => ({
      id: String(r[0]),
      name: String(r[1]),
      type: String(r[2]) || "CABANG",
      cityName: String(r[3]),
      address: String(r[4]),
      latitude: Number(r[5]) || 0,
      longitude: Number(r[6]) || 0,
      phone: r[7] ? String(r[7]) : undefined,
      whatsapp: r[8] ? String(r[8]) : undefined,
      operatingHours: r[9] ? String(r[9]) : undefined,
      isPrimary: String(r[10]).toUpperCase() === "YA" || r[10] === true,
      notes: r[11] ? String(r[11]) : undefined
    }));
  }

  // 6. Baca Sheet TESTIMONI
  const sTest = ss.getSheetByName(SHEET_TESTIMONIALS);
  if (sTest && sTest.getLastRow() > 1) {
    const rows = sTest.getRange(2, 1, sTest.getLastRow() - 1, sTest.getLastColumn()).getValues();
    result.testimonials = rows.map(r => ({
      id: String(r[0]),
      date: String(r[1]),
      name: String(r[2]),
      companyOrStore: String(r[3]),
      role: String(r[4]),
      rating: Number(r[5]) || 5,
      comment: String(r[6]),
      packageName: String(r[7]),
      verified: String(r[8]).toUpperCase() === "YA" || r[8] === true
    }));
  }

  // 7. Baca Sheet PESANAN_LEADS
  result.orders = readLeadsSheet(ss);

  // 8. Baca Sheet Analytics_Logs (Log Pengunjung Riil)
  result.analyticsLogs = readAnalyticsSheet(ss);

  return result;
}

function readAnalyticsSheet(ss) {
  const sheet = ss.getSheetByName("Analytics_Logs");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const lastRow = sheet.getLastRow();
  const numRows = Math.min(lastRow - 1, 1000);
  const startRow = lastRow - numRows + 1;
  const lastCol = Math.max(sheet.getLastColumn(), 9);
  const rows = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

  return rows.map(r => {
    const col0 = String(r[0] || "");
    const col1 = String(r[1] || "");
    const col2 = r[2];
    // Check if new consolidated format where col2 is numeric Hits
    const isNumericHits = typeof col2 === "number" || (!isNaN(Number(col2)) && String(col2).trim() !== "" && !String(col2).includes("/"));
    
    if (isNumericHits) {
      const hits = Math.max(Number(col2) || 1, 1);
      const pages = String(r[3] || "/");
      const device = String(r[4] || "Unknown");
      const browser = String(r[5] || "Unknown");
      const referrer = String(r[6] || "Direct");
      const firstTime = String(r[7] || "");
      const lastTime = String(r[8] || "");
      const fullTimestamp = col0 + (lastTime ? " " + lastTime : "");

      return {
        timestamp: fullTimestamp,
        date: col0,
        visitorId: col1,
        hits: hits,
        page: pages,
        device: device,
        browser: browser,
        referrer: referrer,
        eventType: "pageview",
        firstTime: firstTime,
        lastTime: lastTime
      };
    } else {
      // Legacy format (8 columns without consolidation)
      return {
        timestamp: col0,
        visitorId: col1,
        hits: 1,
        page: String(r[2] || "/"),
        device: String(r[3] || "Unknown"),
        browser: String(r[4] || "Unknown"),
        referrer: String(r[5] || "Direct"),
        eventType: String(r[6] || "pageview"),
        screen: String(r[7] || "")
      };
    }
  }).reverse();
}

/**
 * Fungsi Pintar: Menghemat Baris Spreadsheet dengan Menggabungkan Kunjungan Visitor ID di Hari yang Sama
 */
function recordVisitorLogConsolidated(ss, p) {
  const analyticsSheetName = "Analytics_Logs";
  let sheet = ss.getSheetByName(analyticsSheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(analyticsSheetName);
    sheet.appendRow([
      "Tanggal (WIB)",
      "Visitor ID",
      "Total Hits",
      "Halaman Dikunjungi",
      "Perangkat",
      "Browser",
      "Sumber / Referrer",
      "Waktu Pertama (WIB)",
      "Terakhir Aktif (WIB)"
    ]);
    sheet.setFrozenRows(1);
    formatHeader(sheet, "#0F766E"); // Teal header
  }

  const visitorId = String(p.visitorId || "unknown").trim();
  const page = String(p.page || "/").trim();
  const device = String(p.device || "Unknown").trim();
  const browser = String(p.browser || "Unknown").trim();
  const referrer = String(p.referrer || "Direct").trim();

  // Waktu saat ini di zona Asia/Jakarta
  const now = new Date();
  const todayDateStr = Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM-dd");
  const timeNowStr = Utilities.formatDate(now, "Asia/Jakarta", "HH:mm:ss") + " WIB";

  const lastRow = sheet.getLastRow();
  let foundRowIndex = -1;
  let existingHits = 1;
  let existingPages = "";
  let existingFirstTime = timeNowStr;

  if (lastRow > 1) {
    // Cari dalam baris terbaru apakah ada visitorId yang sama di tanggal hari ini
    const checkRows = Math.min(lastRow - 1, 500);
    const startRow = lastRow - checkRows + 1;
    const maxCol = Math.max(sheet.getLastColumn(), 9);
    const dataRange = sheet.getRange(startRow, 1, checkRows, maxCol).getValues();

    for (let i = dataRange.length - 1; i >= 0; i--) {
      const row = dataRange[i];
      const rowDateOrTs = String(row[0] || "");
      const rowVisitorId = String(row[1] || "").trim();

      const isDateMatch = rowDateOrTs.indexOf(todayDateStr) !== -1;
      const isVisitorMatch = rowVisitorId === visitorId && visitorId !== "unknown";

      if (isDateMatch && isVisitorMatch) {
        foundRowIndex = startRow + i; // Baris riil di sheet (1-indexed)
        const col2Val = row[2];
        existingHits = Number(col2Val) || 1;
        existingPages = String(row[3] || "");
        existingFirstTime = String(row[7] || timeNowStr);
        break;
      }
    }
  }

  if (foundRowIndex > 0) {
    // PENGUNJUNG SAMA DI HARI YANG SAMA -> UPDATE BARIS (HEMAT BARIS!)
    const newHits = existingHits + 1;
    
    // Gabungkan riwayat halaman unik yang dikunjungi
    let pageList = existingPages ? existingPages.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
    if (pageList.indexOf(page) === -1) {
      pageList.push(page);
    }
    const updatedPages = pageList.join(", ");

    // Update kolom Total Hits (kolom 3), Halaman (kolom 4), Perangkat (kolom 5), Browser (kolom 6), Terakhir Aktif (kolom 9)
    sheet.getRange(foundRowIndex, 3).setValue(newHits);
    sheet.getRange(foundRowIndex, 4).setValue(updatedPages);
    if (device && device !== "Unknown") sheet.getRange(foundRowIndex, 5).setValue(device);
    if (browser && browser !== "Unknown") sheet.getRange(foundRowIndex, 6).setValue(browser);
    sheet.getRange(foundRowIndex, 9).setValue(timeNowStr);

    return {
      status: "success",
      message: "Visitor log consolidated (Row " + foundRowIndex + ", Total Hits: " + newHits + ")",
      consolidated: true,
      row: foundRowIndex,
      hits: newHits
    };
  } else {
    // PENGUNJUNG ATAU HARI BARU -> BUAT 1 BARIS BARU
    sheet.appendRow([
      todayDateStr,
      visitorId,
      1,
      page,
      device,
      browser,
      referrer,
      timeNowStr,
      timeNowStr
    ]);

    return {
      status: "success",
      message: "New daily visitor row created",
      consolidated: false,
      hits: 1
    };
  }
}

function readLeadsSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_LEADS);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    id: String(r[0]),
    createdAt: String(r[1]),
    customerName: String(r[2]),
    whatsapp: String(r[3]),
    businessName: r[4] ? String(r[4]) : undefined,
    selectedPackageId: "",
    selectedPackageName: String(r[5]),
    estimatedBudget: String(r[6]),
    targetCityOrArea: r[7] ? String(r[7]) : undefined,
    status: String(r[8]) || "PENDING",
    notes: r[9] ? String(r[9]) : ""
  }));
}

/**
 * =========================================================================
 * FUNGSI SIMPAN (WRITE) KE MASING-MASING SHEET
 * =========================================================================
 */
function saveAllSheets(ss, data) {
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  // 1. Tulis Sheet PAKET_LANGGANAN
  if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
    const s = ss.getSheetByName(SHEET_PACKAGES);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const pkgRows = data.packages.map(p => [
      p.id || "",
      p.category || "",
      p.categoryTitle || "",
      p.name || "",
      p.tierName || "",
      p.tagline || "",
      p.minBudget || 0,
      p.maxBudget || "",
      p.priceDisplay || "",
      p.badge || "",
      p.isPopular ? "YA" : "TIDAK",
      p.freeContentPerMonth || 0,
      p.freeWebsiteMonths || 0,
      p.accountType || "Akun AD",
      p.saldoInfo || "SESUAI PAKET",
      p.description || "",
      (p.keyHighlights || []).join("\n"),
      (p.enabledRateIds || []).join(",")
    ]);
    s.getRange(2, 1, pkgRows.length, pkgRows[0].length).setValues(pkgRows);
  }

  // 2. Tulis Sheet DISKON_ISI_ULANG
  if (data.discountConfig) {
    const s = ss.getSheetByName(SHEET_DISCOUNT);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const d = data.discountConfig;
    s.getRange(2, 1, 1, 7).setValues([[
      d.reloadDiscountPercent || 2,
      d.isPromoActive ? "AKTIF" : "NONAKTIF",
      d.promoTitle || "",
      d.promoBadge || "",
      d.promoDescription || "",
      d.promoCountdownEnd || "",
      now
    ]]);
  }

  // 3. Tulis Sheet TARIF_SALURAN_IKLAN
  if (data.channelRates && Array.isArray(data.channelRates) && data.channelRates.length > 0) {
    const s = ss.getSheetByName(SHEET_RATES);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const rateRows = data.channelRates.map(r => [
      r.id || "",
      r.facility || "",
      r.featureName || "",
      r.ratePerUnit || 0,
      r.rateDisplay || "",
      r.unit || "",
      r.description || ""
    ]);
    s.getRange(2, 1, rateRows.length, rateRows[0].length).setValues(rateRows);
  }

  // 4. Tulis Sheet PENGATURAN_UMUM
  if (data.companyConfig) {
    const s = ss.getSheetByName(SHEET_CONFIG);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const c = data.companyConfig;
    s.getRange(2, 1, 1, 10).setValues([[
      c.brandName || "",
      c.brandTagline || "",
      c.waNumber || "",
      c.waDisplayNumber || "",
      c.supportEmail || "",
      c.officeAddress || "",
      c.operatingHours || "",
      c.announcementText || "",
      c.showAnnouncement ? "YA" : "TIDAK",
      now
    ]]);
  }

  // 5. Tulis Sheet LOKASI_CABANG
  if (data.offices && Array.isArray(data.offices) && data.offices.length > 0) {
    const s = ss.getSheetByName(SHEET_OFFICES);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const offRows = data.offices.map(o => [
      o.id || "",
      o.name || "",
      o.type || "CABANG",
      o.cityName || "",
      o.address || "",
      o.latitude || 0,
      o.longitude || 0,
      o.phone || "",
      o.whatsapp || "",
      o.operatingHours || "",
      o.isPrimary ? "YA" : "TIDAK",
      o.notes || ""
    ]);
    s.getRange(2, 1, offRows.length, offRows[0].length).setValues(offRows);
  }

  // 6. Tulis Sheet TESTIMONI
  if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    const s = ss.getSheetByName(SHEET_TESTIMONIALS);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const testRows = data.testimonials.map(t => [
      t.id || "",
      t.date || now,
      t.name || "",
      t.companyOrStore || "",
      t.role || "",
      t.rating || 5,
      t.comment || "",
      t.packageName || "",
      t.verified ? "YA" : "TIDAK"
    ]);
    s.getRange(2, 1, testRows.length, testRows[0].length).setValues(testRows);
  }
}

/**
 * =========================================================================
 * CORS PREFLIGHT (OPTIONS)
 * =========================================================================
 * Mencegah error CORS ketika dipanggil secara fetch() dari browser.
 */
function doOptions(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}
