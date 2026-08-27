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

  const scriptCodeSample = `// Kode Apps Script lengkap sudah tersedia di file Code.gs project ini!`;

  const copyCode = async () => {
    try {
      // Fetch or provide code
      const code = `/**
 * AKARDAYA MYADS - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 */
const SHEET_DATA = "APP_DATA";
const SHEET_ORDERS = "ORDER_LEADS";
const SHEET_REVIEWS = "TESTIMONIALS";

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
          try { appData = JSON.parse(data[i][1]); } catch (err) { appData = null; }
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: appData })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    let requestBody = JSON.parse(e.postData.contents);
    const action = requestBody.action || "SAVE_DATA";

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
      if (!found) sheet.appendRow(["MAIN_CONFIG", payloadString, now]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Disimpan ke Sheet" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "ADD_LEAD") {
      const sheet = ss.getSheetByName(SHEET_ORDERS);
      const lead = requestBody.lead || {};
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      sheet.appendRow([lead.id, now, lead.clientName, lead.phone, lead.packageName, lead.channel, lead.status, lead.notes]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
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
            message: '🎉 Berhasil terhubung! Google Spreadsheet siap digunakan sebagai database otomatis.',
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-200" />
            <span>Database Cloud Spreadsheet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Sinkronisasi Database Google Spreadsheet</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Simpan semua perubahan paket promo, tarif, diskon, dan order leads ke Google Spreadsheet pribadi Anda secara gratis, aman, dan otomatis tersinkron ke semua pengguna!
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

      {/* Main Input Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
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
          <span>Langkah Mudah Menghubungkan Google Spreadsheet (Hanya 2 Menit)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Buat File Spreadsheet & Buka Apps Script</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Buka Google Drive atau ketik <b>sheets.new</b> di browser. Di dalam spreadsheet, klik menu <b>Ekstensi (Extensions) &rarr; Apps Script</b>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="font-bold text-slate-900 dark:text-white">Salin Kode Backend (Code.gs)</span>
              </div>
              <button
                onClick={copyCode}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1"
              >
                {copiedCode ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Hapus kode bawaan di editor Apps Script, lalu <b>Paste</b> seluruh isi kode dari file <code>Code.gs</code> atau tombol salin di atas.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Deploy Sebagai Web App</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Klik <b>Deploy (Terapkan) &rarr; New deployment (Penerapan baru)</b>. Pilih jenis <b>Web app</b>.
              <br />
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ Penting: Pada "Who has access", pilih "Anyone" (Siapa saja).
              </span>
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Tempelkan Web App URL</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Salin URL yang berakhiran <code>/exec</code> yang diberikan oleh Google, lalu masukkan ke kotak input di atas dan klik <b>Simpan URL Spreadsheet</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
