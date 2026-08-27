import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  CheckCircle2,
  Activity,
  Users,
  Eye,
  Smartphone,
  Globe2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Laptop,
  RefreshCw,
  Zap,
  Radio,
  Trash2,
  Filter,
  BarChart2,
  ArrowUpRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getLocalAnalyticsSummary,
  clearLocalAnalytics,
  trackRealVisitor,
  calculateAnalyticsSummaryFromLogs,
  fetchRemoteAnalyticsFromSpreadsheet,
  VisitorRecord,
} from '../utils/analyticsTracker';

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

  const handleManualPing = () => {
    trackRealVisitor(window.location.pathname || '/', 'pageview', data?.companyConfig?.spreadsheetUrl);
    setTimeout(() => {
      refreshAnalyticsData();
    }, 800);
  };

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
            onClick={handleManualPing}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
            title="Uji pencatatan sesi kunjungan Anda saat ini ke Google Spreadsheet"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Tes Ping Kunjungan</span>
          </button>

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

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Daily Visits Chart & Real Live Log Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Visits Bar Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
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

          {/* Real Recent Log Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Log Kunjungan Nyata (Tersinkron Database Spreadsheet)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  {recentLogs.length} Baris Terbaca
                </span>
                {recentLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Bersihkan Log Lokal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[360px] overflow-y-auto pr-1">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <div
                    key={log.id || `log_${index}`}
                    className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        {log.device?.toLowerCase().includes('mobile') || log.device?.toLowerCase().includes('hp') ? (
                          <Smartphone className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Laptop className="w-4 h-4 text-purple-500" />
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>
                            Halaman:{' '}
                            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 font-mono text-[11px]">
                              {log.page}
                            </code>
                          </span>
                          {log.hits && log.hits > 1 ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-extrabold flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" />
                              {log.hits}x Kunjungan Hari Ini
                            </span>
                          ) : null}
                          {log.eventType === 'order_submit' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                              🛒 Order Dikirim
                            </span>
                          )}
                        </div>

                        <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{log.device || 'Perangkat'}</span>
                          <span>•</span>
                          <span>{log.browser || 'Browser'}</span>
                          <span>•</span>
                          <span className="text-slate-400">{log.referrer || 'Langsung'}</span>
                          {log.visitorId && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-slate-400">ID: {log.visitorId.slice(0, 10)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 mt-0.5 text-right">
                      {log.timestamp && log.timestamp.includes('WIB')
                        ? log.timestamp
                        : !isNaN(new Date(log.timestamp).getTime())
                        ? new Date(log.timestamp).toLocaleString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          }) + ' WIB'
                        : log.timestamp}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <p>Belum ada data log yang dimuat. Klik tombol <strong>"Sinkronkan Data"</strong> di kanan atas untuk menarik log dari spreadsheet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Device & Browser Breakdown */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
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
          </div>

          {/* Top Pages */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Globe2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Halaman Paling Sering Dibuka
            </h3>
            <div className="space-y-2">
              {topPages.length > 0 ? (
                topPages.map((tp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                  >
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                      {tp.page}
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400">{tp.count}x dibuka</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-2">Belum ada data halaman</div>
              )}
            </div>
          </div>

          {/* Top Browsers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Browser Pengunjung Nyata
            </h3>
            <div className="space-y-2">
              {topBrowsers.length > 0 ? (
                topBrowsers.map((tb, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{tb.browser}</span>
                    <span className="font-bold text-slate-500">{tb.count} sesi</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-2">Belum ada data browser</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
