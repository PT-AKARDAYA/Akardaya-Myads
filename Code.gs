/**
 * AKARDAYA MYADS - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * Multi-Sheet Database Architecture (Satu Menu Satu Sheet Khusus)
 * 
 * Daftar 9 Sheet Database yang dibuat & dikelola otomatis:
 * 1. PAKET_LANGGANAN     -> Data Paket Langganan & Detail Fasilitas
 * 2. DISKON_ISI_ULANG    -> Setting Promo & Bonus Saldo per Tier Nominal (SKEMA_TIERS_JSON)
 * 3. TARIF_SALURAN_IKLAN -> Katalog Tarif Saluran Iklan (SMS, LBA, MMS, RCS, WA WABA)
 * 4. PENGATURAN_UMUM     -> Nomor WhatsApp, Brand, Email, Jam Operasional & Pengumuman
 * 5. REKENING_BANK       -> Multi Rekening Resmi Pembayaran (1 Baris = 1 Rekening Bank)
 * 6. LOKASI_CABANG       -> Daftar Kantor Cabang & Koordinat Peta
 * 7. TESTIMONI           -> Ulasan & Review Kepuasan Pelanggan
 * 8. PESANAN_LEADS       -> Catatan Formulir Masuk Pemesanan Klien
 * 9. Analytics_Logs      -> Log Pengunjung Riil + ISP Provider & Kota/Lokasi (Hemat Baris Harian)
 * 
 * -------------------------------------------------------------
 * PETUNJUK PENERAPAN (DEPLOY):
 * 1. Buka Google Spreadsheet Anda
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
const SHEET_BANKS = "REKENING_BANK";
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

  // 2. Sheet DISKON_ISI_ULANG (Mendukung SKEMA_TIERS_JSON)
  if (!ss.getSheetByName(SHEET_DISCOUNT)) {
    const s = ss.insertSheet(SHEET_DISCOUNT);
    s.appendRow([
      "PERSEN_DISKON", "STATUS_PROMO", "JUDUL_PROMO", "BADGE_PROMO",
      "DESKRIPSI_PROMO", "TANGGAL_BERAKHIR", "SKEMA_TIERS_JSON", "TERAKHIR_UPDATE"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#059669"); // Emerald header
  } else {
    const s = ss.getSheetByName(SHEET_DISCOUNT);
    const headers = [
      "PERSEN_DISKON", "STATUS_PROMO", "JUDUL_PROMO", "BADGE_PROMO",
      "DESKRIPSI_PROMO", "TANGGAL_BERAKHIR", "SKEMA_TIERS_JSON", "TERAKHIR_UPDATE"
    ];
    s.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeader(s, "#059669");
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

  // 4. Sheet PENGATURAN_UMUM (Termasuk DAFTAR_REKENING_JSON)
  const configHeaders = [
    "NAMA_BRAND", "TAGLINE", "NO_WHATSAPP", "TAMPILAN_NO_WA", "EMAIL_SUPPORT",
    "ALAMAT_KANTOR", "JAM_OPERASIONAL", "TEKS_PENGUMUMAN", "TAMPILKAN_PENGUMUMAN", "TERAKHIR_UPDATE",
    "NAMA_BANK", "NO_REKENING", "ATAS_NAMA", "PANDUAN_PEMBAYARAN", "DAFTAR_REKENING_JSON"
  ];
  if (!ss.getSheetByName(SHEET_CONFIG)) {
    const s = ss.insertSheet(SHEET_CONFIG);
    s.appendRow(configHeaders);
    s.setFrozenRows(1);
    formatHeader(s, "#D97706"); // Amber header
  } else {
    const s = ss.getSheetByName(SHEET_CONFIG);
    if (s.getLastRow() >= 1) {
      s.getRange(1, 1, 1, configHeaders.length).setValues([configHeaders]);
      formatHeader(s, "#D97706");
    }
  }

  // 5. Sheet REKENING_BANK (Khusus Multi-Rekening Resmi - 1 Baris per Rekening)
  const bankHeaders = [
    "ID", "NAMA_BANK", "NO_REKENING", "ATAS_NAMA", "REKENING_UTAMA", "STATUS_AKTIF", "CATATAN"
  ];
  if (!ss.getSheetByName(SHEET_BANKS)) {
    const s = ss.insertSheet(SHEET_BANKS);
    s.appendRow(bankHeaders);
    s.setFrozenRows(1);
    formatHeader(s, "#047857"); // Emerald green header
  } else {
    const s = ss.getSheetByName(SHEET_BANKS);
    if (s.getLastRow() >= 1) {
      s.getRange(1, 1, 1, bankHeaders.length).setValues([bankHeaders]);
      formatHeader(s, "#047857");
    }
  }

  // 6. Sheet LOKASI_CABANG
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

  // 7. Sheet PESANAN_LEADS (Lengkap dengan Email Akun MyAds & Parameter Kampanye Profiling Terbaru)
  const LEADS_HEADERS = [
    "ID", "WAKTU_ORDER", "NAMA_PELANGGAN", "NO_WHATSAPP", "NAMA_BISNIS", "EMAIL_MYADS",
    "PAKET_PILIHAN", "ESTIMASI_ANGGARAN", "TOTAL_PEMBAYARAN", "TIPE_KAMPANYE", "SALURAN_MEDIA", "ESTIMASI_JANGKAUAN",
    "TARGET_WILAYAH", "SASARAN_PROVINSI", "SASARAN_KOTA", "SASARAN_KECAMATAN", "SASARAN_KELURAHAN",
    "TITIK_GPS_LAT", "TITIK_GPS_LNG", "RADIUS_LBA", "ALAMAT_GPS",
    "TANGGAL_BROADCAST", "SENDER_ID", "ISI_PESAN_IKLAN", "LINK_WEB",
    "FILE_LIST_KONTAK", "JUMLAH_KONTAK_FILE",
    "TARGET_USIA", "TARGET_GENDER", "TARGET_AGAMA", "TARGET_ARPU", "TARGET_SES", "TARGET_DEVICE_OS", "TARGET_PERNIKAHAN", "TARGET_MINAT",
    "STATUS", "CATATAN"
  ];

  if (!ss.getSheetByName(SHEET_LEADS)) {
    const s = ss.insertSheet(SHEET_LEADS);
    s.appendRow(LEADS_HEADERS);
    s.setFrozenRows(1);
    formatHeader(s, "#DC2626"); // Red header
  } else {
    const s = ss.getSheetByName(SHEET_LEADS);
    if (s.getLastRow() >= 1) {
      const curHeaders = s.getRange(1, 1, 1, Math.max(s.getLastColumn(), 1)).getValues()[0];
      if (curHeaders.indexOf("EMAIL_MYADS") === -1 || curHeaders.length < LEADS_HEADERS.length) {
        s.getRange(1, 1, 1, LEADS_HEADERS.length).setValues([LEADS_HEADERS]);
        formatHeader(s, "#DC2626");
      }
    }
  }

  // 8. Sheet ANALITIK_PENGUNJUNG (Analytics_Logs dengan ISP & Lokasi)
  const ANALYTICS_HEADERS = [
    "Tanggal (WIB)", "Visitor ID", "Total Hits", "Halaman Dikunjungi", "Perangkat", "Browser", "ISP Provider", "Kota / Lokasi", "Sumber / Referrer", "Waktu Pertama (WIB)", "Terakhir Aktif (WIB)"
  ];
  if (!ss.getSheetByName("Analytics_Logs")) {
    const s = ss.insertSheet("Analytics_Logs");
    s.appendRow(ANALYTICS_HEADERS);
    s.setFrozenRows(1);
    formatHeader(s, "#0F766E"); // Teal header
  } else {
    const s = ss.getSheetByName("Analytics_Logs");
    if (s.getLastRow() >= 1) {
      const headerValues = s.getRange(1, 1, 1, Math.max(s.getLastColumn(), ANALYTICS_HEADERS.length)).getDisplayValues()[0];
      const headerStr = headerValues.join(" ").toLowerCase();
      if (headerStr.indexOf("isp") === -1 || headerStr.indexOf("kota") === -1) {
        s.getRange(1, 1, 1, ANALYTICS_HEADERS.length).setValues([ANALYTICS_HEADERS]);
        formatHeader(s, "#0F766E");
      }
    }
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
 * Handle GET Request (Mengambil Data Lengkap dari Sheet)
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

    if (action === "DEDUPLICATE_ANALYTICS" || action === "CLEAN_DUPLICATES") {
      const dedupResult = deduplicateAnalyticsSheet(ss);
      return ContentService.createTextOutput(JSON.stringify(dedupResult)).setMimeType(ContentService.MimeType.JSON);
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
        message: "Semua pengaturan berhasil disimpan ke sheet masing-masing di Google Spreadsheet",
        updatedAt: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Tambah Pesanan / Lead Baru ke Sheet PESANAN_LEADS
    if (action === "ADD_LEAD") {
      const sheet = ss.getSheetByName(SHEET_LEADS);
      const lead = requestBody.lead || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      const targetInterestsStr = Array.isArray(lead.targetInterests)
        ? lead.targetInterests.join(", ")
        : (lead.targetInterests || "");

      sheet.appendRow([
        lead.id || "ORD-" + Date.now().toString().slice(-6),
        now,
        lead.customerName || lead.clientName || "",
        lead.whatsapp || lead.phone || "",
        lead.businessName || "",
        lead.myAdsEmail || "",
        lead.selectedPackageName || lead.packageName || "",
        lead.estimatedBudget || "",
        lead.totalPayment ? ("Rp " + Number(lead.totalPayment).toLocaleString("id-ID")) : (lead.estimatedBudget || ""),
        lead.campaignType || "",
        lead.channelName || lead.channel || "",
        lead.estimatedReach || "",
        lead.targetCityOrArea || "",
        lead.targetProvince || "",
        lead.targetCity || "",
        lead.targetDistrict || "",
        lead.targetVillage || "",
        lead.latitude || "",
        lead.longitude || "",
        lead.radiusMeters ? (lead.radiusMeters + " Meter") : "",
        lead.streetAddress || "",
        lead.broadcastDate || "",
        lead.senderName || "",
        lead.adMessageContent || "",
        lead.webLink || "",
        lead.uploadedListFileName ? (lead.uploadedListFileName + (lead.uploadedListFileSize ? (" (" + lead.uploadedListFileSize + ")") : "")) : "",
        lead.uploadedListFileCount || "",
        lead.targetAgeGroup || "",
        lead.targetGender || "",
        lead.targetReligion || "",
        lead.targetArpuSpending || "",
        lead.targetSes || "",
        lead.targetDeviceOs || "",
        lead.targetMaritalStatus || "",
        targetInterestsStr,
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

    // 5. Bersihkan Log Analitik Pengunjung
    if (action === "CLEAR_ANALYTICS") {
      const sheet = ss.getSheetByName("Analytics_Logs");
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Seluruh data log pengunjung di sheet Analytics_Logs berhasil dibersihkan"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. Gabungkan / Bersihkan Baris Duplikat (Hemat Baris)
    if (action === "DEDUPLICATE_ANALYTICS" || action === "CLEAN_DUPLICATES") {
      const dedupResult = deduplicateAnalyticsSheet(ss);
      return ContentService.createTextOutput(JSON.stringify(dedupResult)).setMimeType(ContentService.MimeType.JSON);
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
 * FUNGSI BACA (READ) DARI SELURUH SHEET
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
    analyticsLogs: [],
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

  // 2. Baca Sheet DISKON_ISI_ULANG (Termasuk Skema Tiers)
  const sDisc = ss.getSheetByName(SHEET_DISCOUNT);
  if (sDisc && sDisc.getLastRow() > 1) {
    const lastCol = Math.max(sDisc.getLastColumn(), 8);
    const r = sDisc.getRange(2, 1, 1, lastCol).getValues()[0];
    let monetaryTiers = [];
    if (r[6]) {
      try {
        const parsed = JSON.parse(String(r[6]));
        if (Array.isArray(parsed) && parsed.length > 0) {
          monetaryTiers = parsed;
        }
      } catch (err) {}
    }
    result.discountConfig = {
      reloadDiscountPercent: Number(r[0]) || 50,
      isPromoActive: String(r[1]).toUpperCase() === "AKTIF" || r[1] === true,
      promoTitle: String(r[2] || ""),
      promoBadge: String(r[3] || ""),
      promoDescription: String(r[4] || ""),
      promoCountdownEnd: r[5] ? String(r[5]) : undefined,
      monetaryTiers: monetaryTiers.length > 0 ? monetaryTiers : undefined
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
    const r = sConf.getRange(2, 1, 1, Math.max(sConf.getLastColumn(), 15)).getValues()[0];
    
    var parsedBankAccounts = [];
    if (r[14]) {
      try {
        var rawJson = typeof r[14] === "string" ? JSON.parse(r[14]) : r[14];
        if (Array.isArray(rawJson) && rawJson.length > 0) {
          parsedBankAccounts = rawJson;
        }
      } catch (errJson) {
        parsedBankAccounts = [];
      }
    }

    if (parsedBankAccounts.length === 0 && (r[10] || r[11])) {
      parsedBankAccounts = [
        {
          id: "bank-primary-1",
          bankName: String(r[10] || "BCA (Bank Central Asia)"),
          accountNumber: String(r[11] || "0188-3333-7157"),
          accountHolder: String(r[12] || "PT Akardaya Telekomunikasi Indonesia"),
          isPrimary: true,
          isActive: true,
          notes: "Rekening Utama"
        }
      ];
    }

    result.companyConfig = {
      brandName: String(r[0] || ""),
      brandTagline: String(r[1] || ""),
      waNumber: String(r[2] || ""),
      waDisplayNumber: String(r[3] || ""),
      supportEmail: String(r[4] || ""),
      officeAddress: String(r[5] || ""),
      operatingHours: String(r[6] || ""),
      announcementText: String(r[7] || ""),
      showAnnouncement: String(r[8]).toUpperCase() === "YA" || r[8] === true,
      bankName: r[10] ? String(r[10]) : undefined,
      bankAccountNumber: r[11] ? String(r[11]) : undefined,
      bankAccountHolder: r[12] ? String(r[12]) : undefined,
      paymentInstructions: r[13] ? String(r[13]) : undefined,
      bankAccounts: parsedBankAccounts
    };
  }

  // 5. Baca Sheet REKENING_BANK (Daftar Multi-Rekening Resmi)
  const sBanks = ss.getSheetByName(SHEET_BANKS);
  if (sBanks && sBanks.getLastRow() > 1) {
    const bankRows = sBanks.getRange(2, 1, sBanks.getLastRow() - 1, sBanks.getLastColumn()).getValues();
    const loadedBanks = bankRows.map(function(r, idx) {
      const isPri = String(r[4]).toUpperCase() === "YA" || r[4] === true;
      const isAct = String(r[5]).toUpperCase() !== "NONAKTIF" && String(r[5]).toUpperCase() !== "TIDAK" && r[5] !== false;
      return {
        id: r[0] ? String(r[0]) : ("bank_" + (idx + 1)),
        bankName: String(r[1] || ""),
        accountNumber: String(r[2] || ""),
        accountHolder: String(r[3] || "PT Akardaya Telekomunikasi Indonesia"),
        isPrimary: isPri,
        isActive: isAct,
        notes: String(r[6] || "")
      };
    }).filter(function(b) {
      return Boolean(b.bankName && b.accountNumber);
    });

    if (loadedBanks.length > 0) {
      if (!loadedBanks.some(function(b) { return b.isPrimary; })) {
        loadedBanks[0].isPrimary = true;
      }
      result.companyConfig.bankAccounts = loadedBanks;
      const pri = loadedBanks.find(function(b) { return b.isPrimary; }) || loadedBanks[0];
      if (pri) {
        result.companyConfig.bankName = pri.bankName;
        result.companyConfig.bankAccountNumber = pri.accountNumber;
        result.companyConfig.bankAccountHolder = pri.accountHolder;
      }
    }
  }

  // 6. Baca Sheet LOKASI_CABANG
  const sOff = ss.getSheetByName(SHEET_OFFICES);
  if (sOff && sOff.getLastRow() > 1) {
    const rows = sOff.getRange(2, 1, sOff.getLastRow() - 1, sOff.getLastColumn()).getValues();
    result.offices = rows.map((r, idx) => {
      var lat = 0;
      var lng = 0;
      if (r[5] !== "" && r[5] !== null && r[5] !== undefined) {
        lat = typeof r[5] === "number" ? r[5] : parseFloat(String(r[5]).replace(",", ".").trim());
        if (isNaN(lat)) lat = 0;
      }
      if (r[6] !== "" && r[6] !== null && r[6] !== undefined) {
        lng = typeof r[6] === "number" ? r[6] : parseFloat(String(r[6]).replace(",", ".").trim());
        if (isNaN(lng)) lng = 0;
      }
      var typeStr = String(r[2] || "CABANG").trim().toUpperCase();
      var normType = typeStr.indexOf("PUSAT") !== -1 ? "PUSAT" : "CABANG";
      return {
        id: String(r[0] || ("office_" + new Date().getTime() + "_" + idx)),
        name: String(r[1] || "Kantor Cabang"),
        type: normType,
        cityName: String(r[3] || ""),
        address: String(r[4] || ""),
        latitude: lat,
        longitude: lng,
        phone: r[7] ? String(r[7]) : undefined,
        whatsapp: r[8] ? String(r[8]) : undefined,
        operatingHours: r[9] ? String(r[9]) : undefined,
        isPrimary: String(r[10]).toUpperCase() === "YA" || r[10] === true,
        notes: r[11] ? String(r[11]) : undefined
      };
    });
  }

  // 6. Baca Sheet TESTIMONI
  const sTest = ss.getSheetByName(SHEET_TESTIMONIALS);
  if (sTest && sTest.getLastRow() > 1) {
    const rows = sTest.getRange(2, 1, sTest.getLastRow() - 1, sTest.getLastColumn()).getValues();
    result.testimonials = rows.map(t => ({
      id: String(t[0]),
      date: String(t[1]),
      name: String(t[2]),
      companyOrStore: String(t[3]),
      role: String(t[4]),
      rating: Number(t[5]) || 5,
      comment: String(t[6]),
      packageName: String(t[7]),
      verified: String(t[8]).toUpperCase() === "YA" || r[8] === true
    }));
  }

  // 7. Baca Sheet PESANAN_LEADS
  result.orders = readLeadsSheet(ss);

  // 8. Baca Sheet Analytics_Logs (Log Pengunjung Riil + ISP & Lokasi)
  result.analyticsLogs = readAnalyticsSheet(ss);

  return result;
}

function readAnalyticsSheet(ss) {
  const sheet = ss.getSheetByName("Analytics_Logs");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const lastRow = sheet.getLastRow();
  const numRows = Math.min(lastRow - 1, 1000);
  const startRow = 2;
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const rows = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

  // Helper pencari indeks kolom dinamis berdasarkan kata kunci header
  function findCol(keywords, defaultIdx) {
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || "").toLowerCase();
      for (let k = 0; k < keywords.length; k++) {
        if (h.indexOf(keywords[k]) !== -1) return i;
      }
    }
    return defaultIdx;
  }

  const colDateIdx = findCol(["tanggal", "date"], 0);
  const colVisitorIdx = findCol(["visitor", "id pengunjung", "id"], 1);
  const colHitsIdx = findCol(["hits", "total", "frekuensi"], 2);
  const colPageIdx = findCol(["halaman", "page"], 3);
  const colDeviceIdx = findCol(["perangkat", "device"], 4);
  const colBrowserIdx = findCol(["browser"], 5);
  const colIspIdx = findCol(["isp", "provider"], 6);
  const colLocIdx = findCol(["kota", "lokasi", "city", "wilayah"], 7);
  const colRefIdx = findCol(["sumber", "referrer"], 8);
  const colFirstTimeIdx = findCol(["pertama", "first"], 9);
  const colLastTimeIdx = findCol(["terakhir", "last"], 10);

  return rows.map(r => {
    const rawDate = r[colDateIdx];
    let dateStr = "";
    if (rawDate instanceof Date) {
      try {
        dateStr = Utilities.formatDate(rawDate, "Asia/Jakarta", "yyyy-MM-dd");
      } catch(e) {
        dateStr = String(rawDate || "").trim();
      }
    } else {
      dateStr = String(rawDate || "").trim();
    }

    const visitorId = String(r[colVisitorIdx] || "").trim();
    const rawHits = r[colHitsIdx];
    const isNumericHits = typeof rawHits === "number" || (!isNaN(Number(rawHits)) && String(rawHits).trim() !== "" && !String(rawHits).includes("/"));
    const hits = isNumericHits ? Math.max(Number(rawHits) || 1, 1) : 1;

    const pages = String(r[colPageIdx] || "/").trim();
    const device = String(r[colDeviceIdx] || "Unknown").trim();
    const browser = String(r[colBrowserIdx] || "Unknown").trim();
    
    // ISP Provider Murni Tanpa Dummy
    let isp = "-";
    if (colIspIdx !== -1 && r[colIspIdx]) {
      const rawIsp = String(r[colIspIdx]).trim();
      if (rawIsp && rawIsp !== "-" && rawIsp.toLowerCase() !== "undefined") {
        isp = rawIsp;
      }
    }

    // Kota / Lokasi Murni Tanpa Dummy
    let city = "-";
    let region = "";
    if (colLocIdx !== -1 && r[colLocIdx]) {
      const rawLoc = String(r[colLocIdx]).trim();
      if (rawLoc && rawLoc !== "-" && rawLoc.toLowerCase() !== "undefined") {
        if (rawLoc.includes(",")) {
          const parts = rawLoc.split(",");
          city = parts[0].trim();
          region = parts.slice(1).join(",").trim();
        } else {
          city = rawLoc;
        }
      }
    }

    // Referrer
    let referrer = "Akses Langsung";
    if (colRefIdx !== -1 && r[colRefIdx]) {
      const rawRef = String(r[colRefIdx]).trim();
      if (rawRef && rawRef !== "-" && rawRef.toLowerCase() !== "direct" && rawRef.toLowerCase() !== "langsung") {
        referrer = rawRef;
      }
    }

    const firstTime = colFirstTimeIdx !== -1 && r[colFirstTimeIdx] ? String(r[colFirstTimeIdx]).trim() : "";
    const lastTime = colLastTimeIdx !== -1 && r[colLastTimeIdx] ? String(r[colLastTimeIdx]).trim() : "";
    const fullTimestamp = dateStr + (lastTime ? " " + lastTime : (firstTime ? " " + firstTime : ""));

    return {
      timestamp: fullTimestamp || dateStr,
      date: dateStr,
      visitorId: visitorId,
      hits: hits,
      page: pages,
      device: device,
      browser: browser,
      isp: isp,
      city: city,
      region: region,
      referrer: referrer,
      eventType: "pageview",
      firstTime: firstTime,
      lastTime: lastTime
    };
  }).reverse();
}

/**
 * Fungsi Pintar: Menghemat Baris Spreadsheet dengan Menggabungkan Kunjungan Visitor ID / Device di Hari yang Sama.
 * Jika ditemukan baris duplikat dengan tanggal & visitor/device yang sama, baris akan digabungkan secara otomatis (Auto-Deduplicate).
 */
function recordVisitorLogConsolidated(ss, p) {
  const analyticsSheetName = "Analytics_Logs";
  let sheet = ss.getSheetByName(analyticsSheetName);
  
  const modernHeaders = [
    "Tanggal (WIB)",
    "Visitor ID",
    "Total Hits",
    "Halaman Dikunjungi",
    "Perangkat",
    "Browser",
    "ISP Provider",
    "Kota / Lokasi",
    "Sumber / Referrer",
    "Waktu Pertama (WIB)",
    "Terakhir Aktif (WIB)"
  ];

  if (!sheet) {
    sheet = ss.insertSheet(analyticsSheetName);
    sheet.appendRow(modernHeaders);
    sheet.setFrozenRows(1);
    formatHeader(sheet, "#0F766E"); // Teal header
  } else {
    // Periksa apakah header masih versi lama (misal belum ada ISP & Kota)
    const firstRowValues = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), modernHeaders.length)).getDisplayValues()[0];
    const headerStr = firstRowValues.join(" ").toLowerCase();
    if (headerStr.indexOf("isp") === -1 || headerStr.indexOf("kota") === -1) {
      sheet.getRange(1, 1, 1, modernHeaders.length).setValues([modernHeaders]);
      formatHeader(sheet, "#0F766E");
    }
  }

  // Gunakan LockService dengan waitLock agar request simultan mengantri dengan aman
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    lock.waitLock(30000);
    hasLock = true;
  } catch (e) {
    try {
      hasLock = lock.tryLock(10000);
    } catch (e2) {}
  }

  try {
    const visitorId = String(p.visitorId || "unknown").trim();
    const page = String(p.page || "/").trim();
    const device = String(p.device || "Unknown").trim();
    const browser = String(p.browser || "Unknown").trim();
    const isp = String(p.isp || p.org || "-").trim();
    const location = String(p.location || (p.city ? (p.city + (p.region ? ", " + p.region : "")) : "-")).trim();
    const referrer = String(p.referrer || "Direct").trim();

    // Waktu saat ini di zona Asia/Jakarta (WIB)
    const now = new Date();
    const todayDateStr = Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM-dd");
    const timeNowStr = Utilities.formatDate(now, "Asia/Jakarta", "HH:mm:ss") + " WIB";

    const lastRow = sheet.getLastRow();
    
    // Cari SEMUA baris yang cocok pada hari yang sama
    const matchingRowIndices = [];
    let masterRowIndex = -1;
    let combinedHits = 0;
    const combinedPagesSet = {};
    let earliestFirstTime = "";
    let existingIsp = isp;
    let existingLoc = location;

    if (lastRow > 1) {
      const checkRows = Math.min(lastRow - 1, 1000);
      const startRow = lastRow - checkRows + 1;
      const maxCol = Math.max(sheet.getLastColumn(), 11);
      const displayRange = sheet.getRange(startRow, 1, checkRows, maxCol).getDisplayValues();
      const rawRange = sheet.getRange(startRow, 1, checkRows, maxCol).getValues();

      // Scan seluruh baris dalam rentang pemeriksaan
      for (let i = 0; i < displayRange.length; i++) {
        const rowDisplay = displayRange[i];
        const rowRaw = rawRange[i];

        // Normalisasi tanggal baris
        let rowDateStr = String(rowDisplay[0] || "").trim();
        if (rowRaw[0] instanceof Date) {
          try {
            rowDateStr = Utilities.formatDate(rowRaw[0], "Asia/Jakarta", "yyyy-MM-dd");
          } catch(err) {}
        }
        if (rowDateStr.length > 10) {
          rowDateStr = rowDateStr.substring(0, 10);
        }

        const rowVisitorId = String(rowDisplay[1] || rowRaw[1] || "").trim();
        const rowDevice = String(rowDisplay[4] || rowRaw[4] || "").trim();
        const rowBrowser = String(rowDisplay[5] || rowRaw[5] || "").trim();

        const isDateMatch = rowDateStr === todayDateStr || rowDateStr.indexOf(todayDateStr) !== -1;
        
        // Pencocokan: Berdasarkan Visitor ID yang sama ATAU Perangkat & Browser yang sama di hari yang sama
        const isVisitorMatch = visitorId !== "unknown" && rowVisitorId === visitorId;
        const isDeviceMatch = isDateMatch && device !== "Unknown" && rowDevice === device && (browser === "Unknown" || rowBrowser === browser || !rowBrowser);

        if (isDateMatch && (isVisitorMatch || isDeviceMatch)) {
          const actualRowIndex = startRow + i;
          matchingRowIndices.push(actualRowIndex);

          const rowHits = Number(rowRaw[2]) || Number(rowDisplay[2]) || 1;
          combinedHits += rowHits;

          // Kumpulkan halaman unik
          const rowPages = String(rowDisplay[3] || rowRaw[3] || "");
          if (rowPages) {
            rowPages.split(",").forEach(function(s) {
              const cleanP = s.trim();
              if (cleanP) combinedPagesSet[cleanP] = true;
            });
          }

          // Catat waktu pertama terawal
          const rowFirstTime = String(rowDisplay[9] || rowRaw[9] || "").trim();
          if (rowFirstTime && (!earliestFirstTime || rowFirstTime < earliestFirstTime)) {
            earliestFirstTime = rowFirstTime;
          }

          // Simpan info ISP & Lokasi jika baris sebelumnya sudah ada
          const rowIsp = String(rowDisplay[6] || rowRaw[6] || "").trim();
          if (rowIsp && rowIsp !== "-") existingIsp = rowIsp;

          const rowLoc = String(rowDisplay[7] || rowRaw[7] || "").trim();
          if (rowLoc && rowLoc !== "-") existingLoc = rowLoc;
        }
      }
    }

    // Tambahkan halaman kunjungan saat ini ke daftar halaman
    if (page) {
      combinedPagesSet[page] = true;
    }
    const allPagesArray = Object.keys(combinedPagesSet);
    const updatedPagesStr = allPagesArray.length > 0 ? allPagesArray.join(", ") : page;

    if (matchingRowIndices.length > 0) {
      // Baris pertama yang cocok dijadikan MASTER ROW (HEMAT BARIS!)
      masterRowIndex = matchingRowIndices[0];
      const newTotalHits = combinedHits + 1;
      const finalFirstTime = earliestFirstTime || timeNowStr;

      sheet.getRange(masterRowIndex, 3).setValue(newTotalHits);
      sheet.getRange(masterRowIndex, 4).setValue(updatedPagesStr);
      if (device && device !== "Unknown") sheet.getRange(masterRowIndex, 5).setValue(device);
      if (browser && browser !== "Unknown") sheet.getRange(masterRowIndex, 6).setValue(browser);
      if (existingIsp && existingIsp !== "-") sheet.getRange(masterRowIndex, 7).setValue(existingIsp);
      if (existingLoc && existingLoc !== "-") sheet.getRange(masterRowIndex, 8).setValue(existingLoc);
      if (finalFirstTime) sheet.getRange(masterRowIndex, 10).setValue(finalFirstTime);
      sheet.getRange(masterRowIndex, 11).setValue(timeNowStr);

      // JIKA ADA BARIS GANDA (DUPLICATE ROWS) SEPERTI PADA GAMBAR PENGGUNA:
      // Hapus baris duplikat lainnya dari bawah ke atas agar menghemat baris di Google Sheets!
      if (matchingRowIndices.length > 1) {
        for (let d = matchingRowIndices.length - 1; d >= 1; d--) {
          const dupRowIndex = matchingRowIndices[d];
          sheet.deleteRow(dupRowIndex);
        }
      }

      SpreadsheetApp.flush();

      return {
        status: "success",
        message: "Visitor log consolidated (Baris " + masterRowIndex + ", Total Hits: " + newTotalHits + (matchingRowIndices.length > 1 ? ", " + (matchingRowIndices.length - 1) + " baris duplikat dibersihkan" : "") + ")",
        consolidated: true,
        row: masterRowIndex,
        hits: newTotalHits,
        duplicatesRemoved: matchingRowIndices.length - 1
      };
    } else {
      // PENGUNJUNG / DEVICE / HARI BARU -> BUAT 1 BARIS BARU (11 Kolom Lengkap)
      sheet.appendRow([
        todayDateStr,
        visitorId,
        1,
        page,
        device,
        browser,
        isp || "-",
        location || "-",
        referrer,
        timeNowStr,
        timeNowStr
      ]);

      SpreadsheetApp.flush();

      return {
        status: "success",
        message: "New daily visitor row created",
        consolidated: false,
        hits: 1
      };
    }
  } finally {
    if (hasLock) {
      try {
        SpreadsheetApp.flush();
        lock.releaseLock();
      } catch (e) {}
    }
  }
}

/**
 * Fungsi Pembersih Baris Duplikat Otomatis:
 * Menelusuri seluruh sheet Analytics_Logs, menggabungkan baris yang memiliki Tanggal dan Visitor ID/Perangkat yang sama,
 * dan menghapus baris duplikat yang berlebihan untuk menghemat baris spreadsheet.
 */
function deduplicateAnalyticsSheet(ss) {
  const sheet = ss.getSheetByName("Analytics_Logs");
  if (!sheet || sheet.getLastRow() <= 2) return { status: "success", mergedGroups: 0, rowsRemoved: 0 };

  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    lock.waitLock(15000);
    hasLock = true;
  } catch(e) {}

  try {
    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), 11);
    const displayValues = sheet.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues();
    const rawValues = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // Kelompokkan baris berdasarkan (Tanggal + VisitorId) atau (Tanggal + Device)
    const groups = {};
    for (let i = 0; i < displayValues.length; i++) {
      const rowIndex = i + 2; // Baris asli di spreadsheet
      const dateStr = String(displayValues[i][0] || "").substring(0, 10).trim();
      const visitorId = String(displayValues[i][1] || "").trim();
      const device = String(displayValues[i][4] || "").trim();

      const key = dateStr && visitorId && visitorId !== "unknown" 
        ? (dateStr + "_" + visitorId)
        : (dateStr + "_" + device);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push({
        rowIndex: rowIndex,
        display: displayValues[i],
        raw: rawValues[i]
      });
    }

    const rowsToDelete = [];
    let mergedCount = 0;

    for (const key in groups) {
      const list = groups[key];
      if (list.length > 1) {
        // Baris master adalah baris pertama
        const master = list[0];
        let totalHits = 0;
        const pagesSet = {};
        let earliestFirst = "";
        let latestLast = "";

        for (let k = 0; k < list.length; k++) {
          const item = list[k];
          const hits = Number(item.raw[2]) || Number(item.display[2]) || 1;
          totalHits += hits;

          const p = String(item.display[3] || "");
          if (p) {
            p.split(",").forEach(function(s) {
              const clean = s.trim();
              if (clean) pagesSet[clean] = true;
            });
          }

          const fTime = String(item.display[9] || "").trim();
          if (fTime && (!earliestFirst || fTime < earliestFirst)) {
            earliestFirst = fTime;
          }

          const lTime = String(item.display[10] || "").trim();
          if (lTime && (!latestLast || lTime > latestLast)) {
            latestLast = lTime;
          }

          if (k > 0) {
            rowsToDelete.push(item.rowIndex);
          }
        }

        const pagesArr = Object.keys(pagesSet);
        sheet.getRange(master.rowIndex, 3).setValue(totalHits);
        if (pagesArr.length > 0) {
          sheet.getRange(master.rowIndex, 4).setValue(pagesArr.join(", "));
        }
        if (earliestFirst) sheet.getRange(master.rowIndex, 10).setValue(earliestFirst);
        if (latestLast) sheet.getRange(master.rowIndex, 11).setValue(latestLast);
        mergedCount++;
      }
    }

    // Hapus baris duplikat dari urutan baris terbawah ke teratas
    rowsToDelete.sort(function(a, b) { return b - a; });
    for (let d = 0; d < rowsToDelete.length; d++) {
      sheet.deleteRow(rowsToDelete[d]);
    }

    SpreadsheetApp.flush();
    return { status: "success", mergedGroups: mergedCount, rowsRemoved: rowsToDelete.length };
  } finally {
    if (hasLock) {
      try {
        SpreadsheetApp.flush();
        lock.releaseLock();
      } catch(e) {}
    }
  }
}

function readLeadsSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_LEADS);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h || "").trim().toUpperCase();
  });
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();

  function getVal(row, colName, defaultIndex) {
    const idx = headers.indexOf(colName);
    if (idx !== -1 && row[idx] !== undefined && row[idx] !== null && row[idx] !== "") {
      return row[idx];
    }
    if (defaultIndex !== undefined && row[defaultIndex] !== undefined && row[defaultIndex] !== null && row[defaultIndex] !== "") {
      return row[defaultIndex];
    }
    return "";
  }

  return rows.map(function(r) {
    var rawInterests = getVal(r, "TARGET_MINAT");
    var interests = [];
    if (rawInterests) {
      interests = String(rawInterests).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
    }

    var totalPaymentRaw = getVal(r, "TOTAL_PEMBAYARAN");
    var totalPaymentNum = undefined;
    if (totalPaymentRaw) {
      var parsedNum = Number(String(totalPaymentRaw).replace(/\D/g, ""));
      if (!isNaN(parsedNum) && parsedNum > 0) totalPaymentNum = parsedNum;
    }

    var latRaw = getVal(r, "TITIK_GPS_LAT");
    var latNum = undefined;
    if (latRaw !== "") {
      var parsedLat = typeof latRaw === "number" ? latRaw : parseFloat(String(latRaw).replace(",", "."));
      if (!isNaN(parsedLat)) latNum = parsedLat;
    }

    var lngRaw = getVal(r, "TITIK_GPS_LNG");
    var lngNum = undefined;
    if (lngRaw !== "") {
      var parsedLng = typeof lngRaw === "number" ? lngRaw : parseFloat(String(lngRaw).replace(",", "."));
      if (!isNaN(parsedLng)) lngNum = parsedLng;
    }

    var radiusRaw = getVal(r, "RADIUS_LBA");
    var radiusNum = undefined;
    if (radiusRaw) {
      var parsedRadius = Number(String(radiusRaw).replace(/\D/g, ""));
      if (!isNaN(parsedRadius) && parsedRadius > 0) radiusNum = parsedRadius;
    }

    var reachRaw = getVal(r, "ESTIMASI_JANGKAUAN");
    var reachNum = undefined;
    if (reachRaw) {
      var parsedReach = Number(String(reachRaw).replace(/\D/g, ""));
      if (!isNaN(parsedReach)) reachNum = parsedReach;
    }

    var fileCountRaw = getVal(r, "JUMLAH_KONTAK_FILE");
    var fileCountNum = undefined;
    if (fileCountRaw) {
      var parsedCount = Number(String(fileCountRaw).replace(/\D/g, ""));
      if (!isNaN(parsedCount)) fileCountNum = parsedCount;
    }

    return {
      id: String(getVal(r, "ID", 0)),
      createdAt: String(getVal(r, "WAKTU_ORDER", 1)),
      customerName: String(getVal(r, "NAMA_PELANGGAN", 2)),
      whatsapp: String(getVal(r, "NO_WHATSAPP", 3)),
      businessName: getVal(r, "NAMA_BISNIS", 4) ? String(getVal(r, "NAMA_BISNIS", 4)) : undefined,
      myAdsEmail: getVal(r, "EMAIL_MYADS") ? String(getVal(r, "EMAIL_MYADS")) : undefined,
      selectedPackageId: "",
      selectedPackageName: String(getVal(r, "PAKET_PILIHAN", 5)),
      estimatedBudget: String(getVal(r, "ESTIMASI_ANGGARAN", 6)),
      totalPayment: totalPaymentNum,
      campaignType: getVal(r, "TIPE_KAMPANYE") ? String(getVal(r, "TIPE_KAMPANYE")) : undefined,
      channelName: getVal(r, "SALURAN_MEDIA") ? String(getVal(r, "SALURAN_MEDIA")) : undefined,
      estimatedReach: reachNum,
      targetCityOrArea: getVal(r, "TARGET_WILAYAH", 7) ? String(getVal(r, "TARGET_WILAYAH", 7)) : undefined,
      targetProvince: getVal(r, "SASARAN_PROVINSI") ? String(getVal(r, "SASARAN_PROVINSI")) : undefined,
      targetCity: getVal(r, "SASARAN_KOTA") ? String(getVal(r, "SASARAN_KOTA")) : undefined,
      targetDistrict: getVal(r, "SASARAN_KECAMATAN") ? String(getVal(r, "SASARAN_KECAMATAN")) : undefined,
      targetVillage: getVal(r, "SASARAN_KELURAHAN") ? String(getVal(r, "SASARAN_KELURAHAN")) : undefined,
      latitude: latNum,
      longitude: lngNum,
      radiusMeters: radiusNum,
      streetAddress: getVal(r, "ALAMAT_GPS") ? String(getVal(r, "ALAMAT_GPS")) : undefined,
      broadcastDate: getVal(r, "TANGGAL_BROADCAST") ? String(getVal(r, "TANGGAL_BROADCAST")) : undefined,
      senderName: getVal(r, "SENDER_ID") ? String(getVal(r, "SENDER_ID")) : undefined,
      adMessageContent: getVal(r, "ISI_PESAN_IKLAN") ? String(getVal(r, "ISI_PESAN_IKLAN")) : undefined,
      webLink: getVal(r, "LINK_WEB") ? String(getVal(r, "LINK_WEB")) : undefined,
      uploadedListFileName: getVal(r, "FILE_LIST_KONTAK") ? String(getVal(r, "FILE_LIST_KONTAK")) : undefined,
      uploadedListFileCount: fileCountNum,
      targetAgeGroup: getVal(r, "TARGET_USIA") ? String(getVal(r, "TARGET_USIA")) : undefined,
      targetGender: getVal(r, "TARGET_GENDER") ? String(getVal(r, "TARGET_GENDER")) : undefined,
      targetReligion: getVal(r, "TARGET_AGAMA") ? String(getVal(r, "TARGET_AGAMA")) : undefined,
      targetArpuSpending: getVal(r, "TARGET_ARPU") ? String(getVal(r, "TARGET_ARPU")) : undefined,
      targetSes: getVal(r, "TARGET_SES") ? String(getVal(r, "TARGET_SES")) : undefined,
      targetDeviceOs: getVal(r, "TARGET_DEVICE_OS") ? String(getVal(r, "TARGET_DEVICE_OS")) : undefined,
      targetMaritalStatus: getVal(r, "TARGET_PERNIKAHAN") ? String(getVal(r, "TARGET_PERNIKAHAN")) : undefined,
      targetInterests: interests.length > 0 ? interests : undefined,
      status: String(getVal(r, "STATUS", 8)) || "PENDING",
      notes: getVal(r, "CATATAN", 9) ? String(getVal(r, "CATATAN", 9)) : ""
    };
  });
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

  // 2. Tulis Sheet DISKON_ISI_ULANG (Termasuk Skema Tiers JSON)
  if (data.discountConfig) {
    const s = ss.getSheetByName(SHEET_DISCOUNT);
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    const d = data.discountConfig;
    const tiersJson = JSON.stringify(d.monetaryTiers || []);
    s.getRange(2, 1, 1, 8).setValues([[
      d.reloadDiscountPercent !== undefined ? d.reloadDiscountPercent : 50,
      d.isPromoActive ? "AKTIF" : "NONAKTIF",
      d.promoTitle || "",
      d.promoBadge || "",
      d.promoDescription || "",
      d.promoCountdownEnd || "",
      tiersJson,
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
    const primaryBank = (c.bankAccounts && Array.isArray(c.bankAccounts) && c.bankAccounts.length > 0)
      ? (c.bankAccounts.find(function(b) { return b.isPrimary; }) || c.bankAccounts[0])
      : null;

    const bName = primaryBank ? primaryBank.bankName : (c.bankName || "");
    const bAcc = primaryBank ? primaryBank.accountNumber : (c.bankAccountNumber || "");
    const bHolder = primaryBank ? primaryBank.accountHolder : (c.bankAccountHolder || "");
    const bankAccountsJson = JSON.stringify(c.bankAccounts || []);

    s.getRange(2, 1, 1, 15).setValues([[
      c.brandName || "",
      c.brandTagline || "",
      c.waNumber || "",
      c.waDisplayNumber || "",
      c.supportEmail || "",
      c.officeAddress || "",
      c.operatingHours || "",
      c.announcementText || "",
      c.showAnnouncement ? "YA" : "TIDAK",
      now,
      bName,
      bAcc,
      bHolder,
      c.paymentInstructions || "",
      bankAccountsJson
    ]]);
  }

  // 5. Tulis Sheet REKENING_BANK (1 Baris untuk Setiap Rekening Bank Resmi)
  const allBankAccounts = (data.companyConfig && Array.isArray(data.companyConfig.bankAccounts) && data.companyConfig.bankAccounts.length > 0)
    ? data.companyConfig.bankAccounts
    : [
        {
          id: "bank_bca_1",
          bankName: (data.companyConfig && data.companyConfig.bankName) || "BCA (Bank Central Asia)",
          accountNumber: (data.companyConfig && data.companyConfig.bankAccountNumber) || "0188-3333-7157",
          accountHolder: (data.companyConfig && data.companyConfig.bankAccountHolder) || "PT Akardaya Telekomunikasi Indonesia",
          isPrimary: true,
          isActive: true,
          notes: "Rekening Utama"
        }
      ];

  const sBanks = ss.getSheetByName(SHEET_BANKS) || ss.insertSheet(SHEET_BANKS);
  if (sBanks.getLastRow() > 1) {
    sBanks.getRange(2, 1, sBanks.getLastRow() - 1, sBanks.getLastColumn()).clearContent();
  }
  const bankRows = allBankAccounts.map(function(b, idx) {
    return [
      b.id || ("bank_" + (idx + 1)),
      b.bankName || "",
      b.accountNumber || "",
      b.accountHolder || "",
      b.isPrimary ? "YA" : "TIDAK",
      b.isActive ? "AKTIF" : "NONAKTIF",
      b.notes || ""
    ];
  });
  sBanks.getRange(2, 1, bankRows.length, bankRows[0].length).setValues(bankRows);

  // 6. Tulis Sheet LOKASI_CABANG
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

  // 7. Tulis Sheet PESANAN_LEADS (Sinkronisasi Admin Lead Status / Data)
  if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
    let sLeads = ss.getSheetByName(SHEET_LEADS);
    if (!sLeads) {
      sLeads = ss.insertSheet(SHEET_LEADS);
      sLeads.appendRow([
        "ID", "WAKTU_ORDER", "NAMA_PELANGGAN", "NO_WHATSAPP", "NAMA_BISNIS", "EMAIL_MYADS",
        "PAKET_PILIHAN", "ESTIMASI_ANGGARAN", "TOTAL_PEMBAYARAN", "TIPE_KAMPANYE", "SALURAN_MEDIA", "ESTIMASI_JANGKAUAN",
        "TARGET_WILAYAH", "SASARAN_PROVINSI", "SASARAN_KOTA", "SASARAN_KECAMATAN", "SASARAN_KELURAHAN",
        "TITIK_GPS_LAT", "TITIK_GPS_LNG", "RADIUS_LBA", "ALAMAT_GPS",
        "TANGGAL_BROADCAST", "SENDER_ID", "ISI_PESAN_IKLAN", "LINK_WEB",
        "FILE_LIST_KONTAK", "JUMLAH_KONTAK_FILE",
        "TARGET_USIA", "TARGET_GENDER", "TARGET_AGAMA", "TARGET_ARPU", "TARGET_SES", "TARGET_DEVICE_OS", "TARGET_PERNIKAHAN", "TARGET_MINAT",
        "STATUS", "CATATAN"
      ]);
      sLeads.setFrozenRows(1);
      formatHeader(sLeads, "#DC2626");
    }

    if (sLeads.getLastRow() > 1) {
      sLeads.getRange(2, 1, sLeads.getLastRow() - 1, sLeads.getLastColumn()).clearContent();
    }

    const orderRows = data.orders.map(function(o) {
      const interestsStr = Array.isArray(o.targetInterests) ? o.targetInterests.join(", ") : (o.targetInterests || "");
      return [
        o.id || ("ORD-" + Date.now().toString().slice(-6)),
        o.createdAt || now,
        o.customerName || "",
        o.whatsapp || "",
        o.businessName || "",
        o.myAdsEmail || "",
        o.selectedPackageName || "",
        o.estimatedBudget || "",
        o.totalPayment ? ("Rp " + Number(o.totalPayment).toLocaleString("id-ID")) : (o.estimatedBudget || ""),
        o.campaignType || "",
        o.channelName || "",
        o.estimatedReach || "",
        o.targetCityOrArea || "",
        o.targetProvince || "",
        o.targetCity || "",
        o.targetDistrict || "",
        o.targetVillage || "",
        o.latitude || "",
        o.longitude || "",
        o.radiusMeters ? (o.radiusMeters + " Meter") : "",
        o.streetAddress || "",
        o.broadcastDate || "",
        o.senderName || "",
        o.adMessageContent || "",
        o.webLink || "",
        o.uploadedListFileName ? (o.uploadedListFileName + (o.uploadedListFileSize ? (" (" + o.uploadedListFileSize + ")") : "")) : "",
        o.uploadedListFileCount || "",
        o.targetAgeGroup || "",
        o.targetGender || "",
        o.targetReligion || "",
        o.targetArpuSpending || "",
        o.targetSes || "",
        o.targetDeviceOs || "",
        o.targetMaritalStatus || "",
        interestsStr,
        o.status || "PENDING",
        o.notes || ""
      ];
    });

    sLeads.getRange(2, 1, orderRows.length, orderRows[0].length).setValues(orderRows);
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

