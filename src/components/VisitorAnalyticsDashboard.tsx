import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Activity,
  Users,
  Eye,
  Smartphone,
  Globe2,
  Clock,
  TrendingUp,
  Laptop,
  Monitor,
  Tablet,
  Wifi,
  MapPin,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Radio,
  Trash2,
  BarChart2,
  Database,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import {
  getLocalAnalyticsSummary,
  clearLocalAnalytics,
  calculateAnalyticsSummaryFromLogs,
  fetchRemoteAnalyticsFromSpreadsheet,
  formatVisitorIdDisplay,
  getDetailedOS,
  getDetailedBrowser,
  VisitorRecord,
} from '../utils/analyticsTracker';

// Helper to format table timestamp into simple clean "DD/MM/YYYY, HH:mm:ss WIB" (Jakarta Time)
function formatTableTimestamp(ts: string | undefined): string {
  if (!ts) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hour}:${min}:${sec} WIB`;
  }

  try {
    const raw = ts.trim();

    // 1. Check for text month formats like "Mon Sep 07 2026 00:00:00 GMT+0700 (Western Indonesia Time) 15:35:33 WIB"
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', mei: '05',
      jun: '06', jul: '07', aug: '08', ags: '08', sep: '09', oct: '10', okt: '10',
      nov: '11', dec: '12', des: '12',
    };

    // Find any time in the string, preferring a non-00:00:00 time (e.g. trailing time or inline time)
    const allTimes = Array.from(raw.matchAll(/(?:^|[\s,T])(\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?)/g)).map((m) => m[1]);
    let targetTime = allTimes.find((t) => !t.startsWith('00:00') && !t.startsWith('0:00')) || allTimes[allTimes.length - 1] || '00:00:00';
    targetTime = targetTime.replace(/\./g, ':');
    if (targetTime.split(':').length === 2) targetTime += ':00';
    const timeParts = targetTime.split(':');
    const cleanTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:${(timeParts[2] || '00').padStart(2, '0')}`;

    const textDateMatch = raw.match(/([A-Za-z]{3,4})\s+(\d{1,2})\s+(\d{4})/i) ||
                          raw.match(/(\d{1,2})\s+([A-Za-z]{3,4})\s+(\d{4})/i);

    if (textDateMatch) {
      let day = '';
      let month = '';
      let year = '';

      if (isNaN(Number(textDateMatch[1]))) {
        // e.g. "Sep 07 2026"
        const mKey = textDateMatch[1].slice(0, 3).toLowerCase();
        month = monthMap[mKey] || '01';
        day = textDateMatch[2].padStart(2, '0');
        year = textDateMatch[3];
      } else {
        // e.g. "07 Sep 2026"
        day = textDateMatch[1].padStart(2, '0');
        const mKey = textDateMatch[2].slice(0, 3).toLowerCase();
        month = monthMap[mKey] || '01';
        year = textDateMatch[3];
      }

      return `${day}/${month}/${year}, ${cleanTime} WIB`;
    }

    // 2. Standard DD/MM/YYYY, HH:mm:ss or DD-MM-YYYY HH:mm:ss
    const dmyMatch = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) year = `20${year}`;
      const hour = dmyMatch[4].padStart(2, '0');
      const min = dmyMatch[5].padStart(2, '0');
      const sec = (dmyMatch[6] || '00').padStart(2, '0');
      return `${day}/${month}/${year}, ${hour}:${min}:${sec} WIB`;
    }

    // 3. ISO format YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
    const isoMatch = raw.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[T\s]+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      const hour = isoMatch[4].padStart(2, '0');
      const min = isoMatch[5].padStart(2, '0');
      const sec = (isoMatch[6] || '00').padStart(2, '0');
      return `${day}/${month}/${year}, ${hour}:${min}:${sec} WIB`;
    }

    // 4. Fallback Date parse (stripping timezone text comments)
    const cleanDateStr = raw
      .replace(/\s*\(Western Indonesia Time\)/gi, '')
      .replace(/\s*\(WIB\)/gi, '')
      .replace(/\s*WIB/gi, '')
      .trim();

    const d = new Date(cleanDateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hour}:${min}:${sec} WIB`;
    }
  } catch {}

  // 5. Minimal clean fallback if parse fails
  const safeFallback = ts
    .replace(/\s*\(Western Indonesia Time\)/gi, '')
    .replace(/00:00:00\s*GMT\+0700/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return safeFallback.endsWith('WIB') ? safeFallback : `${safeFallback} WIB`;
}

// Helper for friendly page name formatted with clean label
function getPagePill(rawPage: string | undefined): string {
  const p = (rawPage || '/').trim();
  if (p === '/' || p.toLowerCase().includes('beranda') || p.toLowerCase() === '/akardaya-myads/' || p.toLowerCase() === '/akardaya-myads') {
    return 'Beranda Utama';
  }
  if (p.includes('paket-langganan') || p.includes('paket')) return 'Paket Langganan';
  if (p.includes('kalkulator') || p.includes('simulasi')) return 'Kalkulator Biaya';
  if (p.includes('testimoni') || p.includes('ulasan')) return 'Testimoni & Ulasan';
  if (p.includes('inventori') || p.includes('myads')) return 'Inventori MyAds';
  if (p.includes('matriks') || p.includes('fitur')) return 'Tabel Matriks';
  if (p.includes('lokasi') || p.includes('kantor') || p.includes('cabang')) return 'Lokasi Kantor';
  if (p.includes('chat') || p.includes('konsultasi') || p.includes('whatsapp')) return 'Konsultasi WA';
  if (p.includes('pesanan') || p.includes('order')) return 'Form Order Iklan';
  return p.length > 20 ? p.slice(0, 20) + '...' : p;
}

// Helper for device, OS, and browser details from real log
function getDeviceDetails(log: VisitorRecord) {
  const dev = (log.device || '').toLowerCase();
  const isMobile = dev.includes('mob') || dev.includes('hp') || dev.includes('phone') || dev.includes('android') || dev.includes('iphone');
  const isTablet = dev.includes('tab') || dev.includes('ipad');

  let category = 'PC / Desktop';
  if (isTablet) category = 'Tablet';
  else if (isMobile) category = 'Mobile';

  let os = log.os;
  if (!os || os === 'OS Lainnya') {
    if (category === 'Mobile') {
      os = dev.includes('iphone') ? 'iOS' : 'Android';
    } else if (category === 'Tablet') {
      os = dev.includes('ipad') ? 'iPadOS' : 'Android Tab';
    } else {
      os = log.device || 'Windows / macOS';
    }
  }

  const browser = log.browser || 'Web Browser';

  return {
    category,
    os,
    browser,
    isMobile,
    isTablet,
  };
}

// Helper for ISP Provider from real database
function getIspDetails(log: VisitorRecord): string {
  if (log.isp && log.isp.trim()) return log.isp;
  return '-';
}

// Helper for City & Location from real database
function getLocationDetails(log: VisitorRecord): { city: string; region: string } {
  if (log.city && log.region) {
    return { city: log.city, region: log.region };
  }
  if (log.city) {
    return { city: log.city, region: log.region || 'Indonesia' };
  }
  if (log.country) {
    return { city: log.country, region: 'WIB' };
  }
  return { city: 'Indonesia', region: 'WIB' };
}

// Helper for Referrer from real database
function getReferrerDisplay(rawRef: string | undefined): string {
  if (!rawRef || rawRef.trim() === '' || rawRef.toLowerCase().includes('langsung') || rawRef.toLowerCase().includes('direct')) {
    return 'Akses Langsung (Direct)';
  }
  const low = rawRef.toLowerCase();
  if (low.includes('google')) return 'Google Search';
  if (low.includes('instagram')) return 'Instagram';
  if (low.includes('facebook') || low.includes('fb')) return 'Facebook';
  if (low.includes('whatsapp') || low.includes('wa.me')) return 'WhatsApp';
  if (low.includes('tiktok')) return 'TikTok';
  return rawRef.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export const VisitorAnalyticsDashboard: React.FC = () => {
  const { data, activeUsers } = useApp();
  const gaGeneralUrl = 'https://analytics.google.com/analytics/web/';

  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'spreadsheet' | 'server' | 'local'>('local');
  const [totalPageViews, setTotalPageViews] = useState<number>(1);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(1);
  const [deviceBreakdown, setDeviceBreakdown] = useState({
    mobile: 100,
    desktop: 0,
    tablet: 0,
    mobileCount: 1,
    desktopCount: 0,
    tabletCount: 0,
  });
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [topBrowsers, setTopBrowsers] = useState<{ browser: string; count: number }[]>([]);
  const [dailyCounts, setDailyCounts] = useState<{ date: string; label: string; count: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<VisitorRecord[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (idStr: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(idStr);
      }
    } catch {}
    setCopiedId(idStr);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Fetch actual recorded visitor data from Google Spreadsheet first, fallback to server & local
  const refreshAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const spreadsheetUrl = data?.companyConfig?.spreadsheetUrl;
      let logsToUse: VisitorRecord[] | null = null;

      // 1. Try to fetch directly from Google Spreadsheet Analytics_Logs
      if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
        const sheetLogs = await fetchRemoteAnalyticsFromSpreadsheet(spreadsheetUrl);
        if (sheetLogs && sheetLogs.length > 0) {
          logsToUse = sheetLogs;
          setDataSource('spreadsheet');
        }
      }

      // 2. Check if AppData already contains analyticsLogs from regular GET_DATA sync
      if (!logsToUse && data?.analyticsLogs && data.analyticsLogs.length > 0) {
        logsToUse = data.analyticsLogs as VisitorRecord[];
        setDataSource('spreadsheet');
      }

      // 3. Fallback to server endpoint
      if (!logsToUse || logsToUse.length === 0) {
        try {
          const res = await fetch('/api/analytics/stats');
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success' && json.data && json.data.logs && json.data.logs.length > 0) {
              logsToUse = json.data.logs as VisitorRecord[];
              setDataSource('server');
            }
          }
        } catch {
          // ignore server offline
        }
      }

      // 4. If remote logs found, calculate summary from them
      if (logsToUse && logsToUse.length > 0) {
        const summary = calculateAnalyticsSummaryFromLogs(logsToUse);
        setTotalPageViews(summary.totalViews);
        setUniqueVisitors(summary.uniqueVisitors);
        setDeviceBreakdown(summary.devicePercentages);
        setTopPages(summary.topPages);
        setTopBrowsers(summary.topBrowsers);
        setDailyCounts(summary.dailyCounts);
        setRecentLogs(summary.logs);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
        return;
      }

      // 5. Ultimate Fallback: get real data stored in browser localStorage
      const local = getLocalAnalyticsSummary();
      setTotalPageViews(local.totalViews);
      setUniqueVisitors(local.uniqueVisitors);
      setDeviceBreakdown(local.devicePercentages);
      setTopPages(local.topPages);
      setTopBrowsers(local.topBrowsers);
      setDailyCounts(local.dailyCounts || []);
      setRecentLogs(local.logs || []);
      setDataSource('local');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    } catch (err) {
      console.warn('Error loading real analytics stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [data?.companyConfig?.spreadsheetUrl, data?.analyticsLogs]);

  useEffect(() => {
    refreshAnalyticsData();
  }, [refreshAnalyticsData]);

  const ordersCount = (data.orders || []).length;
  const conversionRate = totalPageViews > 0 ? ((ordersCount / totalPageViews) * 100).toFixed(1) : '0.0';
  const maxChartCount = Math.max(...dailyCounts.map((d) => d.count), 5);

  const handleClearLogs = () => {
    if (window.confirm('Hapus seluruh riwayat log kunjungan lokal di browser ini? (Data di Google Spreadsheet tetap tersimpan)')) {
      clearLocalAnalytics();
      refreshAnalyticsData();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY BADGE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-700 via-rose-800 to-slate-900 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wide uppercase">
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>100% Data Kunjungan Riil (Real Tracking)</span>
            </span>

            {dataSource === 'spreadsheet' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
                <span>Tersinkron Database Spreadsheet</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Database className="w-3 h-3 text-amber-300" />
                <span>Sinkronisasi Lokal/Server</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
              <span>✨ Hemat Baris Aktif (1 Baris/Hari/Visitor)</span>
            </span>

            {lastSyncTime && (
              <span className="text-[10px] text-red-200 opacity-90">
                Pembaruan: {lastSyncTime}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Analitik Pengunjung Nyata
          </h2>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Data ini tersinkron langsung dari tab <strong className="text-white underline decoration-red-300">Analytics_Logs</strong> di Google Spreadsheet Anda, mencakup seluruh pengunjung dari HP maupun Komputer secara akurat (Waktu Indonesia Barat / WIB).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={refreshAnalyticsData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white text-red-900 hover:bg-red-50 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Tarik data analitik terbaru dari Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
          </button>

          <a
            href={gaGeneralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Buka portal resmi Google Analytics"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-200" />
            <span>Portal GA4 Web</span>
          </a>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Online Active Connections */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aktif Saat Ini
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {Math.max(activeUsers, 1)}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">pengunjung</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Koneksi WebSocket Aktif</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Page Views */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Kunjungan (Spreadsheet)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {totalPageViews}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-3 h-3" />
              <span>Total Baris Log Terakumulasi</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Unique Visitors */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pengunjung Unik
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {uniqueVisitors}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Berdasarkan Visitor Session ID
            </div>
          </div>
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Konversi Pesanan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {ordersCount} <span className="text-xs font-medium text-slate-500">order</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              Rasio Konversi: {conversionRate}% dari tayangan
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS & BREAKDOWNS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Daily Visits Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                Grafik Kunjungan Riil Harian (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total hits tayangan halaman yang dicatat langsung dari browser pengunjung
              </p>
            </div>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {dailyCounts.length > 0 ? (
              dailyCounts.map((item, index) => {
                const heightPercent = Math.max(12, Math.round((item.count / maxChartCount) * 100));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-gradient-to-t from-red-600 to-rose-500 dark:from-red-700 dark:to-rose-600 rounded-t-lg transition-all group-hover:brightness-110 relative"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg"></div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[50px]">
                      {item.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada log harian yang tersimpan
              </div>
            )}
          </div>
        </div>

        {/* Right: Device Breakdown (1 Col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Perangkat Pengunjung (Riil)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Smartphone / Mobile</span>
                <span>
                  {deviceBreakdown.mobile}% ({deviceBreakdown.mobileCount} hits)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${deviceBreakdown.mobile}%` }}
                  className="h-full bg-red-600 rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Desktop / PC</span>
                <span>
                  {deviceBreakdown.desktop}% ({deviceBreakdown.desktopCount} hits)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${deviceBreakdown.desktop}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Tablet / Lainnya</span>
                <span>
                  {deviceBreakdown.tablet}% ({deviceBreakdown.tabletCount} hits)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${deviceBreakdown.tablet}%` }}
                  className="h-full bg-purple-600 rounded-full transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Browser Dominan:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {topBrowsers[0]?.browser || 'Google Chrome'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. DAFTAR LOG KUNJUNGAN (FULL-WIDTH REDESIGNED TABLE) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Table Card Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center text-red-600 dark:text-red-400">
              <Radio className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Log Kunjungan ({recentLogs.length} Data)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
              Diurutkan dari kunjungan terbaru
            </span>
            {recentLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                title="Bersihkan Log Lokal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto w-full -mx-1 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-3.5">WAKTU KUNJUNGAN</th>
                <th className="py-3 px-3.5">ID PENGUNJUNG</th>
                <th className="py-3 px-3.5">FREKUENSI (HITS)</th>
                <th className="py-3 px-3.5">PERANGKAT & BROWSER</th>
                <th className="py-3 px-3.5">ISP PROVIDER</th>
                <th className="py-3 px-3.5">KOTA / LOKASI</th>
                <th className="py-3 px-3.5">ALUR / HALAMAN DIAKSES</th>
                <th className="py-3 px-3.5">SUMBER / REFERRER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => {
                  const logId = log.id || `log_${index}`;
                  const displayId = formatVisitorIdDisplay(log.visitorId || log.id);
                  const formattedTime = formatTableTimestamp(log.timestamp);
                  const hitsCount = Math.max(log.hits || 1, 1);
                  const deviceInfo = getDeviceDetails(log);
                  const ispName = getIspDetails(log);
                  const location = getLocationDetails(log);

                  const rawPages = (log.page || '/').split(',').map((p) => p.trim()).filter(Boolean);
                  const primaryPage = rawPages[0] || '/';
                  const pageBadge = getPagePill(primaryPage);
                  const hasMultiplePages = rawPages.length > 1;
                  const isExpanded = expandedLogId === logId;
                  const referrerDisplay = getReferrerDisplay(log.referrer);

                  return (
                    <React.Fragment key={logId}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                        {/* 1. WAKTU KUNJUNGAN */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formattedTime}</span>
                          </div>
                        </td>

                        {/* 2. ID PENGUNJUNG */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs shadow-2xs">
                            <span>{displayId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(displayId)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="Salin ID Pengunjung"
                            >
                              {copiedId === displayId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 3. FREKUENSI (HITS) */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-2xs">
                            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{hitsCount}x Hits</span>
                          </div>
                        </td>

                        {/* 4. PERANGKAT & BROWSER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              {deviceInfo.isMobile ? (
                                <Smartphone className="w-4 h-4" />
                              ) : deviceInfo.isTablet ? (
                                <Tablet className="w-4 h-4" />
                              ) : (
                                <Laptop className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 leading-tight">
                                <span>{deviceInfo.category}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{deviceInfo.os}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {deviceInfo.browser}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. ISP PROVIDER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Wifi className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {ispName}
                            </div>
                          </div>
                        </td>

                        {/* 6. KOTA / LOKASI */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {location.city}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                {location.region}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 7. ALUR / HALAMAN DIAKSES */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs shadow-2xs">
                              {pageBadge}
                            </span>
                            {hasMultiplePages && (
                              <button
                                type="button"
                                onClick={() => setExpandedLogId(isExpanded ? null : logId)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                                title="Klik untuk melihat seluruh halaman"
                              >
                                <span>+{rawPages.length - 1}</span>
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 8. SUMBER / REFERRER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {referrerDisplay}
                        </td>
                      </tr>

                      {/* Dropdown Multi-Pages Expand */}
                      {isExpanded && hasMultiplePages && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/60">
                          <td colSpan={8} className="py-2.5 px-6">
                            <div className="text-[11px] space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Seluruh {rawPages.length} Halaman Yang Dikunjungi Sesi Ini:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {rawPages.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-mono shadow-2xs"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    <p>Belum ada log kunjungan yang tersimpan. Klik <strong>"Sinkronkan Data"</strong> di atas untuk memuat dari spreadsheet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

