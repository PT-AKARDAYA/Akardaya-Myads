import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppData, SubscriptionPackage, ChannelRate, DiscountConfig, CompanyConfig, Testimonial, OrderLead, WebSocketMessage } from '../types';
import { INITIAL_APP_DATA, DEFAULT_OFFICE_LOCATIONS, DEFAULT_PACKAGES, DEFAULT_CHANNEL_RATES, DEFAULT_TESTIMONIALS } from '../data/defaultData';

export const PERMANENT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyJoS1CMQfAUGPNRec6bkgZthkhFY94Z5bIL6uLai5tMMb4OICx0RwLXlr_hCt4u4Cz/exec';

export const safeNormalizeData = (incoming: any): AppData => {
  if (!incoming || typeof incoming !== 'object') {
    return INITIAL_APP_DATA;
  }

  const safePackages = Array.isArray(incoming.packages) && incoming.packages.length > 0
    ? incoming.packages
    : DEFAULT_PACKAGES;

  const safeChannelRates = Array.isArray(incoming.channelRates) && incoming.channelRates.length > 0
    ? incoming.channelRates
    : DEFAULT_CHANNEL_RATES;

  const safeDiscountConfig: DiscountConfig = {
    ...INITIAL_APP_DATA.discountConfig,
    ...(incoming.discountConfig && typeof incoming.discountConfig === 'object' ? incoming.discountConfig : {}),
  };

  const safeCompanyConfig: CompanyConfig = {
    ...INITIAL_APP_DATA.companyConfig,
    ...(incoming.companyConfig && typeof incoming.companyConfig === 'object' ? incoming.companyConfig : {}),
    spreadsheetUrl: PERMANENT_GAS_URL,
  };

  const safeOffices = Array.isArray(incoming.offices) && incoming.offices.length > 0
    ? incoming.offices
    : DEFAULT_OFFICE_LOCATIONS;

  const safeTestimonials = Array.isArray(incoming.testimonials) && incoming.testimonials.length > 0
    ? incoming.testimonials
    : DEFAULT_TESTIMONIALS;

  const safeOrders = Array.isArray(incoming.orders) ? incoming.orders : [];

  return {
    packages: safePackages,
    channelRates: safeChannelRates,
    discountConfig: safeDiscountConfig,
    companyConfig: safeCompanyConfig,
    testimonials: safeTestimonials,
    orders: safeOrders,
    offices: safeOffices,
    lastUpdated: incoming.lastUpdated || new Date().toISOString(),
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
  submitOrder: (order: Omit<OrderLead, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  notificationToast: { message: string; type: 'info' | 'success' | 'warning' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error' | 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR') => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_APP_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedPackageForOrder, setSelectedPackageForOrder] = useState<SubscriptionPackage | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digiads_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const lastSyncTimestampRef = useRef<string>('');
  const isSyncingRef = useRef<boolean>(false);

  // Silent background fetcher from Google Spreadsheet or Server
  const syncLatestData = useCallback(async (silent = true) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      // 1. Check Google Spreadsheet first if URL is configured
      const savedStorageUrl = typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null;
      const spreadsheetUrl = data.companyConfig?.spreadsheetUrl || savedStorageUrl;

      if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
        try {
          const fetchUrl = spreadsheetUrl.includes('?') 
            ? `${spreadsheetUrl}&action=GET_DATA&_t=${Date.now()}` 
            : `${spreadsheetUrl}?action=GET_DATA&_t=${Date.now()}`;
          
          const sheetRes = await fetch(fetchUrl);
          if (sheetRes.ok) {
            const sheetJson = await sheetRes.json();
            if (sheetJson && sheetJson.status === 'success' && sheetJson.data && sheetJson.data.packages) {
              const remoteData = safeNormalizeData(sheetJson.data);
              const remoteTimestamp = remoteData.lastUpdated || sheetJson.timestamp || '';
              
              // Only update state if data timestamp changed or initial sync
              if (!lastSyncTimestampRef.current || remoteTimestamp !== lastSyncTimestampRef.current) {
                lastSyncTimestampRef.current = remoteTimestamp;
                setData(remoteData);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('akardaya_app_data', JSON.stringify(remoteData));
                }
                if (!silent) {
                  showToast('✨ Data terbaru dari Google Spreadsheet berhasil dimuat', 'info');
                }
              }
              setIsLoading(false);
              isSyncingRef.current = false;
              return;
            }
          }
        } catch (sheetErr) {
          // Spreadsheet request silent failover
        }
      }

      // 2. Server API fallback for fullstack mode
      try {
        const res = await fetch(`/api/data?_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.packages) {
            const remoteData = safeNormalizeData(json);
            if (!lastSyncTimestampRef.current || remoteData.lastUpdated !== lastSyncTimestampRef.current) {
              lastSyncTimestampRef.current = remoteData.lastUpdated || '';
              setData(remoteData);
              if (typeof window !== 'undefined') {
                localStorage.setItem('akardaya_app_data', JSON.stringify(remoteData));
              }
            }
          }
        }
      } catch (err) {
        // Standalone/static mode
      }
    } finally {
      setIsLoading(false);
      isSyncingRef.current = false;
    }
  }, [data.companyConfig?.spreadsheetUrl, showToast]);

  // Fetch initial data via REST fallback and localStorage
  const fetchInitialData = useCallback(async () => {
    // 1. Try loading from localStorage first (for instant first paint)
    let currentData = INITIAL_APP_DATA;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('akardaya_app_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages) {
            currentData = safeNormalizeData(parsed);
            setData(currentData);
            lastSyncTimestampRef.current = currentData.lastUpdated || '';
          }
        }
      } catch (e) {
        console.warn('Error loading localStorage data:', e);
      }
    }

    // 2. Fetch fresh data in background immediately
    await syncLatestData(true);
  }, [syncLatestData]);

  // Initialize WebSocket connection or Fallback to Static Online Mode
  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Track visitors locally on static hosting
    try {
      const storedVisits = parseInt(localStorage.getItem('akardaya_total_visits') || '12', 10);
      const newVisits = storedVisits + 1;
      localStorage.setItem('akardaya_total_visits', newVisits.toString());
      // Random realistic active visitors (e.g., 3-8 active visitors)
      const baseActive = Math.floor(Math.random() * 4) + 3;
      setActiveUsers(baseActive);
    } catch (e) {
      setActiveUsers(3);
    }

    // If hosting on GitHub Pages, we can immediately mark as active static mode
    const isStaticHost = window.location.hostname.includes('github.io');
    if (isStaticHost) {
      setIsConnected(true);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('⚡ Connected to real-time sync server');
      };

      ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          if (msg.type === 'INIT_DATA' || msg.type === 'SYNC_DATA') {
            const normalized = safeNormalizeData(msg.payload);
            setData(normalized);
            localStorage.setItem('akardaya_app_data', JSON.stringify(normalized));
            setIsLoading(false);
            if (msg.type === 'SYNC_DATA') {
              showToast('✨ Data diperbarui secara real-time dari server', 'info');
            }
          } else if (msg.type === 'ACTIVE_USERS') {
            setActiveUsers(msg.payload?.count || 1);
          } else if (msg.type === 'NEW_REVIEW') {
            showToast(`⭐ Ulasan baru dari ${msg.payload?.name || 'Pelanggan'}!`, 'success');
          } else if (msg.type === 'NEW_ORDER') {
            showToast(`🛒 Permintaan baru dari ${msg.payload?.customerName || 'Klien'}!`, 'info');
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onclose = () => {
        // In static environment or if WS closes, remain connected in static mode
        setIsConnected(true);
      };

      ws.onerror = (err) => {
        console.log('WebSocket server not available, switching to Standalone Mode.');
        setIsConnected(true);
      };
    } catch (err) {
      console.log('Using Standalone Mode.');
      setIsConnected(true);
    }
  }, [showToast]);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    // 1. Setup BroadcastChannel for Instant 0ms Cross-Tab Sync (Same Browser / Device)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('akardaya_live_data_sync');
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'DATA_UPDATED' && event.data.payload) {
            const updated = safeNormalizeData(event.data.payload);
            lastSyncTimestampRef.current = updated.lastUpdated || '';
            setData(updated);
            showToast('🔄 Tampilan otomatis diperbarui mengikuti perubahan admin', 'info');
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // 2. Storage event listener fallback for browsers/tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'akardaya_app_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.packages) {
            const updated = safeNormalizeData(parsed);
            setData(updated);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Auto sync when user returns / focuses the browser tab
    const handleFocus = () => {
      syncLatestData(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncLatestData(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Background polling timer (Every 20 seconds) to fetch spreadsheet updates across all users
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncLatestData(true);
      }
    }, 20000);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [fetchInitialData, connectWebSocket, syncLatestData, showToast]);

  // Update AppData (Admin)
  const updateAppData = async (newData: Partial<AppData>): Promise<boolean> => {
    // 1. Always update local state and localStorage
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

    // Also send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'UPDATE_DATA',
          payload: merged,
        }));
      } catch (e) {
        console.warn('WS send error:', e);
      }
    }

    let syncedToGoogleSheet = false;

    // 2. Sync to Google Spreadsheet if configured
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null);
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

    // 3. Try updating server if running full-stack
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          showToast('✅ Perubahan berhasil disimpan & disinkronkan ke server!', 'success');
          return true;
        }
      }
    } catch (err) {
      // Static mode fallback
    }
    
    if (syncedToGoogleSheet) {
      showToast('✅ Perubahan berhasil disimpan ke Google Spreadsheet & otomatis terupdate ke pengguna!', 'success');
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

    // Sync to Google Spreadsheet
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null);
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

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
    } catch (err) {
      // Ignore static network errors
    }

    showToast('🎉 Terima kasih! Ulasan Anda berhasil diterbitkan.', 'success');
    return true;
  };

  // Submit order lead
  const submitOrder = async (order: Omit<OrderLead, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    const newOrder: OrderLead = {
      id: `lead-${Date.now()}`,
      ...order,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };

    // Update locally
    const updatedOrders = [newOrder, ...(data.orders || [])];
    const merged = safeNormalizeData({ ...data, orders: updatedOrders });
    setData(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem('akardaya_app_data', JSON.stringify(merged));
    }

    // Sync lead to Google Spreadsheet
    const spreadsheetUrl = merged.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null);
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
              clientName: newOrder.customerName,
              phone: newOrder.whatsapp,
              packageName: newOrder.selectedPackageName,
              channel: newOrder.estimatedBudget,
              status: 'PENDING',
              notes: newOrder.notes || '',
            },
          }),
        });
      } catch (err) {
        console.log('Google sheet lead error:', err);
      }
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch (err) {
      // Ignore static network errors
    }

    showToast('🚀 Permintaan Anda tercatat. Menghubungkan ke WhatsApp...', 'success');
    return true;
  };

  // Reset to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    setData(INITIAL_APP_DATA);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('akardaya_app_data');
    }

    try {
      await fetch('/api/admin/reset', { method: 'POST' });
    } catch (err) {
      // Static mode
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
