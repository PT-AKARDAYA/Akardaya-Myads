// Real Visitor Tracking Utility with GA4 & Meta Pixel integration support

export interface VisitorRecord {
  id: string;
  visitorId: string;
  timestamp: string;
  page: string;
  device: 'Mobile' | 'Desktop' | 'Tablet' | string;
  browser: string;
  referrer: string;
  screen?: string;
  language?: string;
  eventType?: 'pageview' | 'order_submit' | 'package_view' | 'simulasi' | string;
  hits?: number;
  date?: string;
  firstTime?: string;
  lastTime?: string;
  os?: string;
  isp?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface GeoIspInfo {
  isp: string;
  city: string;
  region: string;
  country: string;
}

const GEO_CACHE_KEY = 'akardaya_geo_cache';

export function getCachedGeoIsp(): GeoIspInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.isp || parsed.city)) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export async function fetchGeoIspAsync(): Promise<GeoIspInfo | null> {
  if (typeof window === 'undefined') return null;
  const cached = getCachedGeoIsp();
  if (cached && cached.isp && cached.city) return cached;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const info: GeoIspInfo = {
          isp: data.connection?.isp || data.connection?.org || data.isp || 'Provider Internet',
          city: data.city || 'Indonesia',
          region: data.region || 'WIB',
          country: data.country || 'Indonesia',
        };
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(info));
        return info;
      }
    }
  } catch {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const info: GeoIspInfo = {
          isp: data.org || data.asn || 'Provider Internet',
          city: data.city || 'Indonesia',
          region: data.region || 'WIB',
          country: data.country_name || 'Indonesia',
        };
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(info));
        return info;
      }
    } catch {}
  }
  return null;
}

export interface LocalAnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  devicePercentages: {
    mobile: number;
    desktop: number;
    tablet: number;
    mobileCount: number;
    desktopCount: number;
    tabletCount: number;
  };
  topPages: { page: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  dailyCounts: { date: string; label: string; count: number }[];
  logs: VisitorRecord[];
}

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyJoS1CMQfAUGPNRec6bkgZthkhFY94Z5bIL6uLai5tMMb4OICx0RwLXlr_hCt4u4Cz/exec';

export function getJakartaTimestamp(): string {
  try {
    const d = new Date();
    // Jakarta is UTC+7
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat('id-ID', options);
    return formatter.format(d).replace(/\./g, ':') + ' WIB';
  } catch {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
  }
}

const STORAGE_KEY = 'akardaya_visitor_logs';
const VISITOR_ID_KEY = 'akardaya_unique_visitor_id';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let vId = localStorage.getItem(VISITOR_ID_KEY);
  if (!vId) {
    vId = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(VISITOR_ID_KEY, vId);
  }
  return vId;
}

export function getDetailedOS(ua: string): string {
  if (/Windows NT 10\.0/i.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7';
  if (/Windows/i.test(ua)) return 'Windows';
  const androidMatch = ua.match(/Android\s+([0-9\.]+)/i);
  if (androidMatch) return `Android ${androidMatch[1]}`;
  if (/Android/i.test(ua)) return 'Android';
  const iosMatch = ua.match(/OS\s+([0-9\_]+)/i);
  if (iosMatch) return `iOS ${iosMatch[1].replace(/_/g, '.')}`;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'OS Lainnya';
}

export function getDetailedBrowser(ua: string): string {
  const edgeMatch = ua.match(/Edg\/([0-9]+)/i);
  if (edgeMatch) return `Microsoft Edge ${edgeMatch[1]}`;
  const samsungMatch = ua.match(/SamsungBrowser\/([0-9]+)/i);
  if (samsungMatch) return `Samsung Internet ${samsungMatch[1]}`;
  const operaMatch = ua.match(/(?:OPR|Opera)\/([0-9]+)/i);
  if (operaMatch) return `Opera ${operaMatch[1]}`;
  const firefoxMatch = ua.match(/Firefox\/([0-9]+)/i);
  if (firefoxMatch) return `Mozilla Firefox ${firefoxMatch[1]}`;
  const chromeMatch = ua.match(/Chrome\/([0-9]+)/i);
  if (chromeMatch && !ua.includes('Edg') && !ua.includes('OPR')) return `Google Chrome ${chromeMatch[1]}`;
  const safariMatch = ua.match(/Version\/([0-9]+).*Safari/i);
  if (safariMatch) return `Apple Safari ${safariMatch[1]}`;
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Apple Safari';
  return 'Google Chrome';
}

export function formatVisitorIdDisplay(rawId?: string): string {
  if (!rawId) return 'VIS-ANON';
  if (rawId.startsWith('VIS-')) return rawId;
  // Convert standard ID hash to 6-char clean alphanumeric
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash * 31 + rawId.charCodeAt(i)) >>> 0;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  let temp = hash;
  for (let i = 0; i < 6; i++) {
    result += chars[temp % chars.length];
    temp = Math.floor(temp / chars.length) + (i * 7);
  }
  return `VIS-${result.slice(0, 6)}`;
}

function getBrowserName(ua: string): string {
  return getDetailedBrowser(ua);
}

function getDeviceType(ua: string): 'Mobile' | 'Desktop' | 'Tablet' {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
  if (/Mobile|iPhone|iPod|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera Mini|Opera Mobi/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export function initializeThirdPartyTrackers(gaId?: string, pixelId?: string) {
  if (typeof window === 'undefined') return;

  // 1. Google Analytics 4 (GA4) Injection
  if (gaId && gaId.trim().startsWith('G-')) {
    const cleanGaId = gaId.trim();
    if (!document.getElementById('ga4-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanGaId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'ga4-config';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${cleanGaId}');
      `;
      document.head.appendChild(inlineScript);
    }
  }

  // 2. Meta / Facebook Pixel Injection
  if (pixelId && pixelId.trim()) {
    const cleanPixelId = pixelId.trim();
    if (!document.getElementById('meta-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'meta-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${cleanPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }
}

/**
 * Tracks a real visitor event and logs to localStorage, server backend, and GA4 / FB Pixel
 */
export function trackRealVisitor(
  page: string = '/',
  eventType: 'pageview' | 'order_submit' | 'package_view' | 'simulasi' = 'pageview',
  spreadsheetUrl?: string
) {
  if (typeof window === 'undefined') return;

  try {
    const visitorId = getOrCreateVisitorId();

    // Format clean page name
    let cleanPage = page.trim();
    if (!cleanPage || cleanPage === '/' || cleanPage.toLowerCase() === '/akardaya-myads/' || cleanPage.toLowerCase() === '/akardaya-myads') {
      cleanPage = '/ (Beranda)';
    }

    // Rate limit: If visiting a DIFFERENT page/section, allow immediately!
    // If it's the exact same page, throttle to 3 seconds
    const lastTrackKey = 'akardaya_last_track_time';
    const lastPageKey = 'akardaya_last_track_page';
    const lastTrack = localStorage.getItem(lastTrackKey);
    const lastPage = localStorage.getItem(lastPageKey);
    const now = Date.now();
    
    if (lastPage === cleanPage && lastTrack && now - parseInt(lastTrack, 10) < 3000) {
      if (eventType === 'pageview') return;
    }
    localStorage.setItem(lastTrackKey, now.toString());
    localStorage.setItem(lastPageKey, cleanPage);

    const ua = navigator.userAgent || '';
    const device = getDeviceType(ua);
    const browser = getBrowserName(ua);
    const os = getDetailedOS(ua);
    const screen = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer ? new URL(document.referrer).hostname : 'Langsung (Direct)';
    const language = navigator.language || 'id-ID';

    const jakartaNow = getJakartaTimestamp();

    // Retrieve cached ISP and Location info (or fetch in background for future visits)
    let geoInfo = getCachedGeoIsp();
    if (!geoInfo) {
      fetchGeoIspAsync().catch(() => {});
    }

    const record: VisitorRecord = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      visitorId,
      timestamp: jakartaNow,
      page: cleanPage,
      device,
      browser,
      os,
      isp: geoInfo?.isp || undefined,
      city: geoInfo?.city || undefined,
      region: geoInfo?.region || undefined,
      country: geoInfo?.country || undefined,
      referrer,
      screen,
      language,
      eventType,
    };

    // Save locally with daily consolidation per visitor ID (keep last 200 records)
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const logs: VisitorRecord[] = existing ? JSON.parse(existing) : [];
      const todayDate = jakartaNow.substring(0, 10);
      
      const existingTodayIdx = logs.findIndex(
        (l) => l.visitorId === visitorId && (l.date === todayDate || (l.timestamp && l.timestamp.includes(todayDate)))
      );

      if (existingTodayIdx !== -1) {
        const existingRecord = logs[existingTodayIdx];
        const newHits = (existingRecord.hits || 1) + 1;
        const pageArr = (existingRecord.page || '').split(',').map((s) => s.trim()).filter(Boolean);
        if (!pageArr.includes(cleanPage)) {
          pageArr.push(cleanPage);
        }
        logs[existingTodayIdx] = {
          ...existingRecord,
          hits: newHits,
          page: pageArr.join(', '),
          isp: existingRecord.isp || geoInfo?.isp,
          city: existingRecord.city || geoInfo?.city,
          region: existingRecord.region || geoInfo?.region,
          os: existingRecord.os || os,
          lastTime: jakartaNow,
          timestamp: jakartaNow,
        };
      } else {
        logs.unshift({
          ...record,
          hits: 1,
          date: todayDate,
          firstTime: jakartaNow,
          lastTime: jakartaNow,
        });
        if (logs.length > 200) {
          logs.pop();
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore storage error
    }

    // Send to Google Analytics 4 if configured
    try {
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', eventType, { page_path: cleanPage });
      }
    } catch {
      // ignore
    }

    // Send to Meta Pixel if configured
    try {
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', eventType === 'order_submit' ? 'Lead' : 'PageView');
      }
    } catch {
      // ignore
    }

    // Send to Google Sheets Webhook if configured
    try {
      const activeSpreadsheetUrl = spreadsheetUrl || localStorage.getItem('akardaya_spreadsheet_url') || DEFAULT_GAS_URL;
      if (activeSpreadsheetUrl && activeSpreadsheetUrl.startsWith('http')) {
        const payload = JSON.stringify({
          action: 'track_visitor',
          visitorId,
          timestamp: jakartaNow,
          page: cleanPage,
          device: `${device} (${os})`,
          browser,
          isp: geoInfo?.isp || '',
          city: geoInfo?.city || '',
          region: geoInfo?.region || '',
          location: geoInfo?.city ? `${geoInfo.city}, ${geoInfo.region || 'ID'}` : '',
          referrer,
          eventType,
          screen,
        });

        // Use single fetch with keepalive: true (clean, reliable, avoids duplicate rows)
        fetch(activeSpreadsheetUrl, {
          method: 'POST',
          mode: 'no-cors', // Standard Google Apps Script way
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore sheet webhook error
    }

    // Send to server backend
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          page,
          device: `${device} (${os})`,
          browser,
          isp: geoInfo?.isp,
          city: geoInfo?.city,
          region: geoInfo?.region,
          referrer,
          eventType,
        }),
      }).catch(() => {});
    } catch {
      // ignore fetch error
    }
  } catch {
    // ignore overall tracking error
  }
}

/**
 * Parses any timestamp string (WIB, ISO, Slash format) into clean date structures
 */
export function parseVisitorTimestamp(ts: string): { dateStr: string; labelStr: string } {
  if (!ts) {
    const now = new Date();
    return {
      dateStr: now.toISOString().split('T')[0],
      labelStr: now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  }

  // 1. Check YYYY-MM-DD pattern (e.g. "2026-08-27 20:30:15 WIB" or "2026-08-27T13:30:15")
  const isoMatch = ts.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    const dateStr = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    const labelStr = !isNaN(d.getTime())
      ? d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      : `${day} ${month + 1}`;
    return { dateStr, labelStr };
  }

  // 2. Check DD/MM/YYYY pattern (e.g. "27/08/2026" or "27/08/2026 20:30:15")
  const dmyMatch = ts.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const labelStr = !isNaN(d.getTime())
      ? d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      : `${day}/${month + 1}`;
    return { dateStr, labelStr };
  }

  // 3. Fallback standard parse
  const d = new Date(ts);
  if (!isNaN(d.getTime())) {
    const dateStr = d.toISOString().split('T')[0];
    const labelStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    return { dateStr, labelStr };
  }

  const now = new Date();
  return {
    dateStr: now.toISOString().split('T')[0],
    labelStr: now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
  };
}

/**
 * Calculates complete dashboard statistics from an array of VisitorRecord logs
 * (works seamlessly for Google Spreadsheet rows, server logs, or local storage logs)
 */
export function calculateAnalyticsSummaryFromLogs(logs: VisitorRecord[]): LocalAnalyticsSummary {
  if (!logs || logs.length === 0) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      devicePercentages: { mobile: 0, desktop: 0, tablet: 0, mobileCount: 0, desktopCount: 0, tabletCount: 0 },
      topPages: [],
      topBrowsers: [],
      dailyCounts: [],
      logs: [],
    };
  }

  // Accumulate total views by summing up hits from each consolidated log row
  let totalViews = 0;
  logs.forEach((l) => {
    totalViews += Math.max(l.hits || 1, 1);
  });
  if (totalViews === 0 && logs.length > 0) totalViews = logs.length;

  const uniqueVisitorIds = new Set(logs.map((l) => l.visitorId || 'unknown'));
  const uniqueVisitors = Math.max(1, uniqueVisitorIds.size);

  // Device breakdown calculation
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  logs.forEach((l) => {
    const dev = (l.device || '').toLowerCase();
    const hits = Math.max(l.hits || 1, 1);
    if (dev.includes('mob') || dev.includes('hp') || dev.includes('phone') || dev.includes('android') || dev.includes('iphone')) {
      mobileCount += hits;
    } else if (dev.includes('tab') || dev.includes('ipad')) {
      tabletCount += hits;
    } else {
      desktopCount += hits;
    }
  });

  const totalDev = Math.max(1, mobileCount + desktopCount + tabletCount);
  const devicePercentages = {
    mobile: Math.round((mobileCount / totalDev) * 100),
    desktop: Math.round((desktopCount / totalDev) * 100),
    tablet: Math.round((tabletCount / totalDev) * 100),
    mobileCount,
    desktopCount,
    tabletCount,
  };

  // Top Pages
  const pageMap: Record<string, number> = {};
  logs.forEach((l) => {
    const rawPage = l.page || '/';
    const hits = Math.max(l.hits || 1, 1);
    if (rawPage.includes(',')) {
      const parts = rawPage.split(',').map((s) => s.trim()).filter(Boolean);
      const weightPerPart = Math.max(1, Math.round(hits / (parts.length || 1)));
      parts.forEach((p) => {
        pageMap[p] = (pageMap[p] || 0) + weightPerPart;
      });
    } else {
      pageMap[rawPage] = (pageMap[rawPage] || 0) + hits;
    }
  });
  const topPages = Object.entries(pageMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top Browsers
  const browserMap: Record<string, number> = {};
  logs.forEach((l) => {
    const b = l.browser || 'Google Chrome';
    const hits = Math.max(l.hits || 1, 1);
    browserMap[b] = (browserMap[b] || 0) + hits;
  });
  const topBrowsers = Object.entries(browserMap)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 7 Days Daily Activity
  const dayMap: Record<string, number> = {};
  logs.forEach((l) => {
    const parsed = parseVisitorTimestamp(l.timestamp);
    const hits = Math.max(l.hits || 1, 1);
    dayMap[parsed.dateStr] = (dayMap[parsed.dateStr] || 0) + hits;
  });

  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const labelStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    const count = dayMap[dateStr] || 0;
    days.push({ date: dateStr, label: labelStr, count });
  }

  return {
    totalViews,
    uniqueVisitors,
    devicePercentages,
    topPages,
    topBrowsers,
    dailyCounts: days,
    logs: logs.slice(0, 200),
  };
}

/**
 * Directly queries Google Apps Script to fetch latest Analytics_Logs rows
 */
export async function fetchRemoteAnalyticsFromSpreadsheet(
  spreadsheetUrl?: string
): Promise<VisitorRecord[] | null> {
  const targetUrl = spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null) || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return null;
  }

  try {
    const fetchUrl = targetUrl.includes('?')
      ? `${targetUrl}&action=GET_ANALYTICS&_t=${Date.now()}`
      : `${targetUrl}?action=GET_ANALYTICS&_t=${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        return json.data as VisitorRecord[];
      }
    }
  } catch (e) {
    console.warn('Direct GAS Analytics fetch error:', e);
  }
  return null;
}

/**
 * Returns summary statistics calculated purely from real recorded logs
 */
export function getLocalAnalyticsSummary(): LocalAnalyticsSummary {
  if (typeof window === 'undefined') {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      devicePercentages: { mobile: 0, desktop: 0, tablet: 0, mobileCount: 0, desktopCount: 0, tabletCount: 0 },
      topPages: [],
      topBrowsers: [],
      dailyCounts: [],
      logs: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const logs: VisitorRecord[] = raw ? JSON.parse(raw) : [];
    return calculateAnalyticsSummaryFromLogs(logs);
  } catch {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      devicePercentages: { mobile: 0, desktop: 0, tablet: 0, mobileCount: 0, desktopCount: 0, tabletCount: 0 },
      topPages: [],
      topBrowsers: [],
      dailyCounts: [],
      logs: [],
    };
  }
}

export function clearLocalAnalytics() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
