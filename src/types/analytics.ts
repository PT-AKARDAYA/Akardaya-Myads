export interface VisitorSessionLog {
  id: string;
  timestamp: string;
  deviceType: 'Mobile Android' | 'Mobile iPhone' | 'Desktop / Laptop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Opera' | 'Other';
  referrer: 'Google Search' | 'Direct / WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok' | 'Other';
  location: string;
  pageSection: string;
  duration: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  todayVisits: number;
  activeNow: number;
  topSource: string;
  avgDuration: string;
  mobilePercentage: number;
  topCity: string;
  recentLogs: VisitorSessionLog[];
}
