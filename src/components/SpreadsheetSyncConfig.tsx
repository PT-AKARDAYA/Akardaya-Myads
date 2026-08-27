import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Save,
  HelpCircle,
  Sparkles,
  Database,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Layers,
  Percent,
  Receipt,
  PhoneCall,
  MapPin,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';
import { CompanyConfig } from '../types';

interface SpreadsheetSyncConfigProps {
  companyConfig: CompanyConfig;
  onChange: (updatedConfig: CompanyConfig) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const SpreadsheetSyncConfig: React.FC<SpreadsheetSyncConfigProps> = ({
  companyConfig,
  onChange,
  onSave,
  isSaving,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const copyCode = async () => {
    try {
      const code = `/**
 * AKARDAYA MYADS - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * Multi-Sheet Database Architecture (Satu Menu Satu Sheet Khusus)
 */

const SHEET_PACKAGES = "PAKET_LANGGANAN";
const SHEET_DISCOUNT = "DISKON_ISI_ULANG";
const SHEET_RATES = "TARIF_SALURAN_IKLAN";
const SHEET_CONFIG = "PENGATURAN_UMUM";
const SHEET_OFFICES = "LOKASI_CABANG";
const SHEET_TESTIMONIALS = "TESTIMONI";
const SHEET_LEADS = "PESANAN_LEADS";

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss.getSheetByName(SHEET_PACKAGES)) {
    const s = ss.insertSheet(SHEET_PACKAGES);
    s.appendRow([
      "ID", "KATEGORI", "JUDUL_KATEGORI", "NAMA_PAKET", "TIER_BUDGET", "TAGLINE",
      "MIN_BUDGET", "MAX_BUDGET", "HARGA_TAMPILAN", "BADGE", "POPULER",
      "GRATIS_KONTEN_BULAN", "GRATIS_WEBSITE_BULAN", "TIPE_AKUN", "INFO_SALDO",
      "DESKRIPSI", "HIGHLIGHT_FITUR", "ID_TARIF_AKTIF"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#1E40AF");
  }

  if (!ss.getSheetByName(SHEET_DISCOUNT)) {
    const s = ss.insertSheet(SHEET_DISCOUNT);
    s.appendRow([
      "PERSEN_DISKON", "STATUS_PROMO", "JUDUL_PROMO", "BADGE_PROMO",
      "DESKRIPSI_PROMO", "TANGGAL_BERAKHIR", "TERAKHIR_UPDATE"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#059669");
  }

  if (!ss.getSheetByName(SHEET_RATES)) {
    const s = ss.insertSheet(SHEET_RATES);
    s.appendRow([
      "ID", "FASILITAS", "NAMA_FITUR", "TARIF_PER_UNIT", "TARIF_TAMPILAN",
      "SATUAN", "DESKRIPSI"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#4F46E5");
  }

  if (!ss.getSheetByName(SHEET_CONFIG)) {
    const s = ss.insertSheet(SHEET_CONFIG);
    s.appendRow([
      "NAMA_BRAND", "TAGLINE", "NO_WHATSAPP", "TAMPILAN_NO_WA", "EMAIL_SUPPORT",
      "ALAMAT_KANTOR", "JAM_OPERASIONAL", "TEKS_PENGUMUMAN", "TAMPILKAN_PENGUMUMAN", "TERAKHIR_UPDATE"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#D97706");
  }

  if (!ss.getSheetByName(SHEET_OFFICES)) {
    const s = ss.insertSheet(SHEET_OFFICES);
    s.appendRow([
      "ID", "NAMA_CABANG", "TIPE", "KOTA", "ALAMAT_LENGKAP",
      "LATITUDE", "LONGITUDE", "NO_TELEPON", "WHATSAPP", "JAM_OPERASIONAL",
      "CABANG_UTAMA", "CATATAN"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#2563EB");
  }

  if (!ss.getSheetByName(SHEET_TESTIMONIALS)) {
    const s = ss.insertSheet(SHEET_TESTIMONIALS);
    s.appendRow([
      "ID", "WAKTU", "NAMA_KLIEN", "BISNIS_TOKO", "PERAN_JABATAN",
      "RATING_BINTANG", "ISI_ULASAN", "NAMA_PAKET", "TERVERIFIKASI"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#7C3AED");
  }

  if (!ss.getSheetByName(SHEET_LEADS)) {
    const s = ss.insertSheet(SHEET_LEADS);
    s.appendRow([
      "ID", "WAKTU_ORDER", "NAMA_PELANGGAN", "NO_WHATSAPP", "NAMA_BISNIS",
      "PAKET_PILIHAN", "ESTIMASI_ANGGARAN", "TARGET_WILAYAH", "STATUS", "CATATAN"
    ]);
    s.setFrozenRows(1);
    formatHeader(s, "#DC2626");
  }
}

function formatHeader(sheet, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  headerRange.setBackground(bgColor);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
}

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
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    let requestBody = JSON.parse(e.postData.contents);
    const action = requestBody.action || "SAVE_DATA";

    if (action === "SAVE_DATA") {
      saveAllSheets(ss, requestBody.payload || {});
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data berhasil disimpan ke 7 sheet masing-masing di Google Spreadsheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

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
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

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
      keyHighlights: r[16] ? String(r[16]).split("\\n").filter(Boolean) : [],
      enabledRateIds: r[17] ? String(r[17]).split(",").map(s => s.trim()).filter(Boolean) : []
    }));
  }

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

  const sTest = ss.getSheetByName(SHEET_TESTIMONIALS);
  if (sTest && sTest.getLastRow() > 1) {
    const rows = sTest.getRange(2, 1, sTest.getLastRow() - 1, sTest.getLastColumn()).getValues();
    result.testimonials = rows.map(t => ({
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

  const sLead = ss.getSheetByName(SHEET_LEADS);
  if (sLead && sLead.getLastRow() > 1) {
    const rows = sLead.getRange(2, 1, sLead.getLastRow() - 1, sLead.getLastColumn()).getValues();
    result.orders = rows.map(r => ({
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

  return result;
}

function saveAllSheets(ss, data) {
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
    const s = ss.getSheetByName(SHEET_PACKAGES);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const pkgRows = data.packages.map(p => [
      p.id || "", p.category || "", p.categoryTitle || "", p.name || "", p.tierName || "", p.tagline || "",
      p.minBudget || 0, p.maxBudget || "", p.priceDisplay || "", p.badge || "", p.isPopular ? "YA" : "TIDAK",
      p.freeContentPerMonth || 0, p.freeWebsiteMonths || 0, p.accountType || "Akun AD", p.saldoInfo || "SESUAI PAKET",
      p.description || "", (p.keyHighlights || []).join("\\n"), (p.enabledRateIds || []).join(",")
    ]);
    s.getRange(2, 1, pkgRows.length, pkgRows[0].length).setValues(pkgRows);
  }

  if (data.discountConfig) {
    const s = ss.getSheetByName(SHEET_DISCOUNT);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const d = data.discountConfig;
    s.getRange(2, 1, 1, 7).setValues([[
      d.reloadDiscountPercent || 2, d.isPromoActive ? "AKTIF" : "NONAKTIF", d.promoTitle || "",
      d.promoBadge || "", d.promoDescription || "", d.promoCountdownEnd || "", now
    ]]);
  }

  if (data.channelRates && Array.isArray(data.channelRates) && data.channelRates.length > 0) {
    const s = ss.getSheetByName(SHEET_RATES);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const rateRows = data.channelRates.map(r => [
      r.id || "", r.facility || "", r.featureName || "", r.ratePerUnit || 0,
      r.rateDisplay || "", r.unit || "", r.description || ""
    ]);
    s.getRange(2, 1, rateRows.length, rateRows[0].length).setValues(rateRows);
  }

  if (data.companyConfig) {
    const s = ss.getSheetByName(SHEET_CONFIG);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const c = data.companyConfig;
    s.getRange(2, 1, 1, 10).setValues([[
      c.brandName || "", c.brandTagline || "", c.waNumber || "", c.waDisplayNumber || "",
      c.supportEmail || "", c.officeAddress || "", c.operatingHours || "",
      c.announcementText || "", c.showAnnouncement ? "YA" : "TIDAK", now
    ]]);
  }

  if (data.offices && Array.isArray(data.offices) && data.offices.length > 0) {
    const s = ss.getSheetByName(SHEET_OFFICES);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const offRows = data.offices.map(o => [
      o.id || "", o.name || "", o.type || "CABANG", o.cityName || "", o.address || "",
      o.latitude || 0, o.longitude || 0, o.phone || "", o.whatsapp || "",
      o.operatingHours || "", o.isPrimary ? "YA" : "TIDAK", o.notes || ""
    ]);
    s.getRange(2, 1, offRows.length, offRows[0].length).setValues(offRows);
  }

  if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    const s = ss.getSheetByName(SHEET_TESTIMONIALS);
    if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    const testRows = data.testimonials.map(t => [
      t.id || "", t.date || now, t.name || "", t.companyOrStore || "", t.role || "",
      t.rating || 5, t.comment || "", t.packageName || "", t.verified ? "YA" : "TIDAK"
    ]);
    s.getRange(2, 1, testRows.length, testRows[0].length).setValues(testRows);
  }
}`;
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestConnection = async () => {
    if (!companyConfig.spreadsheetUrl) {
      setTestResult({ success: false, message: 'Harap masukkan URL Google Apps Script Web App terlebih dahulu.' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      const fetchUrl = companyConfig.spreadsheetUrl.includes('?')
        ? `${companyConfig.spreadsheetUrl}&action=GET_DATA`
        : `${companyConfig.spreadsheetUrl}?action=GET_DATA`;

      const res = await fetch(fetchUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setTestResult({
            success: true,
            message: '🎉 Berhasil terhubung! 7 Sheet terpisah di Google Spreadsheet siap menyimpan data otomatis.',
          });
        } else {
          setTestResult({
            success: false,
            message: `Gagal membaca spreadsheet: ${json.message || 'Format tidak sesuai'}`,
          });
        }
      } else {
        setTestResult({
          success: false,
          message: 'Server Google Apps Script mengembalikan status error. Pastikan izin akses diset "Anyone" (Siapa saja).',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Koneksi gagal atau diblokir CORS. Pastikan saat deploy memilih Who has access: "Anyone" (Siapa saja).',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const sheetItems = [
    {
      name: 'PAKET_LANGGANAN',
      label: 'Paket Langganan',
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      desc: 'Tabel 8 paket promo (One Klik, Mandiri, UMKM, Corporate, harga, kuota konten & saldo).',
    },
    {
      name: 'DISKON_ISI_ULANG',
      label: 'Diskon Isi Ulang',
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      desc: 'Persentase diskon top-up saldo (2%), judul promo, badge, dan tanggal countdown.',
    },
    {
      name: 'TARIF_SALURAN_IKLAN',
      label: 'Tarif Saluran Iklan',
      icon: Receipt,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      desc: 'Katalog 20 tarif per unit (SMS Broadcast, LBA, MMS, RCS, WA WABA, dll).',
    },
    {
      name: 'PENGATURAN_UMUM',
      label: 'WhatsApp & Brand',
      icon: PhoneCall,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      desc: 'Nomor WhatsApp admin, email, tagline, alamat kantor & banner pengumuman.',
    },
    {
      name: 'LOKASI_CABANG',
      label: 'Lokasi & Maps Cabang',
      icon: MapPin,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      desc: 'Daftar kantor cabang (TDC Gresik, Surabaya, Jakarta, dll), koordinat & kontak.',
    },
    {
      name: 'TESTIMONI',
      label: 'Testimoni Pelanggan',
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      desc: 'Ulasan kepuasan klien, rating bintang, nama toko & status verifikasi.',
    },
    {
      name: 'PESANAN_LEADS',
      label: 'Pesanan & Order Masuk',
      icon: ShoppingBag,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      desc: 'Catatan formulir pesanan masuk otomatis dari pengunjung website.',
    },
    {
      name: 'Analytics_Logs',
      label: 'Log Pengunjung (Hemat Baris)',
      icon: Database,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
      desc: 'Rekap analitik pengunjung riil. Kunjungan di hari yang sama digabung dalam 1 baris (hemat baris otomatis).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-200" />
            <span>Multi-Sheet Database System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Database Google Spreadsheet Multi-Sheet</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Setiap menu dashboard kini memiliki Sheet khusus tersendiri (7 sheet terpisah) agar data rapi, terstruktur, mudah diedit manual, dan otomatis tersinkron ke website!
          </p>
        </div>

        <a
          href="https://sheets.new"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-black flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Buat Spreadsheet Baru</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>

      {/* 7 Dedicated Sheets Preview Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>7 Sheet Database Otomatis yang Terbentuk:</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">1 Menu Dashboard = 1 Sheet Khusus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${item.color}`}
              >
                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 shadow-xs shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.label}
                    </span>
                    <code className="text-[10px] font-mono font-bold opacity-75 truncate">
                      {item.name}
                    </code>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-emerald-600" />
            <span>Google Apps Script Web App URL (URL Database)</span>
          </label>
          <span className="text-[11px] font-bold text-slate-500">Berakhiran <code>/exec</code></span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
            value={companyConfig.spreadsheetUrl || ''}
            onChange={(e) => onChange({ ...companyConfig, spreadsheetUrl: e.target.value.trim() })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={handleTestConnection}
            disabled={testingConnection || !companyConfig.spreadsheetUrl}
            className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>Tes Koneksi</span>
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan & Menghubungkan...' : 'Simpan URL Spreadsheet'}</span>
          </button>
        </div>
      </div>

      {/* 4 Easy Step Guide */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Cara Update Kode Apps Script (Code.gs) di Google Spreadsheet Anda</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Buka Apps Script di Spreadsheet</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Buka Spreadsheet Anda, klik menu <b>Ekstensi (Extensions) &rarr; Apps Script</b>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="font-bold text-slate-900 dark:text-white">Salin Kode Multi-Sheet (Code.gs)</span>
              </div>
              <button
                onClick={copyCode}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1"
              >
                {copiedCode ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Multi-Sheet'}</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Hapus kode lama di Apps Script, lalu <b>Paste</b> kode multi-sheet terbaru dari tombol salin di atas atau file <code>Code.gs</code>. Lalu klik <b>Simpan</b> 💾.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Deploy Versi Baru (New Deployment)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Klik <b>Deploy &rarr; New deployment</b>. Pilih <b>Web app</b>.
              <br />
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ Pastikan "Who has access" tetap diset "Anyone" (Siapa saja).
              </span>
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Tempel URL /exec & Simpan</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Salin URL baru <code>/exec</code>, tempelkan ke kolom di atas, lalu klik <b>Simpan URL Spreadsheet</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
