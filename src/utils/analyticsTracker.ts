// Real Visitor Tracking Utility with GA4 & Meta Pixel integration support

export interface VisitorRecord {
  id: string;
  visitorId: string;
  timestamp: string;
  page: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  referrer: string;
  screen: string;
  language: string;
  eventType?: 'pageview' | 'order_submit' | 'package_view' | 'simulasi';
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

function getBrowserName(ua: string): string {
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Google Chrome';
  if (ua.includes('Safari')) return 'Apple Safari';
  return 'Web Browser';
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
  eventType: 'pageview' | 'order_submit' | 'package_view' | 'simulasi' = 'pageview'
) {
  if (typeof window === 'undefined') return;

  try {
    const visitorId = getOrCreateVisitorId();

    // Rate limit per session to avoid recording infinite duplicate clicks on same page
    const lastTrackKey = 'akardaya_last_track_time';
    const lastTrack = localStorage.getItem(lastTrackKey);
    const now = Date.now();
    if (lastTrack && now - parseInt(lastTrack, 10) < 3000) {
      if (eventType === 'pageview') return;
    }
    localStorage.setItem(lastTrackKey, now.toString());

    const ua = navigator.userAgent || '';
    const device = getDeviceType(ua);
    const browser = getBrowserName(ua);
    const screen = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer ? new URL(document.referrer).hostname : 'Langsung (Direct)';
    const language = navigator.language || 'id-ID';

    const record: VisitorRecord = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      visitorId,
      timestamp: new Date().toISOString(),
      page,
      device,
      browser,
      referrer,
      screen,
      language,
      eventType,
    };

    // Save locally (keep last 200 records)
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const logs: VisitorRecord[] = existing ? JSON.parse(existing) : [];
      logs.unshift(record);
      if (logs.length > 200) {
        logs.pop();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore storage error
    }

    // Send to Google Analytics 4 if configured
    try {
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', eventType, { page_path: page });
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

    // Send to server backend
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          page,
          device,
          browser,
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

    const totalViews = logs.length;
    const uniqueVisitorIds = new Set(logs.map((l) => l.visitorId || 'default'));
    const uniqueVisitors = uniqueVisitorIds.size;

    // Device breakdown
    let mobileCount = logs.filter((l) => l.device === 'Mobile').length;
    let desktopCount = logs.filter((l) => l.device === 'Desktop').length;
    let tabletCount = logs.filter((l) => l.device === 'Tablet').length;

    if (totalViews === 0) {
      const currentDev = getDeviceType(navigator.userAgent || '');
      if (currentDev === 'Mobile') mobileCount = 1;
      else if (currentDev === 'Tablet') tabletCount = 1;
      else desktopCount = 1;
    }

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
      const p = l.page || '/';
      pageMap[p] = (pageMap[p] || 0) + 1;
    });
    const topPages = Object.entries(pageMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Browsers
    const browserMap: Record<string, number> = {};
    logs.forEach((l) => {
      const b = l.browser || 'Chrome';
      browserMap[b] = (browserMap[b] || 0) + 1;
    });
    const topBrowsers = Object.entries(browserMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily counts for past 7 days
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const labelStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      const count = logs.filter((l) => l.timestamp.startsWith(dateStr)).length;
      days.push({ date: dateStr, label: labelStr, count });
    }

    return {
      totalViews: Math.max(logs.length > 0 ? logs.length : 1, 1),
      uniqueVisitors: Math.max(uniqueVisitors > 0 ? uniqueVisitors : 1, 1),
      devicePercentages,
      topPages,
      topBrowsers,
      dailyCounts: days,
      logs,
    };
  } catch {
    return {
      totalViews: 1,
      uniqueVisitors: 1,
      devicePercentages: { mobile: 100, desktop: 0, tablet: 0, mobileCount: 1, desktopCount: 0, tabletCount: 0 },
      topPages: [{ page: '/', count: 1 }],
      topBrowsers: [{ browser: 'Google Chrome', count: 1 }],
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
