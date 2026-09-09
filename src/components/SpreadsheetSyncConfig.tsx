import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Download,
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
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CompanyConfig } from '../types';
import codeGs from '@/Code.gs?raw';

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
  const [showCodePreview, setShowCodePreview] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeGs);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadCode = () => {
    try {
      const blob = new Blob([codeGs], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Code.gs';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
      label: 'Bonus Saldo Isi Ulang',
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      desc: 'Persentase bonus saldo top-up (s/d 50%), judul promo, badge, dan tanggal countdown.',
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
      label: 'Log Pengunjung & Lokasi',
      icon: Database,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
      desc: 'Rekap analitik pengunjung riil (ISP Provider, Kota/Lokasi, Perangkat, Hits, Halaman, Waktu WIB). Kunjungan hari yang sama digabung otomatis.',
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="font-bold text-slate-900 dark:text-white">Salin / Unduh Kode (Code.gs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyCode}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Unduh file Code.gs ke komputer Anda"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh .gs</span>
                </button>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Kode di menu ini <b>terkoneksi langsung 100% dari file <code>Code.gs</code> project</b>. Buka Apps Script, <b>Paste</b> kode terbaru, lalu klik <b>Simpan</b> 💾.
            </p>
            <button
              type="button"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="mt-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showCodePreview ? 'Sembunyikan Cuplikan Kode' : 'Lihat Isi File Code.gs'}</span>
              {showCodePreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
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

        {/* Expandable Code Preview */}
        {showCodePreview && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Kode: <code>Code.gs</code>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  Sinkron 100% dengan File Project
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadCode}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh File</span>
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              <code>{codeGs}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
