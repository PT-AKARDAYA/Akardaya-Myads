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
  tierName: string; // "<200.000", "200.000 - 499.999", "≥ 500.000", "≥ 1.000.000"
  name: string; // e.g. "One Klik Starter (<200k)", "One Klik Pro (201-500k)", etc.
  tagline: string;
  minBudget: number; // in IDR
  maxBudget?: number; // in IDR
  priceDisplay: string; // e.g. "Mulai Rp 150rb", "Rp 200.000 - 499.999", "≥ Rp 500.000"
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

export interface MonetaryTier {
  id: string;
  minAmount: number; // minimum amount to qualify for this tier
  maxAmount: number | null; // maximum amount to qualify, null means no limit
  label: string; // e.g., "<=500.000" or ">=1.000.000"
  bonusPercent: number; // e.g., 30 for 30%
}

export interface DiscountConfig {
  reloadDiscountPercent: string | number; // e.g., 50 or "0% - 50%" (Legacy/Deprecated, keeping for compatibility)
  monetaryTiers?: MonetaryTier[]; // The configurable bonus schema
  isPromoActive: boolean;
  promoTitle: string;
  promoBadge: string;
  promoDescription: string;
  promoCountdownEnd?: string; // ISO date string
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "BCA (Bank Central Asia)"
  accountNumber: string; // e.g. "0188-3333-7157"
  accountHolder: string; // e.g. "PT Akardaya Telekomunikasi Indonesia"
  isPrimary?: boolean;
  isActive?: boolean;
  notes?: string; // e.g. "Menerima transfer dari semua bank / BI-FAST"
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
  // Pengaturan Rekening Pembayaran Resmi (Admin Setting)
  bankName?: string; // e.g. "BCA (Bank Central Asia)" (Legacy/Fallback)
  bankAccountNumber?: string; // e.g. "0188-3333-7157" (Legacy/Fallback)
  bankAccountHolder?: string; // e.g. "PT Akardaya Telekomunikasi Indonesia" (Legacy/Fallback)
  paymentInstructions?: string; // e.g. "Silakan transfer sesuai estimasi total ke rekening resmi di atas..."
  bankAccounts?: BankAccount[]; // Multi-rekening resmi admin
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
  // Detail Pilihan Order Kampanye
  campaignType?: 'LBA' | 'BROADCAST' | 'TARGETED' | string;
  channelName?: string;
  channelRate?: number;
  estimatedReach?: number;
  totalPayment?: number;
  // Detail Sasaran LBA & Kampanye
  latitude?: number;
  longitude?: number;
  radiusMeters?: number; // 300 to 3000
  streetAddress?: string;
  broadcastDate?: string; // Tanggal Broadcast (min H+3)
  adMessageContent?: string; // Isi pesan siar iklan (max 160 karakter)
  webLink?: string; // Link URL Web / Landing Page jika ada
  senderName?: string; // Nama Sender / Masking Pengirim
  // Parameter Khusus TARGETED Campaign
  targetProvince?: string; // Provinsi Sasaran Target
  targetCity?: string; // Kota/Kabupaten Sasaran Target
  targetDistrict?: string; // Kecamatan Sasaran Target
  targetVillage?: string; // Kelurahan/Desa Sasaran Target
  targetAgeGroup?: string; // Rentang Usia (e.g. "25-34 Tahun")
  targetGender?: string; // Jenis Kelamin ("Semua", "Pria", "Wanita")
  targetSes?: string; // Status SES ("Semua", "SES A (Atas)", "SES B (Menengah Atas)", dll)
  targetMaritalStatus?: string; // Status Pernikahan ("Semua", "Lajang", "Menikah")
  targetReligion?: string; // Agama / Religi ("Semua", "Islam", "Kristen", dll)
  targetArpuSpending?: string; // Pengeluaran Pulsa ARPU ("Semua", "Medium (50k-150k)", "High (>150k)")
  targetDeviceOs?: string; // Device & OS ("Semua", "Android", "iOS")
  targetInterests?: string[]; // Minat / Perilaku (Hobi & Lifestyle)
  // Parameter Khusus BROADCAST Campaign (Upload List Excel/CSV)
  uploadedListFileName?: string; // Nama file Excel/CSV yang diupload
  uploadedListFileCount?: number; // Jumlah nomor/baris dalam file
  uploadedListFileSize?: string; // Ukuran file terformat (e.g. "124 KB")
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
