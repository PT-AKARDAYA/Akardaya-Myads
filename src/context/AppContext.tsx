import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppData, SubscriptionPackage, ChannelRate, DiscountConfig, CompanyConfig, Testimonial, OrderLead, WebSocketMessage } from '../types';
import { INITIAL_APP_DATA, DEFAULT_OFFICE_LOCATIONS } from '../data/defaultData';

const safeNormalizeData = (incoming: AppData): AppData => ({
  ...INITIAL_APP_DATA,
  ...incoming,
  offices: Array.isArray(incoming.offices) && incoming.offices.length > 0 ? incoming.offices : DEFAULT_OFFICE_LOCATIONS,
});

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  isConnected: boolean;
  activeUsers: number;
  darkMode: boolean;
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

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
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

  // Fetch initial data via REST fallback and localStorage
  const fetchInitialData = useCallback(async () => {
    // 1. Try loading from localStorage first (for offline / GitHub Pages static mode)
    let currentData = INITIAL_APP_DATA;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('akardaya_app_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages) {
            currentData = safeNormalizeData(parsed);
            setData(currentData);
          }
        }
      } catch (e) {
        console.warn('Error loading localStorage data:', e);
      }
    }

    // 2. Try fetching from Google Spreadsheet (if configured)
    const spreadsheetUrl = currentData.companyConfig?.spreadsheetUrl || (typeof window !== 'undefined' ? localStorage.getItem('akardaya_spreadsheet_url') : null);
    if (spreadsheetUrl && spreadsheetUrl.startsWith('https://script.google.com/')) {
      try {
        const fetchUrl = spreadsheetUrl.includes('?') ? `${spreadsheetUrl}&action=GET_DATA` : `${spreadsheetUrl}?action=GET_DATA`;
        const sheetRes = await fetch(fetchUrl);
        if (sheetRes.ok) {
          const sheetJson = await sheetRes.json();
          if (sheetJson && sheetJson.data && sheetJson.data.packages) {
            const sheetMerged = safeNormalizeData(sheetJson.data);
            setData(sheetMerged);
            if (typeof window !== 'undefined') {
              localStorage.setItem('akardaya_app_data', JSON.stringify(sheetMerged));
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (sheetErr) {
        console.log('Error loading from Google Spreadsheet, falling back:', sheetErr);
      }
    }

    // 3. Try fetching from server API if running in full-stack mode
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json && json.packages) {
          setData(safeNormalizeData(json));
          if (typeof window !== 'undefined') {
            localStorage.setItem('akardaya_app_data', JSON.stringify(json));
          }
        }
      }
    } catch (err) {
      console.log('Static hosting mode or server not present, using local storage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchInitialData, connectWebSocket]);

  // Update AppData (Admin)
  const updateAppData = async (newData: Partial<AppData>): Promise<boolean> => {
    // 1. Always update local state and localStorage
    const merged = safeNormalizeData({ ...data, ...newData });
    setData(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem('akardaya_app_data', JSON.stringify(merged));
      if (merged.companyConfig?.spreadsheetUrl) {
        localStorage.setItem('akardaya_spreadsheet_url', merged.companyConfig.spreadsheetUrl);
      }
    }

    let syncedToGoogleSheet = false;

    // 2. Try syncing to Google Spreadsheet if configured
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
        body: JSON.stringify(newData),
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
      // Static mode (GitHub Pages) fallback
      console.log('Saved to browser localStorage');
    }
    
    if (syncedToGoogleSheet) {
      showToast('✅ Perubahan berhasil disimpan ke Google Spreadsheet & siap disinkronkan ke semua pengguna!', 'success');
    } else {
      showToast('✅ Perubahan berhasil disimpan di browser & siap digunakan!', 'success');
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
