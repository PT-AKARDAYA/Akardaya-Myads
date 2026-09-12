import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppData, SubscriptionPackage, ChannelRate, DiscountConfig, CompanyConfig, Testimonial, OrderLead, OfficeLocation } from '../types';
import { INITIAL_APP_DATA, DEFAULT_OFFICE_LOCATIONS, DEFAULT_PACKAGES, DEFAULT_CHANNEL_RATES, DEFAULT_TESTIMONIALS } from '../data/defaultData';

export const PERMANENT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyJoS1CMQfAUGPNRec6bkgZthkhFY94Z5bIL6uLai5tMMb4OICx0RwLXlr_hCt4u4Cz/exec';

export const safeNormalizeData = (incoming: any): AppData => {
  if (!incoming || typeof incoming !== 'object') {
    return INITIAL_APP_DATA;
  }

  const rawPackages = Array.isArray(incoming.packages) && incoming.packages.length > 0
    ? incoming.packages
    : DEFAULT_PACKAGES;

  const safePackages = rawPackages.map((pkg: any) => {
    let p = { ...pkg };
    if (typeof p.priceDisplay === 'string') {
      p.priceDisplay = p.priceDisplay
        .replace(/>=/g, '≥')
        .replace(/<=/g, '≤')
        .replace(/>\s*Rp/g, '≥ Rp')
        .replace(/^>\s*/, '≥ ')
        .replace(/Rp\s*200\.000\s*-\s*Rp\s*499\.999/gi, 'Rp 200.000 - 499.999');
    }
    if (typeof p.tierName === 'string') {
      p.tierName = p.tierName
        .replace(/>=/g, '≥')
        .replace(/<=/g, '≤')
        .replace(/>\s*Rp/g, '≥ Rp')
        .replace(/^>\s*/, '≥ ');
    }
    if (typeof p.name === 'string') {
      p.name = p.name.replace(/>=/g, '≥').replace(/<=/g, '≤');
    }
    if (typeof p.tagline === 'string') {
      p.tagline = p.tagline.replace(/>=/g, '≥').replace(/<=/g, '≤');
    }

    if (p.id === 'one_klik_tier2' && (p.priceDisplay === 'Rp 201rb - 500rb' || p.priceDisplay === 'Rp 200.000 - < 500rb' || p.priceDisplay === 'Rp 200.000 - Rp 499.999' || p.minBudget === 201000)) {
      return {
        ...p,
        minBudget: 200000,
        maxBudget: 499999,
        tierName: '200.000 - 499.999',
        priceDisplay: 'Rp 200.000 - 499.999',
      };
    }
    if (p.id === 'mandiri_tier2' && (p.priceDisplay === 'Rp 201rb - 500rb' || p.priceDisplay === 'Rp 200.000 - < 500rb' || p.priceDisplay === 'Rp 200.000 - Rp 499.999' || p.minBudget === 201000)) {
      return {
        ...p,
        minBudget: 200000,
        maxBudget: 499999,
        tierName: '200.000 - 499.999',
        priceDisplay: 'Rp 200.000 - 499.999',
      };
    }
    if (p.id === 'one_klik_tier3' && (p.priceDisplay === '> Rp 501.000' || p.priceDisplay === '≥ Rp 500.000' || p.priceDisplay === '>= Rp 500.000' || p.minBudget === 501000 || p.priceDisplay?.includes('501'))) {
      return {
        ...p,
        minBudget: 500000,
        tierName: '≥ 500.000',
        priceDisplay: '≥ Rp 500.000',
      };
    }
    if (p.id === 'mandiri_tier3' && (p.priceDisplay === '> Rp 501.000' || p.priceDisplay === '≥ Rp 500.000' || p.priceDisplay === '>= Rp 500.000' || p.minBudget === 501000 || p.priceDisplay?.includes('501'))) {
      return {
        ...p,
        minBudget: 500000,
        tierName: '≥ 500.000',
        priceDisplay: '≥ Rp 500.000',
      };
    }
    if (p.id === 'paket_umkm') {
      return {
        ...p,
        tierName: '≥ 500.000',
        priceDisplay: '≥ Rp 500.000',
      };
    }
    if (p.id === 'paket_corporate') {
      return {
        ...p,
        tierName: '≥ 1.000.000',
        priceDisplay: '≥ Rp 1.000.000',
      };
    }
    return p;
  });

  const safeChannelRates = Array.isArray(incoming.channelRates) && incoming.channelRates.length > 0
    ? incoming.channelRates
    : DEFAULT_CHANNEL_RATES;

  const rawDiscountConfig = incoming.discountConfig && typeof incoming.discountConfig === 'object' ? incoming.discountConfig : {};
  
  let incomingTiers = rawDiscountConfig.monetaryTiers;
  if (typeof incomingTiers === 'string') {
    try {
      const parsed = JSON.parse(incomingTiers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        incomingTiers = parsed;
      }
    } catch {}
  }

  const safeDiscountConfig: DiscountConfig = {
    ...INITIAL_APP_DATA.discountConfig,
    ...rawDiscountConfig,
    monetaryTiers: Array.isArray(incomingTiers) && incomingTiers.length > 0
      ? incomingTiers.map((t: any) => {
          let minAmount = Number(t.minAmount);
          let maxAmount = t.maxAmount === null || t.maxAmount === undefined ? null : Number(t.maxAmount);
          if (t.id === 'tier-30' && minAmount === 500001) {
            minAmount = 500000;
          }
          if (t.id === 'tier-0' && maxAmount === 500000) {
            maxAmount = 499999;
          }
          return {
            ...t,
            minAmount: isNaN(minAmount) ? 0 : minAmount,
            maxAmount: maxAmount !== null && isNaN(maxAmount) ? null : maxAmount,
            label: (t.label || '').replace(/>=/g, '≥').replace(/<=/g, '≤'),
          };
        })
      : INITIAL_APP_DATA.discountConfig.monetaryTiers,
  };

  // Ensure "Promo Diskon Saldo" is migrated to "Promo Bonus Saldo" seamlessly
  if (safeDiscountConfig.promoTitle) {
    safeDiscountConfig.promoTitle = safeDiscountConfig.promoTitle
      .replace(/diskon saldo/gi, 'Bonus Saldo')
      .replace(/1%\s*-\s*50%/gi, 's/d 50%');
  }
  if (safeDiscountConfig.promoBadge && /diskon/i.test(safeDiscountConfig.promoBadge)) {
    safeDiscountConfig.promoBadge = safeDiscountConfig.promoBadge.replace(/diskon/gi, 'Bonus');
  }
  if (safeDiscountConfig.promoDescription) {
    safeDiscountConfig.promoDescription = safeDiscountConfig.promoDescription
      .replace(/\s*\(atau sesuai setting admin\)/gi, '')
      .replace(/potongan langsung/gi, 'bonus saldo monetary langsung');
  }
  if (safeDiscountConfig.isPromoActive === undefined) {
    safeDiscountConfig.isPromoActive = true;
  }

  const rawCompany = incoming.companyConfig && typeof incoming.companyConfig === 'object' ? incoming.companyConfig : {};
  const safeCompanyConfig: CompanyConfig = {
    ...INITIAL_APP_DATA.companyConfig,
    ...rawCompany,
    brandName: rawCompany.brandName || INITIAL_APP_DATA.companyConfig.brandName,
    waNumber: rawCompany.waNumber ? String(rawCompany.waNumber).replace(/\D/g, '') : INITIAL_APP_DATA.companyConfig.waNumber,
    waDisplayNumber: rawCompany.waDisplayNumber || (rawCompany.waNumber ? `+${rawCompany.waNumber}` : INITIAL_APP_DATA.companyConfig.waDisplayNumber),
    brandTagline: rawCompany.brandTagline !== undefined && rawCompany.brandTagline !== '' ? rawCompany.brandTagline : INITIAL_APP_DATA.companyConfig.brandTagline,
    supportEmail: rawCompany.supportEmail || INITIAL_APP_DATA.companyConfig.supportEmail,
    officeAddress: rawCompany.officeAddress || INITIAL_APP_DATA.companyConfig.officeAddress,
    operatingHours: rawCompany.operatingHours || INITIAL_APP_DATA.companyConfig.operatingHours,
    announcementText: rawCompany.announcementText !== undefined && rawCompany.announcementText !== null ? rawCompany.announcementText : INITIAL_APP_DATA.companyConfig.announcementText,
    showAnnouncement: rawCompany.showAnnouncement !== undefined ? Boolean(rawCompany.showAnnouncement) : INITIAL_APP_DATA.companyConfig.showAnnouncement,
    spreadsheetUrl: rawCompany.spreadsheetUrl || PERMANENT_GAS_URL,
    bankName: rawCompany.bankName || INITIAL_APP_DATA.companyConfig.bankName,
    bankAccountNumber: rawCompany.bankAccountNumber || INITIAL_APP_DATA.companyConfig.bankAccountNumber,
    bankAccountHolder: rawCompany.bankAccountHolder || INITIAL_APP_DATA.companyConfig.bankAccountHolder,
    paymentInstructions: rawCompany.paymentInstructions || INITIAL_APP_DATA.companyConfig.paymentInstructions,
    bankAccounts: (() => {
      let rawList = rawCompany.bankAccounts;
      if (typeof rawList === 'string') {
        try {
          const parsed = JSON.parse(rawList);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawList = parsed;
          }
        } catch (e) {
          rawList = [];
        }
      }
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((b: any, idx: number) => ({
          id: b.id || `bank-${idx}-${Date.now()}`,
          bankName: b.bankName || 'BCA (Bank Central Asia)',
          accountNumber: b.accountNumber || '0188-3333-7157',
          accountHolder: b.accountHolder || 'PT Akardaya Telekomunikasi Indonesia',
          isPrimary: b.isPrimary !== undefined ? Boolean(b.isPrimary) : idx === 0,
          isActive: b.isActive !== undefined ? Boolean(b.isActive) : true,
          notes: b.notes || '',
        }));
      }
      return (
        INITIAL_APP_DATA.companyConfig.bankAccounts || [
          {
            id: 'bank-bca-primary',
            bankName: rawCompany.bankName || 'BCA (Bank Central Asia)',
            accountNumber: rawCompany.bankAccountNumber || '0188-3333-7157',
            accountHolder: rawCompany.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
            isPrimary: true,
            isActive: true,
            notes: 'Rekening Utama',
          },
        ]
      );
    })(),
  };

  const safeOffices: OfficeLocation[] = (Array.isArray(incoming.offices) && incoming.offices.length > 0
    ? incoming.offices
    : DEFAULT_OFFICE_LOCATIONS
  ).map((o: any, idx: number) => {
    const parseCoord = (val: any, fallback: number) => {
      if (typeof val === 'number' && !isNaN(val)) return val;
      if (typeof val === 'string') {
        const cleaned = parseFloat(val.replace(',', '.').trim());
        if (!isNaN(cleaned)) return cleaned;
      }
      return fallback;
    };

    const typeUpper = String(o.type || 'CABANG').toUpperCase();
    const normType = typeUpper.includes('PUSAT') ? 'PUSAT' : 'CABANG';

    return {
      id: o.id ? String(o.id) : `office_${Date.now()}_${idx}`,
      name: o.name ? String(o.name) : 'Kantor Cabang',
      type: normType as 'PUSAT' | 'CABANG',
      cityName: o.cityName ? String(o.cityName) : 'Jawa Timur',
      address: o.address ? String(o.address) : '',
      latitude: parseCoord(o.latitude, 0),
      longitude: parseCoord(o.longitude, 0),
      phone: o.phone ? String(o.phone) : undefined,
      whatsapp: o.whatsapp ? String(o.whatsapp) : undefined,
      operatingHours: o.operatingHours ? String(o.operatingHours) : undefined,
      isPrimary: o.isPrimary === true || String(o.isPrimary).toUpperCase() === 'YA',
      notes: o.notes ? String(o.notes) : undefined,
    };
  });

  const safeTestimonials = Array.isArray(incoming.testimonials) && incoming.testimonials.length > 0
    ? incoming.testimonials
    : DEFAULT_TESTIMONIALS;

  const safeOrders = Array.isArray(incoming.orders) ? incoming.orders : [];
  const safeAnalyticsLogs = Array.isArray(incoming.analyticsLogs) ? incoming.analyticsLogs : undefined;

  return {
    packages: safePackages,
    channelRates: safeChannelRates,
    discountConfig: safeDiscountConfig,
    companyConfig: safeCompanyConfig,
    testimonials: safeTestimonials,
    orders: safeOrders,
    offices: safeOffices,
    analyticsLogs: safeAnalyticsLogs,
    lastUpdated: incoming.lastUpdated || '2026-08-27T00:00:00.000Z',
  };
};

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  isConnected: boolean;
  activeUsers: number;
  darkMode: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  selectedPackageForOrder: SubscriptionPackage | null;
  openOrderModalForPackage: (pkg: SubscriptionPackage | null) => void;
  updateAppData: (newData: Partial<AppData>) => Promise<boolean>;
  submitReview: (review: Omit<Testimonial, 'id' | 'date' | 'avatarBgColor' | 'verified'>) => Promise<boolean>;
  submitOrder: (order: Omit<OrderLead, 'id' | 'createdAt' | 'status'>) => Promise<OrderLead | null>;
  resetToDefaults: () => Promise<boolean>;
  refreshData: (silent?: boolean, force?: boolean) => Promise<void>;
  isSyncPaused: boolean;
  setIsSyncPaused: (paused: boolean) => void;
  notificationToast: { message: string; type: 'info' | 'success' | 'warning' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error' | 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR') => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize with cached localStorage data or INITIAL_APP_DATA for instant 0ms first render
  const [data, setData] = useState<AppData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('akardaya_app_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages && Array.isArray(parsed.packages)) {
            return safeNormalizeData(parsed);
          }
        }
      } catch (e) {
        console.warn('Error reading localStorage cache:', e);
      }
    }
    return INITIAL_APP_DATA;
  });

  // Always initialize isLoading as false so all menus & UI render immediately
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedPackageForOrder, setSelectedPackageForOrder] = useState<SubscriptionPackage | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [isSyncPaused, setIsSyncPaused] = useState<boolean>(false);

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digiads_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const showToast = useCallback((message: string, rawType: string = 'info') => {
    const lower = rawType.toLowerCase();
    const type: 'info' | 'success' | 'warning' =
      lower === 'success' ? 'success' : lower === 'warning' || lower === 'error' ? 'warning' : 'info';
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setNotificationToast(null);
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('digiads_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('digiads_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Background Spreadsheet & Cross-Tab Sync Engine
  const dataRef = useRef<AppData>(data);
  dataRef.current = data;

  const isSyncPausedRef = useRef<boolean>(false);
  isSyncPausedRef.current = isSyncPaused;

  const isAdminOpenRef = useRef<boolean>(false);
  isAdminOpenRef.current = isAdminOpen;

  const isOrderModalOpenRef = useRef<boolean>(false);
  isOrderModalOpenRef.current = isOrderModalOpen;

  const lastSyncTimestampRef = useRef<string>('');
  const isSyncingRef = useRef<boolean>(false);

  // Fast direct fetcher from Google Apps Script Web App
  const syncLatestData = useCallback(async (silent = true, force = false) => {
    // If background sync is paused and not forced, do nothing
    if (silent && (isSyncPausedRef.current || isOrderModalOpenRef.current) && !force) {
      return;
    }

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      const currentData = dataRef.current;
      const savedStorageUrl = typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null;
      const spreadsheetUrl = currentData?.companyConfig?.spreadsheetUrl || savedStorageUrl || PERMANENT_GAS_URL;

      if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
        try {
          const fetchUrl = spreadsheetUrl.includes('?') 
            ? `${spreadsheetUrl}&action=GET_DATA&_t=${Date.now()}` 
            : `${spreadsheetUrl}?action=GET_DATA&_t=${Date.now()}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const sheetRes = await fetch(fetchUrl, {
            signal: controller.signal,
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });
          clearTimeout(timeoutId);

          if (sheetRes.ok) {
            const sheetJson = await sheetRes.json();
            if (sheetJson && (sheetJson.status === 'success' || sheetJson.data) && sheetJson.data?.packages) {
              const remoteData = safeNormalizeData(sheetJson.data);
              const currentStr = JSON.stringify(dataRef.current);
              const remoteStr = JSON.stringify(remoteData);

              if (currentStr !== remoteStr) {
                const currentOrders = dataRef.current?.orders || [];
                const remoteOrders = remoteData.orders || [];
                if (remoteOrders.length > currentOrders.length && !silent) {
                  showToast(`🛒 ${remoteOrders.length - currentOrders.length} Pesanan baru terdeteksi dari Google Sheet!`, 'success');
                } else if (!silent) {
                  showToast('✨ Data terbaru dari Google Spreadsheet berhasil dimuat', 'success');
                }
                
                lastSyncTimestampRef.current = remoteData.lastUpdated || '';
                dataRef.current = remoteData;
                setData(remoteData);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('akardaya_app_data', remoteStr);
                  try {
                    if (broadcastChannelRef.current) {
                      broadcastChannelRef.current.postMessage({
                        type: 'DATA_UPDATED',
                        payload: remoteData,
                      });
                    }
                  } catch (e) {}
                }
              } else if (!silent) {
                showToast('✨ Data sudah sesuai dengan versi terbaru di Google Spreadsheet', 'info');
              }
              setIsLoading(false);
              isSyncingRef.current = false;
              return;
            }
          }
        } catch (sheetErr) {
          if (!silent) {
            console.warn('Google Sheets direct sync notice:', sheetErr);
          }
        }
      }
    } finally {
      setIsLoading(false);
      isSyncingRef.current = false;
    }
  }, [showToast]);

  // Fetch initial data via localStorage
  const fetchInitialData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('akardaya_app_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages) {
            const currentData = safeNormalizeData(parsed);
            if (JSON.stringify(dataRef.current) !== JSON.stringify(currentData)) {
              dataRef.current = currentData;
              setData(currentData);
              lastSyncTimestampRef.current = currentData.lastUpdated || '';
            }
          }
        }
      } catch (e) {
        console.warn('Error loading localStorage data:', e);
      }
    }
  }, []);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const syncLatestDataRef = useRef(syncLatestData);
  syncLatestDataRef.current = syncLatestData;

  const fetchInitialDataRef = useRef(fetchInitialData);
  fetchInitialDataRef.current = fetchInitialData;

  useEffect(() => {
    // 1. Instant startup: load fast local cache
    fetchInitialDataRef.current();

    // 2. Immediate silent background sync directly with Google Sheets (100ms)
    const backgroundSyncTimer = setTimeout(() => {
      syncLatestDataRef.current(true, true);
    }, 100);

    // 3. Setup BroadcastChannel for Instant 0ms Cross-Tab Sync (Same Browser / Device)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('akardaya_live_data_sync');
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          if (isOrderModalOpenRef.current) return;

          if (event.data && event.data.type === 'DATA_UPDATED' && event.data.payload) {
            const updated = safeNormalizeData(event.data.payload);
            if (JSON.stringify(dataRef.current) !== JSON.stringify(updated)) {
              lastSyncTimestampRef.current = updated.lastUpdated || '';
              dataRef.current = updated;
              setData(updated);
            }
          } else if (event.data && event.data.type === 'NEW_ORDER' && event.data.payload) {
            const newOrder: OrderLead = event.data.payload;
            setData((prev) => {
              const currentOrders = prev.orders || [];
              if (currentOrders.some((o) => o.id === newOrder.id)) return prev;
              const nextOrders = [newOrder, ...currentOrders];
              const nextData = safeNormalizeData({ ...prev, orders: nextOrders, lastUpdated: new Date().toISOString() });
              dataRef.current = nextData;
              localStorage.setItem('akardaya_app_data', JSON.stringify(nextData));
              return nextData;
            });
            showToast(`🔔 Pesanan baru masuk dari ${newOrder.customerName || 'Klien'}!`, 'success');
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // 4. Storage event listener fallback for browsers/tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (isOrderModalOpenRef.current) return;
      if (e.key === 'akardaya_app_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.packages) {
            const updated = safeNormalizeData(parsed);
            if (JSON.stringify(dataRef.current) !== JSON.stringify(updated)) {
              dataRef.current = updated;
              setData(updated);
            }
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 5. Auto sync when user returns / focuses the browser tab
    const handleFocus = () => {
      if (!isSyncPausedRef.current && !isOrderModalOpenRef.current) {
        syncLatestDataRef.current(true);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isSyncPausedRef.current && !isOrderModalOpenRef.current) {
        syncLatestDataRef.current(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 6. Periodic Background polling to Google Sheets (Every 20 seconds)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isSyncPausedRef.current && !isOrderModalOpenRef.current) {
        syncLatestDataRef.current(true);
      }
    }, 20000);

    return () => {
      clearTimeout(backgroundSyncTimer);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [showToast]);

  // Update AppData (Admin)
  const updateAppData = async (newData: Partial<AppData>): Promise<boolean> => {
    // 1. Always update local state and localStorage instantly (0ms)
    const merged = safeNormalizeData({ 
      ...data, 
      ...newData,
      lastUpdated: new Date().toISOString()
    });
    
    lastSyncTimestampRef.current = merged.lastUpdated;
    setData(merged);

    if (typeof window !== 'undefined') {
      localStorage.setItem('akardaya_app_data', JSON.stringify(merged));
      if (merged.companyConfig?.spreadsheetUrl) {
        localStorage.setItem('akardaya_spreadsheet_url', merged.companyConfig.spreadsheetUrl);
      }
      
      // Broadcast to other open tabs in real-time
      try {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'DATA_UPDATED',
            payload: merged,
          });
        }
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }

    let syncedToGoogleSheet = false;

    // 2. Sync to Google Spreadsheet Web App directly
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null) || PERMANENT_GAS_URL;
    if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
      try {
        await fetch(spreadsheetUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script Web App standard
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SAVE_DATA',
            payload: merged,
          }),
        });
        syncedToGoogleSheet = true;
      } catch (sheetErr) {
        console.error('Error syncing to Google Apps Script:', sheetErr);
      }
    }
    
    if (syncedToGoogleSheet) {
      showToast('✅ Perubahan berhasil disimpan ke Google Spreadsheet & otomatis terupdate!', 'success');
    } else {
      showToast('✅ Perubahan berhasil disimpan & langsung aktif!', 'success');
    }
    return true;
  };

  // Submit customer review
  const submitReview = async (review: Omit<Testimonial, 'id' | 'date' | 'avatarBgColor' | 'verified'>): Promise<boolean> => {
    const newTestimonial: Testimonial = {
      id: `rev-${Date.now()}`,
      ...review,
      date: 'Baru saja',
      avatarBgColor: 'bg-blue-600',
      verified: true,
    };

    // Update locally
    const updatedTestimonials = [newTestimonial, ...data.testimonials];
    const merged = safeNormalizeData({ ...data, testimonials: updatedTestimonials });
    setData(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem('akardaya_app_data', JSON.stringify(merged));
    }

    // Direct sync to Google Spreadsheet
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null) || PERMANENT_GAS_URL;
    if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
      try {
        await fetch(spreadsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_REVIEW',
            review: newTestimonial,
          }),
        });
      } catch (err) {
        console.log('Google sheet review error:', err);
      }
    }

    showToast('🎉 Terima kasih! Ulasan Anda berhasil diterbitkan.', 'success');
    return true;
  };

  // Submit order lead
  const submitOrder = async (order: Omit<OrderLead, 'id' | 'createdAt' | 'status'>): Promise<OrderLead | null> => {
    const newOrder: OrderLead = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      ...order,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };

    // 1. Update locally
    const updatedOrders = [newOrder, ...(data.orders || [])];
    const merged = safeNormalizeData({ 
      ...data, 
      orders: updatedOrders,
      lastUpdated: new Date().toISOString()
    });
    lastSyncTimestampRef.current = merged.lastUpdated;
    setData(merged);

    if (typeof window !== 'undefined') {
      localStorage.setItem('akardaya_app_data', JSON.stringify(merged));

      // Broadcast to other open tabs in real-time (0ms)
      try {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'NEW_ORDER',
            payload: newOrder,
          });
          broadcastChannelRef.current.postMessage({
            type: 'DATA_UPDATED',
            payload: merged,
          });
        }
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }

    // 2. Direct sync lead to Google Spreadsheet (PESANAN_LEADS sheet)
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null) || PERMANENT_GAS_URL;
    if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
      try {
        await fetch(spreadsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_LEAD',
            lead: {
              id: newOrder.id,
              customerName: newOrder.customerName,
              clientName: newOrder.customerName,
              whatsapp: newOrder.whatsapp,
              phone: newOrder.whatsapp,
              businessName: newOrder.businessName || '',
              myAdsEmail: newOrder.myAdsEmail || '',
              selectedPackageName: newOrder.selectedPackageName,
              packageName: newOrder.selectedPackageName,
              estimatedBudget: newOrder.estimatedBudget,
              totalPayment: newOrder.totalPayment,
              campaignType: newOrder.campaignType || '',
              channelName: newOrder.channelName || '',
              channel: newOrder.channelName ? `${newOrder.campaignType || ''} - ${newOrder.channelName}` : newOrder.estimatedBudget,
              estimatedReach: newOrder.estimatedReach,
              targetCityOrArea: newOrder.targetCityOrArea || '',
              targetProvince: newOrder.targetProvince || '',
              targetCity: newOrder.targetCity || '',
              targetDistrict: newOrder.targetDistrict || '',
              targetVillage: newOrder.targetVillage || '',
              latitude: newOrder.latitude,
              longitude: newOrder.longitude,
              radiusMeters: newOrder.radiusMeters,
              streetAddress: newOrder.streetAddress || '',
              broadcastDate: newOrder.broadcastDate || '',
              senderName: newOrder.senderName || '',
              adMessageContent: newOrder.adMessageContent || '',
              webLink: newOrder.webLink || '',
              uploadedListFileName: newOrder.uploadedListFileName || '',
              uploadedListFileCount: newOrder.uploadedListFileCount,
              uploadedListFileSize: newOrder.uploadedListFileSize || '',
              targetAgeGroup: newOrder.targetAgeGroup || '',
              targetGender: newOrder.targetGender || '',
              targetReligion: newOrder.targetReligion || '',
              targetArpuSpending: newOrder.targetArpuSpending || '',
              targetSes: newOrder.targetSes || '',
              targetDeviceOs: newOrder.targetDeviceOs || '',
              targetMaritalStatus: newOrder.targetMaritalStatus || '',
              targetInterests: newOrder.targetInterests || [],
              status: 'PENDING',
              notes: newOrder.notes || (newOrder.totalPayment ? `Estimasi Bayar: Rp ${newOrder.totalPayment.toLocaleString('id-ID')}` : ''),
            },
          }),
        });
      } catch (err) {
        console.log('Google sheet lead error:', err);
      }
    }

    showToast('🚀 Pesanan berhasil dibuat! Silakan selesaikan pembayaran.', 'success');
    return newOrder;
  };

  // Reset to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    setData(INITIAL_APP_DATA);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('akardaya_app_data');
    }

    showToast('🔄 Data berhasil direset ke format default!', 'info');
    return true;
  };

  const openOrderModalForPackage = (pkg: SubscriptionPackage | null) => {
    setSelectedPackageForOrder(pkg);
    setIsOrderModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        isConnected,
        activeUsers,
        darkMode,
        isDarkMode: darkMode,
        toggleDarkMode,
        isAdminOpen,
        setIsAdminOpen,
        isOrderModalOpen,
        setIsOrderModalOpen,
        selectedPackageForOrder,
        openOrderModalForPackage,
        updateAppData,
        submitReview,
        submitOrder,
        resetToDefaults,
        refreshData: syncLatestData,
        isSyncPaused,
        setIsSyncPaused,
        notificationToast,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
