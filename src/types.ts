export interface ChannelRate {
  id: string;
  facility: string; // e.g. "SMS", "SMS FLASH", "MMS", "POPUP USSD", "POPUP INTERAKTIF", "RCS", "WA BUSINESS WABA", "WA BUSINESS UTILITY WABA"
  featureName: string; // e.g. "BROADCAST", "TARGETED", "LBA"
  ratePerUnit: number; // e.g. 100, 180, 200
  rateDisplay: string; // e.g. "@Rp.100"
  unit: string; // e.g. "/sms", "/pesan", "/tayang"
  description: string;
}

export type PackageCategory = 'ONE_KLIK' | 'MANDIRI' | 'UMKM' | 'CORPORATE';

export interface SubscriptionPackage {
  id: string;
  category: PackageCategory;
  categoryTitle: string; // "PAKET ONE KLIK TERIMA JADI", "PAKET MANDIRI", "PAKET UMKM", "PAKET CORPORATE"
  tierName: string; // "<200.000", "201.000 - 500.000", ">501.000", ">500.000", ">1000.000"
  name: string; // e.g. "One Klik Starter (<200k)", "One Klik Pro (201-500k)", etc.
  tagline: string;
  minBudget: number; // in IDR
  maxBudget?: number; // in IDR
  priceDisplay: string; // e.g. "Mulai Rp 150rb", "Rp 201rb - 500rb", "> Rp 501.000"
  badge?: string; // "Paling Praktis", "Pilihan Populer", "Rekomendasi UMKM", "Solusi Enterprise"
  isPopular?: boolean;
  
  // Facilities included (channel rate IDs enabled)
  enabledRateIds: string[]; // which channel rates can be used

  // Special benefits
  freeContentPerMonth: number; // 1, 2, 4 (GRATIS KONTEN UNTUK FB+INSTAGRAM+TIKTOK)
  freeWebsiteMonths: number; // 0 or 3 (FREE WEBSITE 3 BULAN)
  accountType: 'Akun AD' | 'Akun AD/Pribadi'; // PEMBUATAN AKUN MY ADS
  saldoInfo: string; // "SESUAI PAKET"

  description: string;
  keyHighlights: string[];
}

export interface DiscountConfig {
  reloadDiscountPercent: number; // default 3% (Misal 3% bisa di setting)
  isPromoActive: boolean;
  promoTitle: string;
  promoBadge: string;
  promoDescription: string;
  promoCountdownEnd?: string; // ISO date string
}

export interface CompanyConfig {
  brandName: string;
  brandTagline: string;
  waNumber: string; // e.g. "6281234567890" (clean number for wa.me)
  waDisplayNumber: string; // e.g. "+62 812-3456-7890"
  supportEmail: string;
  officeAddress: string;
  operatingHours: string;
  announcementText: string;
  showAnnouncement: boolean;
  spreadsheetUrl?: string; // Google Apps Script Web App Deployment URL
}

export interface Testimonial {
  id: string;
  name: string;
  companyOrStore: string;
  role: string;
  rating: number; // 1 - 5
  comment: string;
  packageName: string;
  date: string;
  avatarBgColor?: string;
  verified: boolean;
}

export interface OrderLead {
  id: string;
  customerName: string;
  whatsapp: string;
  businessName?: string;
  selectedPackageId: string;
  selectedPackageName: string;
  estimatedBudget: string;
  targetCityOrArea?: string;
  notes?: string;
  createdAt: string;
  status: 'PENDING' | 'CONTACTED' | 'ACTIVE' | 'COMPLETED';
  isRead?: boolean;
}

export interface OfficeLocation {
  id: string;
  name: string; // e.g. "Kantor Cabang TDC Gresik", "Kantor Pusat Jakarta"
  type: 'PUSAT' | 'CABANG' | 'SERVICE_POINT';
  cityName: string; // e.g. "Gresik", "Jakarta", "Surabaya"
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  operatingHours?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface AppData {
  packages: SubscriptionPackage[];
  channelRates: ChannelRate[];
  discountConfig: DiscountConfig;
  companyConfig: CompanyConfig;
  testimonials: Testimonial[];
  orders: OrderLead[];
  offices?: OfficeLocation[];
  analyticsLogs?: any[];
  lastUpdated: string;
}

export type WebSocketMessageType =
  | 'INIT_DATA'
  | 'SYNC_DATA'
  | 'UPDATE_DATA'
  | 'NEW_REVIEW'
  | 'NEW_ORDER'
  | 'ACTIVE_USERS';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
}
