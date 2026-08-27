import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Activity,
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Globe2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Laptop,
  Share2,
} from 'lucide-react';

export const VisitorAnalyticsDashboard: React.FC = () => {
  const measurementId = 'G-HXRWYS6JV9';
  const gaRealtimeUrl = 'https://analytics.google.com/analytics/web/#/p479361661/realtime';
  const gaGeneralUrl = 'https://analytics.google.com/analytics/web/';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Google Analytics 4 (GA4) Live Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Laporan Asli Google Analytics (GA4)</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Seluruh data statistik, pengunjung real-time, asal kota, dan perangkat diukur secara murni 100% oleh Google Analytics tanpa data dummy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={gaGeneralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black flex items-center gap-2 shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Buka Dashboard Google Analytics</span>
          </a>
        </div>
      </div>

      {/* GA4 Verification Status */}
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                  Pelacakan GA4 Terpasang & Aktif
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase">
                  Live Active
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Tag ID Pengukuran: <code className="px-2 py-0.5 rounded bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-mono font-bold text-xs border border-emerald-300 dark:border-emerald-700">{measurementId}</code>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Setiap kali seseorang membuka website ini dari HP, WhatsApp, Google Search, atau Laptop, datanya langsung terkirim secara instan ke server Google Analytics.
              </p>
            </div>
          </div>

          <a
            href={gaGeneralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0"
          >
            <Activity className="w-4 h-4" />
            <span>Lihat Pengunjung Realtime Google</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Guide Cards on What GA4 Tracks Murni */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Realtime Telemetry Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pengunjung Real-Time (Live)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Google Analytics menyajikan jumlah orang yang sedang aktif di website dalam 30 menit terakhir per detik secara akurat.
            </p>
          </div>
          <div className="pt-2">
            <a
              href={gaGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Buka Menu Realtime GA4</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Traffic Channels Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sumber Akuisisi Trafik</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Mengetahui apakah pengunjung datang dari tautan WhatsApp, pencarian Google Organik, iklan promosi, atau media sosial.
            </p>
          </div>
          <div className="pt-2">
            <a
              href={gaGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Buka Menu Akuisisi GA4</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Demographics & Devices Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Demografi & Perangkat</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Melihat kota asal pengunjung (Gresik, Surabaya, Jakarta, dll.) serta tipe perangkat (Android, iPhone, PC/Laptop).
            </p>
          </div>
          <div className="pt-2">
            <a
              href={gaGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Buka Menu Demografi GA4</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded direct quick launch box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
        <div className="max-w-xl mx-auto space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Akses Panel Kontrol Resmi Google Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Karena Google Analytics menerapkan standar keamanan ketat (OAuth2 & Privacy Rules), seluruh metrik asli dapat Anda pantau secara langsung dan akurat di portal resmi Google Analytics dengan akun Google Anda:
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={gaGeneralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Google Analytics (GA4) Sekarang</span>
          </a>
        </div>
      </div>
    </div>
  );
};
