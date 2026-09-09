import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Layers,
  Search,
  Sparkles,
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
  STORAGE_KEY,
} from '../utils/analyticsTracker';

// Helper to format table timestamp into clean format "DD/MM/YYYY, HH.mm.ss"
function formatTableTimestamp(ts: string | undefined): string {
  if (!ts) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hour}.${min}.${sec}`;
  }

  try {
    const raw = ts.trim();

    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', mei: '05',
      jun: '06', jul: '07', aug: '08', ags: '08', sep: '09', oct: '10', okt: '10',
      nov: '11', dec: '12', des: '12',
    };

    const allTimes = Array.from(raw.matchAll(/(?:^|[\s,T])(\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?)/g)).map((m) => m[1]);
    let targetTime = allTimes.find((t) => !t.startsWith('00:00') && !t.startsWith('0:00')) || allTimes[allTimes.length - 1] || '00:00:00';
    targetTime = targetTime.replace(/:/g, '.');
    if (targetTime.split('.').length === 2) targetTime += '.00';
    const timeParts = targetTime.split('.');
    const cleanTime = `${timeParts[0].padStart(2, '0')}.${timeParts[1].padStart(2, '0')}.${(timeParts[2] || '00').padStart(2, '0')}`;

    const textDateMatch = raw.match(/([A-Za-z]{3,4})\s+(\d{1,2})\s+(\d{4})/i) ||
                          raw.match(/(\d{1,2})\s+([A-Za-z]{3,4})\s+(\d{4})/i);

    if (textDateMatch) {
      let day = '';
      let month = '';
      let year = '';

      if (isNaN(Number(textDateMatch[1]))) {
        const mKey = textDateMatch[1].slice(0, 3).toLowerCase();
        month = monthMap[mKey] || '01';
        day = textDateMatch[2].padStart(2, '0');
        year = textDateMatch[3];
      } else {
        day = textDateMatch[1].padStart(2, '0');
        const mKey = textDateMatch[2].slice(0, 3).toLowerCase();
        month = monthMap[mKey] || '01';
        year = textDateMatch[3];
      }

      return `${day}/${month}/${year}, ${cleanTime}`;
    }

    const dmyMatch = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) year = `20${year}`;
      const hour = dmyMatch[4].padStart(2, '0');
      const min = dmyMatch[5].padStart(2, '0');
      const sec = (dmyMatch[6] || '00').padStart(2, '0');
      return `${day}/${month}/${year}, ${hour}.${min}.${sec}`;
    }

    const isoMatch = raw.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[T\s]+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      const hour = isoMatch[4].padStart(2, '0');
      const min = isoMatch[5].padStart(2, '0');
      const sec = (isoMatch[6] || '00').padStart(2, '0');
      return `${day}/${month}/${year}, ${hour}.${min}.${sec}`;
    }

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
      return `${day}/${month}/${year}, ${hour}.${min}.${sec}`;
    }
  } catch {}

  const safeFallback = ts
    .replace(/\s*\(Western Indonesia Time\)/gi, '')
    .replace(/00:00:00\s*GMT\+0700/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return safeFallback;
}

// Helper for friendly page name formatted with clean label
function getPagePill(rawPage: string | undefined): string {
  const p = (rawPage || '/').trim();
  if (p === '/' || p.toLowerCase().includes('beranda') || p.toLowerCase() === '/akardaya-myads/' || p.toLowerCase() === '/akardaya-myads') {
    return 'Beranda Utama';
  }
  if (p.includes('katalog') || p.includes('layanan')) return 'Katalog 6 Layanan Terpadu';
  if (p.includes('mitra') || p.includes('pendaftaran')) return 'Pendaftaran Mitra Baru';
  if (p.includes('paket-langganan') || p.includes('paket')) return 'Paket Langganan';
  if (p.includes('kalkulator') || p.includes('simulasi')) return 'Kalkulator Biaya';
  if (p.includes('testimoni') || p.includes('ulasan')) return 'Testimoni & Ulasan';
  if (p.includes('inventori') || p.includes('myads')) return 'Inventori MyAds';
  if (p.includes('matriks') || p.includes('fitur')) return 'Tabel Matriks';
  if (p.includes('lokasi') || p.includes('kantor') || p.includes('cabang')) return 'Lokasi Kantor';
  if (p.includes('chat') || p.includes('konsultasi') || p.includes('whatsapp')) return 'Konsultasi WA';
  if (p.includes('pesanan') || p.includes('order')) return 'Form Order Iklan';
  return p.length > 25 ? p.slice(0, 25) + '...' : p;
}

// Helper for device, OS, and browser details from real log
function getDeviceDetails(log: VisitorRecord) {
  const dev = (log.device || '').toLowerCase();
  const isMobile = dev.includes('mob') || dev.includes('hp') || dev.includes('phone') || dev.includes('android') || dev.includes('iphone');
  const isTablet = dev.includes('tab') || dev.includes('ipad');

  let category = 'PC';
  if (isTablet) category = 'Tablet';
  else if (isMobile) category = 'HP';

  let os = log.os;
  if (!os || os === 'OS Lainnya') {
    if (category === 'HP') {
      os = dev.includes('iphone') ? 'iOS' : 'Android';
    } else if (category === 'Tablet') {
      os = dev.includes('ipad') ? 'iPadOS' : 'Android Tab';
    } else {
      os = 'Windows 10/11';
    }
  }

  const browser = log.browser || 'Google Chrome';

  return {
    category,
    os,
    browser,
    isMobile,
    isTablet,
  };
}

// Helper for ISP Provider from real database (strictly no dummy data)
function getIspDetails(log: VisitorRecord): string {
  if (log.isp && log.isp.trim() && log.isp.trim() !== '-' && log.isp.toLowerCase() !== 'undefined') {
    return log.isp.trim();
  }
  return '-';
}

// Helper for City & Location from real database (strictly no dummy data)
function getLocationDetails(log: VisitorRecord): { city: string; region: string } {
  const city = log.city && log.city.trim() !== '-' && log.city.toLowerCase() !== 'undefined' ? log.city.trim() : '-';
  const region = log.region && log.region.trim() !== '-' && log.region.toLowerCase() !== 'undefined' ? log.region.trim() : '';
  return { city, region };
}

// Helper for Referrer from real database (strictly no dummy data)
function getReferrerDisplay(rawRef: string | undefined): string {
  if (!rawRef || rawRef.trim() === '' || rawRef === '-' || rawRef.toLowerCase().includes('langsung') || rawRef.toLowerCase().includes('direct')) {
    return 'Akses Langsung';
  }
  const low = rawRef.toLowerCase();
  if (low.includes('google')) return 'Google Search Engine';
  if (low.includes('instagram')) return 'Instagram';
  if (low.includes('facebook') || low.includes('fb')) return 'Facebook';
  if (low.includes('whatsapp') || low.includes('wa.me')) return 'WhatsApp Direct';
  if (low.includes('tiktok')) return 'TikTok Ads';
  return rawRef.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export const VisitorAnalyticsDashboard: React.FC = () => {
  const { data, activeUsers } = useApp();
  const gaGeneralUrl = 'https://analytics.google.com/analytics/web/';

  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'spreadsheet' | 'server' | 'local'>('local');
  const [totalPageViews, setTotalPageViews] = useState<number>(0);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);
  const [deviceBreakdown, setDeviceBreakdown] = useState({
    mobile: 0,
    desktop: 0,
    tablet: 0,
    mobileCount: 0,
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

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedPage, setSelectedPage] = useState('all');

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
  const refreshAnalyticsData = useCallback(async (forceRemoteOnly = false) => {
    setIsLoading(true);
    try {
      const spreadsheetUrl = data?.companyConfig?.spreadsheetUrl;
      let logsToUse: VisitorRecord[] | null = null;
      let sourceFound: 'spreadsheet' | 'server' | 'local' = 'local';

      // 1. Try to fetch directly from Google Spreadsheet Analytics_Logs
      if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
        const sheetLogs = await fetchRemoteAnalyticsFromSpreadsheet(spreadsheetUrl);
        if (sheetLogs !== null) {
          logsToUse = sheetLogs;
          sourceFound = 'spreadsheet';
          // SINKRONISASI DATABASE KE LOCAL STORAGE
          // Google Spreadsheet adalah SUMBER KEBENARAN UTAMA (Single Source of Truth)
          // Jika di spreadsheet 0 data (atau database di-reset), sinkronkan local storage menjadi 0 data
          // agar data lama di browser tidak muncul kembali sebagai data hantu!
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetLogs));
          } catch {}
        }
      }

      // 2. Check if AppData already contains analyticsLogs from regular GET_DATA sync
      if (logsToUse === null && data?.analyticsLogs !== undefined && Array.isArray(data.analyticsLogs)) {
        logsToUse = data.analyticsLogs as VisitorRecord[];
        sourceFound = 'spreadsheet';
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToUse));
        } catch {}
      }

      // 3. Fallback to server endpoint if spreadsheet is not reachable (only if not forceRemoteOnly)
      if (logsToUse === null && !forceRemoteOnly) {
        try {
          const res = await fetch('/api/analytics/stats');
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success' && json.data && Array.isArray(json.data.logs)) {
              logsToUse = json.data.logs as VisitorRecord[];
              sourceFound = 'server';
            }
          }
        } catch {}
      }

      // 4. Fallback to local storage only if all above are unavailable and not forceRemoteOnly
      if (logsToUse === null && !forceRemoteOnly) {
        const local = getLocalAnalyticsSummary();
        logsToUse = local.logs || [];
        sourceFound = 'local';
      }

      setDataSource(sourceFound);

      // Calculate statistics purely from the real logs
      const summary = calculateAnalyticsSummaryFromLogs(logsToUse || []);
      setTotalPageViews(summary.totalViews);
      setUniqueVisitors(summary.uniqueVisitors);
      setDeviceBreakdown(summary.devicePercentages);
      setTopPages(summary.topPages);
      setTopBrowsers(summary.topBrowsers);
      setDailyCounts(summary.dailyCounts);
      setRecentLogs(summary.logs);
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

  const handleClearLogs = async () => {
    const hasSpreadsheet = dataSource === 'spreadsheet' && data?.companyConfig?.spreadsheetUrl;
    const confirmMsg = hasSpreadsheet
      ? 'Hapus seluruh data log kunjungan?\n\n• OK: Bersihkan database di Google Spreadsheet dan reset cache lokal\n• Batal: Tidak jadi menghapus'
      : 'Hapus seluruh riwayat log kunjungan lokal di browser ini?';

    if (window.confirm(confirmMsg)) {
      clearLocalAnalytics();
      if (hasSpreadsheet && data?.companyConfig?.spreadsheetUrl) {
        setIsLoading(true);
        try {
          await fetch(data.companyConfig.spreadsheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'CLEAR_ANALYTICS' }),
          });
        } catch {}
      }
      setTimeout(() => {
        refreshAnalyticsData(true);
      }, 500);
    }
  };

  const [isDeduplicating, setIsDeduplicating] = useState(false);

  const handleDeduplicateLogs = async () => {
    const spreadsheetUrl = data?.companyConfig?.spreadsheetUrl;
    if (!spreadsheetUrl) {
      alert('URL Google Spreadsheet belum disetel di Pengaturan Spreadsheet.');
      return;
    }

    setIsDeduplicating(true);
    try {
      await fetch(spreadsheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'DEDUPLICATE_ANALYTICS' }),
      });
      setTimeout(() => {
        refreshAnalyticsData(true);
        setIsDeduplicating(false);
      }, 1200);
    } catch {
      setIsDeduplicating(false);
    }
  };

  // Extract Top Cities & Region Distribution (Berdasarkan Pengunjung Unik)
  const { topCities, cityOptions } = useMemo(() => {
    // Map each unique visitor ID to their detected city
    const visitorCityMap = new Map<string, string>();
    const citiesSet = new Set<string>();

    recentLogs.forEach((l, idx) => {
      const loc = getLocationDetails(l);
      const city = loc.city;
      if (city && city !== '-') {
        citiesSet.add(city);
        const vid = l.visitorId && l.visitorId.trim() ? l.visitorId.trim() : (l.id || `anon-${idx}`);
        const existing = visitorCityMap.get(vid);
        // Prioritize specific city name over generic 'Indonesia'
        if (!existing || (existing.toLowerCase() === 'indonesia' && city.toLowerCase() !== 'indonesia')) {
          visitorCityMap.set(vid, city);
        }
      }
    });

    const cityCountMap: Record<string, number> = {};
    visitorCityMap.forEach((city) => {
      cityCountMap[city] = (cityCountMap[city] || 0) + 1;
    });

    const sorted = Object.entries(cityCountMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    return {
      topCities: sorted,
      cityOptions: Array.from(citiesSet),
    };
  }, [recentLogs]);

  const topCity = topCities.length > 0 ? topCities[0] : null;

  // Distinct pages for filter
  const pageOptions = useMemo(() => {
    const set = new Set<string>();
    recentLogs.forEach((l) => {
      const p = getPagePill(l.page);
      set.add(p);
    });
    return Array.from(set);
  }, [recentLogs]);

  // Formatted Top Pages with percentages (Berdasarkan Pengunjung Unik)
  const formattedTopPages = useMemo(() => {
    // Count unique visitors who opened each page
    const pageVisitorMap: Record<string, Set<string>> = {};
    recentLogs.forEach((l, idx) => {
      const rawPage = l.page || '/';
      const vid = l.visitorId && l.visitorId.trim() ? l.visitorId.trim() : (l.id || `anon-${idx}`);
      if (rawPage.includes(',')) {
        const parts = rawPage.split(',').map((s) => s.trim()).filter(Boolean);
        parts.forEach((p) => {
          if (!pageVisitorMap[p]) pageVisitorMap[p] = new Set();
          pageVisitorMap[p].add(vid);
        });
      } else {
        if (!pageVisitorMap[rawPage]) pageVisitorMap[rawPage] = new Set();
        pageVisitorMap[rawPage].add(vid);
      }
    });

    const uniquePageList = Object.entries(pageVisitorMap)
      .map(([page, visitorsSet]) => ({ page, count: visitorsSet.size }))
      .sort((a, b) => b.count - a.count);

    const pagesToUse = uniquePageList.length > 0 ? uniquePageList : topPages;
    const total = Math.max(uniqueVisitors, pagesToUse[0]?.count || 1, 1);

    return pagesToUse.slice(0, 4).map((tp) => {
      const label = getPagePill(tp.page);
      const pct = Math.min(Math.round((tp.count / total) * 100), 100);
      return {
        label,
        count: tp.count,
        pct,
      };
    });
  }, [recentLogs, topPages, uniqueVisitors]);

  // Filtered Logs for the Table
  const filteredLogs = useMemo(() => {
    return recentLogs.filter((log) => {
      const displayId = formatVisitorIdDisplay(log.visitorId || log.id).toLowerCase();
      const loc = getLocationDetails(log);
      const cityLower = loc.city.toLowerCase();
      const regionLower = loc.region.toLowerCase();
      const dev = getDeviceDetails(log);
      const pageLabel = getPagePill(log.page).toLowerCase();
      const ispLower = getIspDetails(log).toLowerCase();
      const refLower = getReferrerDisplay(log.referrer).toLowerCase();

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          displayId.includes(q) ||
          cityLower.includes(q) ||
          regionLower.includes(q) ||
          dev.category.toLowerCase().includes(q) ||
          dev.os.toLowerCase().includes(q) ||
          dev.browser.toLowerCase().includes(q) ||
          pageLabel.includes(q) ||
          ispLower.includes(q) ||
          refLower.includes(q);
        if (!match) return false;
      }

      // Device filter
      if (selectedDevice !== 'all') {
        if (selectedDevice === 'mobile' && !dev.isMobile) return false;
        if (selectedDevice === 'desktop' && dev.category !== 'PC') return false;
        if (selectedDevice === 'tablet' && !dev.isTablet) return false;
      }

      // City filter
      if (selectedCity !== 'all') {
        if (loc.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      // Page filter
      if (selectedPage !== 'all') {
        if (getPagePill(log.page) !== selectedPage) return false;
      }

      return true;
    });
  }, [recentLogs, searchQuery, selectedDevice, selectedCity, selectedPage]);

  // Mobile percentage calculation for Card 3
  const totalDevCount = deviceBreakdown.mobileCount + deviceBreakdown.desktopCount + deviceBreakdown.tabletCount;
  const hpPercent = totalDevCount > 0 ? Math.round((deviceBreakdown.mobileCount / totalDevCount) * 100) : 0;
  const desktopPercent = totalDevCount > 0 ? Math.round((deviceBreakdown.desktopCount / totalDevCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS (4 CARDS MATCHING SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL KUNJUNGAN */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTAL KUNJUNGAN
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalPageViews}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Total log pageview tercatat
            </p>
          </div>
        </div>

        {/* Card 2: PENGUNJUNG UNIK (ID) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PENGUNJUNG UNIK (ID)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {uniqueVisitors}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Device ID
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Pengguna berbeda yang membuka app
            </p>
          </div>
        </div>

        {/* Card 3: PERANGKAT AKSES */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PERANGKAT AKSES
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalDevCount > 0 ? `${hpPercent}%` : '0%'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                HP / Mobile
              </span>
            </div>

            {/* Split Progress Bar (Red for Mobile, Blue for Desktop) */}
            <div className="w-full h-2 rounded-full overflow-hidden flex mt-2.5 bg-slate-100 dark:bg-slate-800">
              <div
                style={{ width: `${totalDevCount > 0 ? hpPercent : 0}%` }}
                className="h-full bg-red-600 transition-all"
                title={`HP: ${hpPercent}%`}
              />
              <div
                style={{ width: `${totalDevCount > 0 ? desktopPercent : 0}%` }}
                className="h-full bg-blue-600 transition-all"
                title={`Desktop: ${desktopPercent}%`}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              <span>HP: {deviceBreakdown.mobileCount}</span>
              <span>Desktop: {deviceBreakdown.desktopCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: WILAYAH TERBANYAK */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              WILAYAH TERBANYAK
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">
              {topCity ? topCity.city : 'Belum Ada Data'}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {topCity ? `${topCity.count} pengunjung unik tercatat` : '0 pengunjung unik'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SEBARAN WILAYAH & HALAMAN TERPOPULER (2 CARDS SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Sebaran Wilayah & Kota Pengunjung */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sebaran Wilayah & Kota Pengunjung
              </h3>
            </div>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50"
              title="Dihitung berdasarkan pengunjung unik per wilayah"
            >
              {topCities.length > 0 ? `Semua Kota (${topCities.length})` : 'Semua Kota'}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1.5 space-y-3.5 divide-y divide-slate-100/80 dark:divide-slate-800/60">
            {topCities.length > 0 ? (
              topCities.map((item, idx) => {
                const totalUniqueWithCity = topCities.reduce((sum, c) => sum + c.count, 0);
                const total = Math.max(totalUniqueWithCity, uniqueVisitors, 1);
                const pct = Math.min(Math.round((item.count / total) * 100), 100);
                return (
                  <div key={idx} className={`space-y-1.5 ${idx > 0 ? 'pt-3' : ''}`} title={`${item.count} pengunjung unik (${pct}%)`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.city}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {item.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(pct, 100)}%` }}
                        className="h-full bg-red-600 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                <p>Belum ada data sebaran wilayah pengunjung.</p>
                <p className="text-[10px] text-slate-400/80 mt-0.5">Data kota dan wilayah akan muncul otomatis saat ada pengunjung.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Halaman Paling Sering Dibuka */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Halaman Paling Sering Dibuka
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50" title="Dihitung berdasarkan jumlah pengunjung unik yang membuka tiap halaman">
              Pengunjung Unik
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1.5 space-y-3.5 divide-y divide-slate-100/80 dark:divide-slate-800/60">
            {formattedTopPages.length > 0 ? (
              formattedTopPages.map((item, idx) => {
                return (
                  <div key={idx} className={`space-y-1.5 ${idx > 0 ? 'pt-3' : ''}`} title={`${item.count} pengunjung unik (${item.pct}%)`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {item.count} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(item.pct, 100)}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <Layers className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                <p>Belum ada data aktivitas halaman.</p>
                <p className="text-[10px] text-slate-400/80 mt-0.5">Riwayat halaman yang dibuka pengunjung akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR (ROW MATCHING SCREENSHOT) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input with Magnifier */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pengunjung, Kota, Perangkat, Halaman, Browser..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter 1: Perangkat */}
          <div className="relative shrink-0">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full sm:w-auto min-w-[150px] appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">Semua Perangkat</option>
              <option value="mobile">HP / Mobile</option>
              <option value="desktop">Desktop / PC</option>
              <option value="tablet">Tablet</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter 2: Kota / Wilayah */}
          <div className="relative shrink-0">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-auto min-w-[160px] appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">Semua Kota / Wilayah</option>
              {cityOptions.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter 3: Halaman */}
          <div className="relative shrink-0">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full sm:w-auto min-w-[150px] appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">Semua Halaman</option>
              {pageOptions.map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refreshAnalyticsData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Muat ulang data analitik"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. DAFTAR LOG KUNJUNGAN (MATCHING TABLE DESIGN IN SCREENSHOT) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Table Card Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Log Kunjungan ({filteredLogs.length} Data)
            </h3>
            {dataSource === 'spreadsheet' && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                Live Spreadsheet
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
              Diurutkan dari kunjungan terbaru
            </span>
            {dataSource === 'spreadsheet' && (
              <button
                onClick={handleDeduplicateLogs}
                disabled={isDeduplicating}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors flex items-center gap-1.5 shadow-sm"
                title="Gabungkan baris dengan tanggal & perangkat yang sama menjadi 1 baris untuk menghemat kapasitas baris di Google Spreadsheet"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDeduplicating ? 'animate-spin text-teal-600' : 'text-teal-600 dark:text-teal-400'}`} />
                <span>{isDeduplicating ? 'Menggabungkan...' : 'Gabungkan Duplikat (Hemat Baris)'}</span>
              </button>
            )}
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
              title="Reset Cache Lokal di Browser"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto w-full -mx-1 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
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
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
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
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hitsCount}x Hits</span>
                          </div>
                        </td>

                        {/* 4. PERANGKAT & BROWSER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-blue-500 dark:text-blue-400 shrink-0">
                              {deviceInfo.isMobile ? (
                                <Smartphone className="w-4 h-4" />
                              ) : deviceInfo.isTablet ? (
                                <Tablet className="w-4 h-4" />
                              ) : (
                                <Laptop className="w-4 h-4" />
                              )}
                            </div>
                            <div className="leading-tight">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {deviceInfo.category} {deviceInfo.os}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                {deviceInfo.browser}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. ISP PROVIDER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {ispName}
                            </span>
                          </div>
                        </td>

                        {/* 6. KOTA / LOKASI */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {location.city}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                {location.region}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 7. ALUR / HALAMAN DIAKSES */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                              {pageBadge}
                            </span>
                            {hasMultiplePages && (
                              <button
                                type="button"
                                onClick={() => setExpandedLogId(isExpanded ? null : logId)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                              >
                                <span>+{rawPages.length - 1}</span>
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 8. SUMBER / REFERRER */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
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
                    <p>
                      Tidak ada data yang cocok dengan kriteria pencarian atau filter.
                    </p>
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


