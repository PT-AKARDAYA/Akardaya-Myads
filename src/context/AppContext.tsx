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

  // Fetch initial data via REST fallback
  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json && json.packages) {
          setData(safeNormalizeData(json));
        }
      }
    } catch (err) {
      console.warn('REST fetch initial data fallback error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

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
            setData(safeNormalizeData(msg.payload));
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
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
        ws.close();
      };
    } catch (err) {
      console.warn('Failed to construct WebSocket:', err);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectWebSocket();
        }, 4000);
      }
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
          showToast('✅ Perubahan berhasil disimpan & disinkronkan ke semua perangkat!', 'success');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error updating app data:', err);
      showToast('❌ Gagal menyimpan data ke server', 'warning');
      return false;
    }
  };

  // Submit customer review
  const submitReview = async (review: Omit<Testimonial, 'id' | 'date' | 'avatarBgColor' | 'verified'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (res.ok) {
        showToast('🎉 Terima kasih! Ulasan Anda berhasil diterbitkan.', 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error submitting review:', err);
      showToast('❌ Gagal mengirim ulasan', 'warning');
      return false;
    }
  };

  // Submit order lead
  const submitOrder = async (order: Omit<OrderLead, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        showToast('🚀 Permintaan Anda tercatat. Menghubungkan ke WhatsApp...', 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error submitting order lead:', err);
      return false;
    }
  };

  // Reset to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          showToast('🔄 Data berhasil direset ke format default!', 'info');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error resetting data:', err);
      showToast('❌ Gagal mereset data', 'warning');
      return false;
    }
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
