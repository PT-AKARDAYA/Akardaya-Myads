import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { AppData, SubscriptionPackage, ChannelRate, Testimonial, OrderLead, OfficeLocation } from './types';
import { AkarDayaLogo } from './components/AkarDayaLogo';
import { VisitorAnalyticsDashboard } from './components/VisitorAnalyticsDashboard';
import {
  ShieldCheck,
  Layers,
  Percent,
  Coins,
  Phone,
  MessageSquareQuote,
  Inbox,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  CheckCircle2,
  Download,
  Upload,
  AlertTriangle,
  Clock,
  Award,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  Check,
  Lock,
  Unlock,
  KeyRound,
  MapPin,
  Building2,
  Navigation,
  Compass,
  BarChart3,
  Users,
  Activity,
  RefreshCw,
  Sliders,
  Edit3,
  Pause,
  Play,
} from 'lucide-react';
import { Toast } from './components/Toast';

export const AdminApp: React.FC = () => {
  const {
    data,
    updateAppData,
    resetToDefaults,
    isConnected,
    activeUsers,
    isDarkMode,
    toggleDarkMode,
    showToast,
    refreshData,
    isSyncPaused,
    setIsSyncPaused,
  } = useApp();

  // Local editable draft
  const [draftData, setDraftData] = useState<AppData>(data);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PACKAGES' | 'DISCOUNT' | 'RATES' | 'CONTACT' | 'OFFICES' | 'TESTIMONIALS' | 'LEADS'>('ANALYTICS');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'ALL' | 'UNREAD' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL');
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

  // Check if draft has unsaved changes
  const isDirty = React.useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(data);
  }, [draftData, data]);

  // Focus tracking: Pause G-Sheets sync strictly when cursor is inside an input field,
  // and resume sync immediately when cursor leaves or user clicks outside/switches menu
  useEffect(() => {
    const isInputField = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (el as HTMLElement).isContentEditable === true
      );
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (isInputField(e.target as Element)) {
        setIsSyncPaused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        if (!isInputField(document.activeElement)) {
          setIsSyncPaused(false);
        }
      }, 80);
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!isInputField(e.target as Element)) {
        setTimeout(() => {
          if (!isInputField(document.activeElement)) {
            setIsSyncPaused(false);
          }
        }, 50);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [setIsSyncPaused]);

  // Helper when clicking another menu/tab: blur inputs and restore active sync
  const handleSelectTab = (tab: typeof activeTab) => {
    if (typeof document !== 'undefined' && document.activeElement) {
      (document.activeElement as HTMLElement).blur?.();
    }
    setIsSyncPaused(false);
    setActiveTab(tab);
  };

  // Read orders tracking for badge count
  const [readOrderIds, setReadOrderIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('akardaya_read_order_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate unread orders count (only pending orders that have not been read/opened)
  const unreadOrdersCount = React.useMemo(() => {
    return (draftData.orders || []).filter(
      (o) => !readOrderIds.includes(o.id) && o.status === 'PENDING' && !o.isRead
    ).length;
  }, [draftData.orders, readOrderIds]);

  // Mark all current orders as read when admin opens the LEADS tab
  useEffect(() => {
    if (activeTab === 'LEADS' && draftData.orders && draftData.orders.length > 0) {
      const allIds = draftData.orders.map((o) => o.id);
      setReadOrderIds((prev) => {
        const next = Array.from(new Set([...prev, ...allIds]));
        if (typeof window !== 'undefined') {
          localStorage.setItem('akardaya_read_order_ids', JSON.stringify(next));
        }
        return next;
      });
    }
  }, [activeTab, draftData.orders]);

  // Simple optional PIN lock to prevent accidental edits
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('digiads_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Sync draft when server data updates ONLY IF NOT DIRTY and NOT PAUSED
  useEffect(() => {
    if (isDirty || isSyncPaused) {
      // Do not overwrite user's editing draft!
      // Only safely merge incoming orders so unread badge stays updated
      if (data.orders && JSON.stringify(draftData.orders) !== JSON.stringify(data.orders)) {
        setDraftData((prev) => ({ ...prev, orders: data.orders }));
      }
      return;
    }
    setDraftData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
      return JSON.parse(JSON.stringify(data));
    });
  }, [data, isDirty, isSyncPaused]);

  // Faster background lead poller (every 5s) when activeTab is LEADS
  const refreshDataRef = useRef(refreshData);
  useEffect(() => {
    refreshDataRef.current = refreshData;
  }, [refreshData]);

  useEffect(() => {
    if (activeTab === 'LEADS') {
      refreshDataRef.current(true);
      const interval = setInterval(() => {
        refreshDataRef.current(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleManualRefreshLeads = async () => {
    setIsRefreshingLeads(true);
    await refreshData(false);
    setIsRefreshingLeads(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: admin123 or empty
    if (pinInput.trim() === 'admin123' || pinInput.trim() === '1234' || pinInput.trim() === '') {
      setIsUnlocked(true);
      localStorage.setItem('digiads_admin_unlocked', 'true');
      setPinError('');
      showToast('Akses Admin berhasil dibuka!', 'SUCCESS');
    } else {
      setPinError('PIN salah! (Gunakan PIN default: admin123 atau kosongkan lalu Enter)');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('digiads_admin_unlocked');
    setPinInput('');
  };

  // Package editing handlers
  const handlePackageChange = (id: string, field: keyof SubscriptionPackage, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)),
    }));
  };

  const handleAddNewPackage = () => {
    const newId = `pkg_custom_${Date.now()}`;
    const newPkg: SubscriptionPackage = {
      id: newId,
      category: 'ONE_KLIK',
      categoryTitle: 'PAKET ONE KLIK TERIMA JADI',
      tierName: '<200.000',
      name: 'Paket Promo Baru',
      tagline: 'Fasilitas iklan lengkap terima beres siap pesan',
      minBudget: 150000,
      priceDisplay: 'Rp 175.000',
      badge: 'Paket Baru',
      isPopular: false,
      enabledRateIds: draftData.channelRates.map((r) => r.id),
      freeContentPerMonth: 1,
      freeWebsiteMonths: 0,
      accountType: 'Akun AD',
      saldoInfo: 'SESUAI PAKET',
      description: 'Deskripsi paket promosi baru yang siap diaktifkan.',
      keyHighlights: ['Semua Saluran Iklan Lengkap', 'Gratis Konten Medsos', 'Saldo My Ads Penuh'],
    };
    setDraftData((prev) => ({
      ...prev,
      packages: [newPkg, ...prev.packages],
    }));
    showToast('Paket baru berhasil ditambahkan ke daftar', 'INFO');
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      setDraftData((prev) => ({
        ...prev,
        packages: prev.packages.filter((pkg) => pkg.id !== id),
      }));
      showToast('Paket telah dihapus dari daftar draft', 'INFO');
    }
  };

  // Rate Matrix handlers
  const handleRateChange = (id: string, newRate: number) => {
    setDraftData((prev) => ({
      ...prev,
      channelRates: prev.channelRates.map((r) =>
        r.id === id
          ? {
              ...r,
              ratePerUnit: newRate,
              rateDisplay: `@Rp.${newRate}`,
            }
          : r
      ),
    }));
  };

  // Office Location Handlers
  const handleOfficeChange = (id: string, field: keyof OfficeLocation, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      offices: (prev.offices || []).map((off) =>
        off.id === id ? { ...off, [field]: value } : off
      ),
    }));
  };

  const handleAddNewOffice = () => {
    const newId = `office_${Date.now()}`;
    const newOffice: OfficeLocation = {
      id: newId,
      name: 'Kantor Cabang Baru',
      type: 'CABANG',
      cityName: 'Gresik, Jawa Timur',
      address: 'Jl. Raya Bisnis No. 1, Jawa Timur',
      latitude: -7.16124,
      longitude: 112.65189,
      phone: '+62 812-3456-7890',
      whatsapp: draftData.companyConfig.waNumber,
      operatingHours: 'Senin - Sabtu ( 08.00 - 16.00 )',
      isPrimary: false,
      notes: 'Layanan konsultasi & aktivasi',
    };
    setDraftData((prev) => ({
      ...prev,
      offices: [...(prev.offices || []), newOffice],
    }));
    setEditingOfficeId(newId);
    showToast('Kantor cabang baru ditambahkan', 'INFO');
  };

  const handleDeleteOffice = (id: string) => {
    if (window.confirm('Hapus kantor / cabang ini?')) {
      setDraftData((prev) => ({
        ...prev,
        offices: (prev.offices || []).filter((off) => off.id !== id),
      }));
      if (editingOfficeId === id) setEditingOfficeId(null);
      showToast('Kantor telah dihapus', 'INFO');
    }
  };

  const CITY_PRESETS = [
    { city: 'Gresik, Jawa Timur', lat: -7.16124, lng: 112.65189 },
    { city: 'Surabaya, Jawa Timur', lat: -7.26543, lng: 112.74826 },
    { city: 'Jakarta Selatan', lat: -6.23827, lng: 106.82025 },
    { city: 'Jakarta Pusat', lat: -6.18051, lng: 106.82838 },
    { city: 'Bandung, Jawa Barat', lat: -6.92185, lng: 107.61864 },
    { city: 'Semarang, Jawa Tengah', lat: -6.99321, lng: 110.42031 },
    { city: 'Yogyakarta', lat: -7.79558, lng: 110.36949 },
    { city: 'Malang, Jawa Timur', lat: -7.9797, lng: 112.6304 },
    { city: 'Medan, Sumatera Utara', lat: 3.59519, lng: 98.67222 },
    { city: 'Denpasar, Bali', lat: -8.67045, lng: 115.21263 },
    { city: 'Makassar, Sulawesi Selatan', lat: -5.14766, lng: 119.43273 },
  ];

  // Lead status handler
  const handleUpdateLeadStatus = (leadId: string, newStatus: 'PENDING' | 'CONTACTED' | 'COMPLETED') => {
    setDraftData((prev) => ({
      ...prev,
      orders: (prev.orders || []).map((o) => (o.id === leadId ? { ...o, status: newStatus } : o)),
    }));
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Hapus data pesanan ini?')) {
      setDraftData((prev) => ({
        ...prev,
        orders: (prev.orders || []).filter((o) => o.id !== leadId),
      }));
      showToast('Pesanan telah dihapus', 'INFO');
    }
  };

  // Save All and broadcast via WebSocket
  const handleSaveAll = async () => {
    setIsSaving(true);
    const success = await updateAppData(draftData);
    setIsSaving(false);
    if (success) {
      setIsSyncPaused(false);
      showToast('Perubahan berhasil disimpan & disiarkan real-time!', 'SUCCESS');
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke default lampiran awal?')) {
      setIsSaving(true);
      const success = await resetToDefaults();
      setIsSaving(false);
      if (success) {
        setIsSyncPaused(false);
        showToast('Data berhasil dikembalikan ke format default lampiran!', 'SUCCESS');
      }
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draftData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `digiads_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('File backup JSON berhasil diunduh!', 'SUCCESS');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.packages && parsed.channelRates) {
          setDraftData(parsed);
          showToast('Data backup berhasil di-load ke draft! Klik Simpan untuk menerapkan.', 'SUCCESS');
        } else {
          showToast('Format JSON tidak valid!', 'ERROR');
        }
      } catch (err) {
        showToast('Gagal membaca file JSON!', 'ERROR');
      }
    };
    reader.readAsText(file);
  };

  // Filtered lists
  const filteredPackages = draftData.packages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.priceDisplay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = (draftData.orders || []).filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.whatsapp.includes(searchTerm) ||
      (o.businessName && o.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.selectedPackageName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (leadStatusFilter === 'ALL') return true;
    if (leadStatusFilter === 'UNREAD') return !readOrderIds.includes(o.id) && o.status === 'PENDING';
    return o.status === leadStatusFilter;
  });

  // Render Lock Screen if not unlocked
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Toast />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dashboard Admin Terpisah
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Halaman khusus pengelola Akardaya MyAds (admin.html)
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Masukkan PIN Admin (default: admin123)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {pinError && <p className="text-[11px] text-rose-500 mt-1.5 text-left">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Kontrol Admin</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <a
              href="/"
              className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Website</span>
            </a>
            <button onClick={toggleDarkMode} className="p-1 rounded text-slate-400 hover:text-slate-600">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      <Toast />

      {/* Admin Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Live Indicator */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center font-bold shadow-xs">
                <AkarDayaLogo className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Akardaya MyAds Admin Portal
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                    admin.html
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      {isConnected && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      ></span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isConnected ? 'Sistem Aktif & Terhubung' : 'Menghubungkan...'}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeUsers} Pengunjung Website
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Header Quick Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <a
                href="/"
                className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                title="Buka Website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Desktop Actions Bar */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            {/* Google Sheets Sync Status Icon Indicator */}
            <button
              type="button"
              onClick={() => {
                const nextPaused = !isSyncPaused;
                setIsSyncPaused(nextPaused);
                if (nextPaused) {
                  showToast('⏸️ Sinkronisasi G-Sheets dijeda manual', 'INFO');
                } else {
                  showToast('🟢 Sinkronisasi G-Sheets aktif kembali', 'SUCCESS');
                }
              }}
              title={
                isSyncPaused
                  ? 'Sinkronisasi G-Sheets: DIJEDA (Kursor dalam kolom input / Klik untuk mengaktifkan)'
                  : 'Sinkronisasi G-Sheets: AKTIF & REAL-TIME (Klik untuk menjeda)'
              }
              aria-label={isSyncPaused ? 'Sinkronisasi G-Sheets Dijeda' : 'Sinkronisasi G-Sheets Aktif'}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-xs ${
                isSyncPaused
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              {isSyncPaused ? (
                <div className="relative flex items-center justify-center">
                  <Pause className="w-4 h-4" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 -top-1 -right-1"></span>
                  <Play className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Backup Export */}
            <button
              onClick={handleExportBackup}
              title="Download Backup Data JSON"
              className="p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Lock Button */}
            <button
              onClick={handleLock}
              title="Kunci Dashboard"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Save & Broadcast Button */}
            <button
              id="btn-admin-save-all"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan & Siarkan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Menu (Desktop Sidebar / Mobile Tabs) */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSelectTab('ANALYTICS')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'ANALYTICS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="flex-1">
                <span>Pengunjung & Analitik</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[9px] font-bold">
                  Live
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('PACKAGES')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'PACKAGES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Paket Langganan</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({draftData.packages.length})
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('DISCOUNT')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'DISCOUNT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Percent className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Bonus Saldo</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({draftData.discountConfig.reloadDiscountPercent}%)
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('RATES')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'RATES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Tarif Saluran Iklan</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({draftData.channelRates.length})
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('CONTACT')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'CONTACT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>WhatsApp & Brand</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('OFFICES')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'OFFICES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0 text-blue-500" />
              <div className="flex-1">
                <span>Lokasi & Maps Cabang</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({(draftData.offices || []).length})
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('TESTIMONIALS')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'TESTIMONIALS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Testimoni Klien</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({draftData.testimonials.length})
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('LEADS')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'LEADS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  Pesanan Masuk
                  <span className="hidden md:inline-block opacity-70 text-[10px]">
                    ({(draftData.orders || []).length})
                  </span>
                </span>
                {unreadOrdersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold animate-pulse shadow-xs">
                    {unreadOrdersCount} baru
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Quick System Tools Box (Desktop) */}
          <div className="hidden md:block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pemeliharaan Data
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleReset}
                disabled={isSaving}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset ke Default Lampiran</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Management Workspace */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* TAB 0: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <VisitorAnalyticsDashboard />
          )}

          {/* TAB 1: PACKAGES */}
          {activeTab === 'PACKAGES' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Kelola Paket Langganan Iklan ({draftData.packages.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atur nama paket, tier harga, bonus konten, bonus website 3 bulan, dan badge populer.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari paket..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleAddNewPackage}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Paket</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs space-y-3 transition-all ${
                      pkg.isPopular
                        ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pkg.categoryTitle}
                          onChange={(e) => handlePackageChange(pkg.id, 'categoryTitle', e.target.value)}
                          placeholder="Kategori Paket"
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-transparent w-full focus:outline-none"
                        />
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)}
                          className="w-full text-sm font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-blue-500 py-0.5 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Tampilan Harga / Tier:
                        </label>
                        <input
                          type="text"
                          value={pkg.priceDisplay}
                          onChange={(e) => handlePackageChange(pkg.id, 'priceDisplay', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Label Badge:
                        </label>
                        <input
                          type="text"
                          value={pkg.badge || ''}
                          placeholder="Paling Populer"
                          onChange={(e) => handlePackageChange(pkg.id, 'badge', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Gratis Konten (Bln):
                        </label>
                        <select
                          value={pkg.freeContentPerMonth}
                          onChange={(e) => handlePackageChange(pkg.id, 'freeContentPerMonth', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          <option value={1}>1x / Bulan</option>
                          <option value={2}>2x / Bulan</option>
                          <option value={4}>4x / Bulan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Free Website:
                        </label>
                        <select
                          value={pkg.freeWebsiteMonths}
                          onChange={(e) => handlePackageChange(pkg.id, 'freeWebsiteMonths', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          <option value={0}>Tidak Ada</option>
                          <option value={3}>3 Bulan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Tipe Akun:
                        </label>
                        <select
                          value={pkg.accountType}
                          onChange={(e) => handlePackageChange(pkg.id, 'accountType', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="Akun AD">Akun AD</option>
                          <option value="Akun AD/Pribadi">Akun AD/Pribadi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Deskripsi Paket:
                      </label>
                      <textarea
                        rows={2}
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(pkg.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkg.isPopular}
                          onChange={(e) => handlePackageChange(pkg.id, 'isPopular', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Tandai sebagai Paling Populer (Highlight Biru)
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DISCOUNT & PROMOS */}
          {activeTab === 'DISCOUNT' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Percent className="w-5 h-5" />
                  <span>Pengaturan Bonus Saldo Isi Ulang & Banner Promo</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ubah persentase bonus saldo top-up yang otomatis terhitung di banner promo, kalkulator top-up, dan pesan WhatsApp.
                </p>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex flex-col gap-3">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Tabel Skema Bonus Saldo Isi Ulang:
                    </label>

                    {/* Editable Table representation */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-900 text-white dark:bg-slate-950">
                            <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px]">NOMINAL DISPLAY</th>
                            <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-center">MIN (RP)</th>
                            <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-center">MAX (RP)</th>
                            <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-center">BONUS (%)</th>
                            <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {(draftData.discountConfig.monetaryTiers || []).map((tier, index) => (
                            <tr key={tier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={tier.label}
                                  onChange={(e) => {
                                    const newTiers = [...(draftData.discountConfig.monetaryTiers || [])];
                                    newTiers[index].label = e.target.value;
                                    setDraftData((prev) => ({
                                      ...prev,
                                      discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  value={tier.minAmount}
                                  onChange={(e) => {
                                    const newTiers = [...(draftData.discountConfig.monetaryTiers || [])];
                                    newTiers[index].minAmount = Number(e.target.value);
                                    setDraftData((prev) => ({
                                      ...prev,
                                      discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                                    }));
                                  }}
                                  className="w-24 px-2 py-1.5 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={tier.maxAmount ?? ''}
                                    placeholder="No limit"
                                    onChange={(e) => {
                                      const newTiers = [...(draftData.discountConfig.monetaryTiers || [])];
                                      newTiers[index].maxAmount = e.target.value ? Number(e.target.value) : null;
                                      setDraftData((prev) => ({
                                        ...prev,
                                        discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                                      }));
                                    }}
                                    className="w-24 px-2 py-1.5 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  value={tier.bonusPercent}
                                  onChange={(e) => {
                                    const newTiers = [...(draftData.discountConfig.monetaryTiers || [])];
                                    newTiers[index].bonusPercent = Number(e.target.value);
                                    setDraftData((prev) => ({
                                      ...prev,
                                      discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                                    }));
                                  }}
                                  className="w-16 px-2 py-1.5 text-xs font-black text-center rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                                />
                              </td>
                              <td className="py-2 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTiers = (draftData.discountConfig.monetaryTiers || []).filter((_, i) => i !== index);
                                    setDraftData((prev) => ({
                                      ...prev,
                                      discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                                    }));
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <button
                          type="button"
                          onClick={() => {
                            const newTiers = [...(draftData.discountConfig.monetaryTiers || [])];
                            newTiers.push({
                              id: `tier-${Date.now()}`,
                              minAmount: 0,
                              maxAmount: 1000000,
                              label: 'New Tier',
                              bonusPercent: 10,
                            });
                            setDraftData((prev) => ({
                              ...prev,
                              discountConfig: { ...prev.discountConfig, monetaryTiers: newTiers }
                            }));
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" /> Tambah Skema Baru
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 text-xs">
                  {/* Status Banner Promo Aktif / Nonaktif */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Status Tampilan Kartu Promo di Beranda
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Aktifkan untuk menampilkan kartu promo bonus saldo ini di samping judul banner beranda.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftData.discountConfig.isPromoActive}
                        onChange={(e) =>
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, isPromoActive: e.target.checked }
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Persentase Maksimum Bonus Saldo Top-Up */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Maksimum Bonus Saldo Top-Up (% Angka Utama di Kartu):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={draftData.discountConfig.reloadDiscountPercent}
                          onChange={(e) =>
                            setDraftData((prev) => ({
                              ...prev,
                              discountConfig: { ...prev.discountConfig, reloadDiscountPercent: Number(e.target.value) || 0 }
                            }))
                          }
                          className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-sm"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const maxTierBonus = Math.max(
                            ...(draftData.discountConfig.monetaryTiers || []).map((t) => Number(t.bonusPercent) || 0),
                            0
                          );
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: {
                              ...prev.discountConfig,
                              reloadDiscountPercent: maxTierBonus,
                              promoTitle: prev.discountConfig.promoTitle.replace(/\d+%\s*-\s*\d+%/g, `s/d ${maxTierBonus}%`)
                            }
                          }));
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
                      >
                        ⚡ Sinkronkan ke Tier Tertinggi ({Math.max(...(draftData.discountConfig.monetaryTiers || []).map((t) => Number(t.bonusPercent) || 0), 0)}%)
                      </button>
                    </div>
                  </div>

                  {/* Batas Waktu Countdown Promo */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Batas Waktu Hitung Mundur (Countdown Timer):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="datetime-local"
                        value={draftData.discountConfig.promoCountdownEnd ? new Date(draftData.discountConfig.promoCountdownEnd).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoCountdownEnd: val }
                          }));
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoCountdownEnd: newDate }
                          }));
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        +2 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoCountdownEnd: newDate }
                          }));
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        +7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoCountdownEnd: newDate }
                          }));
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        +30 Hari
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Judul Promo Header / Banner:
                      </label>
                      <input
                        type="text"
                        value={draftData.discountConfig.promoTitle}
                        onChange={(e) =>
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoTitle: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Contoh: Promo Bonus Saldo Isi Ulang s/d 50%"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Teks Badge Promo:
                      </label>
                      <input
                        type="text"
                        value={draftData.discountConfig.promoBadge}
                        onChange={(e) =>
                          setDraftData((prev) => ({
                            ...prev,
                            discountConfig: { ...prev.discountConfig, promoBadge: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Contoh: Spesial Bonus Saldo"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Detail Promo:
                    </label>
                    <textarea
                      rows={2}
                      value={draftData.discountConfig.promoDescription}
                      onChange={(e) =>
                        setDraftData((prev) => ({
                          ...prev,
                          discountConfig: { ...prev.discountConfig, promoDescription: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="Contoh: Dapatkan bonus saldo monetary langsung setiap top-up saldo My Ads untuk semua channel promosi!"
                    ></textarea>
                  </div>

                  {/* Pratinjau Langsung Kartu Promo */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                      👁️ Pratinjau Tampilan Kartu Promo di Beranda:
                    </span>
                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/80 dark:from-slate-850 dark:to-slate-900 shadow-md">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                          <Award className="w-3 h-3 text-amber-500" />
                          {draftData.discountConfig.promoBadge || 'Spesial Bonus Saldo'}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          <span>48:29:19</span>
                        </div>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {draftData.discountConfig.promoTitle || 'Promo Bonus Saldo Isi Ulang'}
                      </h4>

                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {draftData.discountConfig.promoDescription || 'Dapatkan bonus saldo monetary langsung setiap top-up saldo My Ads.'}
                      </p>

                      <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Bonus Isi Ulang Saldo
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                              {draftData.discountConfig.reloadDiscountPercent}%
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              BONUS Setiap Top Up
                            </span>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                          <Percent className="w-4 h-4" />
                        </div>
                      </div>

                      {draftData.discountConfig.monetaryTiers && draftData.discountConfig.monetaryTiers.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-3 gap-1 text-center">
                          {draftData.discountConfig.monetaryTiers.map((t) => (
                            <div key={t.id} className="p-1 rounded bg-white/80 dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900 text-[10px]">
                              <span className="text-slate-500 block truncate">{t.label}</span>
                              <strong className="text-emerald-600 dark:text-emerald-400">+{t.bonusPercent}%</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANNEL RATES */}
          {activeTab === 'RATES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Katalog & Tarif Saluran Iklan Resmi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ubah tarif satuan per SMS broadcast, Targeted, LBA, SMS Flash Pop-up, MMS, USSD, RCS, dan WhatsApp WABA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {draftData.channelRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {rate.facility}
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">
                        {rate.featureName}
                      </strong>
                      <span className="text-[11px] text-slate-500 block">{rate.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="1"
                        value={rate.ratePerUnit}
                        onChange={(e) => handleRateChange(rate.id, Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs font-black text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP & CONTACT */}
          {activeTab === 'CONTACT' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Phone className="w-5 h-5" />
                    <span>Pengaturan Nomor WhatsApp & Informasi Brand</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tersinkronisasi 2-arah dengan Sheet <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">PENGATURAN_UMUM</span> di Google Spreadsheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof refreshData === 'function') {
                      await refreshData(false);
                      showToast('Data WhatsApp & Brand telah ditarik dari Google Spreadsheet', 'SUCCESS');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronisasi GSheet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Admin (Tujuan Pesanan / wa.me) *
                  </label>
                  <input
                    type="text"
                    placeholder="6281234567890"
                    value={draftData.companyConfig.waNumber}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, waNumber: e.target.value.replace(/\D/g, '') },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Gunakan format 628xxx tanpa spasi atau tanda +
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tampilan Nomor WhatsApp di Header / Footer:
                  </label>
                  <input
                    type="text"
                    value={draftData.companyConfig.waDisplayNumber}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, waDisplayNumber: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Brand / Portal:
                  </label>
                  <input
                    type="text"
                    value={draftData.companyConfig.brandName}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, brandName: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline Brand:
                  </label>
                  <input
                    type="text"
                    value={draftData.companyConfig.brandTagline}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, brandTagline: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Kantor Operasional:
                  </label>
                  <input
                    type="text"
                    value={draftData.companyConfig.officeAddress}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, officeAddress: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Operasional CS / Layanan:
                  </label>
                  <input
                    type="text"
                    value={draftData.companyConfig.operatingHours}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, operatingHours: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tampilkan Pengumuman / Announcement Bar di Atas Header:
                  </label>
                  <input
                    type="checkbox"
                    checked={draftData.companyConfig.showAnnouncement}
                    onChange={(e) =>
                      setDraftData((prev) => ({
                        ...prev,
                        companyConfig: { ...prev.companyConfig, showAnnouncement: e.target.checked },
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={draftData.companyConfig.announcementText}
                  onChange={(e) =>
                    setDraftData((prev) => ({
                      ...prev,
                      companyConfig: { ...prev.companyConfig, announcementText: e.target.value },
                    }))
                  }
                  placeholder="Teks pengumuman promosi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB: OFFICES & GOOGLE MAPS CONFIGURATION */}
          {activeTab === 'OFFICES' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Lokasi Kantor Pusat & Cabang ({(draftData.offices || []).length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Kelola daftar kantor cabang. Tersinkronisasi 2-arah dengan Sheet <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">LOKASI_CABANG</span> di Google Spreadsheet.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof refreshData === 'function') {
                        await refreshData(false);
                        if (typeof showToast === 'function') showToast('Data lokasi terbaru telah ditarik dari Google Sheet', 'SUCCESS');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sinkronisasi GSheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewOffice}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Lokasi Baru</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah / Edit Kantor (Tampil jika ada kantor yang sedang diedit) */}
              {editingOfficeId && (() => {
                const currentEditing = (draftData.offices || []).find((o) => o.id === editingOfficeId);
                if (!currentEditing) return null;
                return (
                  <div className="p-5 rounded-2xl border-2 border-blue-500/50 dark:border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-200/50 dark:border-blue-900/50">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Form Edit Lokasi: {currentEditing.name || 'Kantor Baru'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingOfficeId(null)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"
                      >
                        Tutup Form
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Kantor / Outlet *
                        </label>
                        <input
                          type="text"
                          value={currentEditing.name}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'name', e.target.value)}
                          placeholder="e.g. TDC Gresik"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tipe Kantor
                        </label>
                        <select
                          value={currentEditing.type}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'type', e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="CABANG">KANTOR CABANG</option>
                          <option value="PUSAT">KANTOR PUSAT</option>
                          <option value="SERVICE_POINT">SERVICE POINT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Kota / Wilayah *
                        </label>
                        <input
                          type="text"
                          value={currentEditing.cityName}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'cityName', e.target.value)}
                          placeholder="e.g. Gresik, Jawa Timur"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Pilih Cepat Kota Preset (Otomatis Atur Koordinat):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CITY_PRESETS.map((preset) => (
                            <button
                              key={preset.city}
                              type="button"
                              onClick={() => {
                                handleOfficeChange(currentEditing.id, 'cityName', preset.city);
                                handleOfficeChange(currentEditing.id, 'latitude', preset.lat);
                                handleOfficeChange(currentEditing.id, 'longitude', preset.lng);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              📍 {preset.city}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Alamat Lengkap Kantor
                        </label>
                        <textarea
                          rows={2}
                          value={currentEditing.address}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'address', e.target.value)}
                          placeholder="Alamat jalan, gedung, nomor, RT/RW..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Latitude (Garis Lintang)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={currentEditing.latitude}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'latitude', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Longitude (Garis Bujur)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={currentEditing.longitude}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'longitude', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Jam Operasional
                        </label>
                        <input
                          type="text"
                          value={currentEditing.operatingHours || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'operatingHours', e.target.value)}
                          placeholder="Senin - Sabtu (08.00 - 16.00)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nomor Telepon Kantor
                        </label>
                        <input
                          type="text"
                          value={currentEditing.phone || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'phone', e.target.value)}
                          placeholder="+62 812-3456-7890"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nomor WhatsApp Cabang
                        </label>
                        <input
                          type="text"
                          value={currentEditing.whatsapp || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'whatsapp', e.target.value)}
                          placeholder="6281234567890"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan / Info Fasilitas
                        </label>
                        <input
                          type="text"
                          value={currentEditing.notes || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'notes', e.target.value)}
                          placeholder="Layanan konsultasi, aktivasi..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-blue-200/50 dark:border-blue-900/50">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean(currentEditing.isPrimary)}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'isPrimary', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Tandai sebagai Kantor Pusat Utama</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingOfficeId(null);
                          showToast('Lokasi kantor diperbarui di formulir. Klik Simpan Pengaturan untuk sync ke Google Sheet.', 'SUCCESS');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                      >
                        Selesai Edit Lokasi
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Office Cards List */}
              <div className="space-y-4">
                {(draftData.offices || []).length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Belum ada data kantor / cabang.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Tambahkan lokasi kantor baru atau tarik data dari Google Spreadsheet.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewOffice}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Lokasi Pertama</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (typeof refreshData === 'function') {
                            await refreshData(false);
                            if (typeof showToast === 'function') showToast('Sinkronisasi data lokasi...', 'INFO');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Tarik dari Google Sheet</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  (draftData.offices || []).map((office, idx) => (
                    <div
                      key={office.id || idx}
                      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                        editingOfficeId === office.id
                          ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 shadow-xs'
                      } space-y-4`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {office.name || 'Kantor Cabang'}
                          </span>
                          {office.isPrimary && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                              ★ Utama
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                            {office.type === 'PUSAT' ? 'KANTOR PUSAT' : office.type === 'SERVICE_POINT' ? 'SERVICE POINT' : 'KANTOR CABANG'}
                          </span>

                          <button
                            type="button"
                            onClick={() => setEditingOfficeId(office.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteOffice(office.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Kota / Wilayah:</p>
                          <p className="font-bold text-slate-900 dark:text-white">{office.cityName || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Koordinat (Lat, Lng):</p>
                          <p className="font-mono text-slate-900 dark:text-white">{office.latitude}, {office.longitude}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Alamat Lengkap:</p>
                          <p className="text-slate-900 dark:text-white">{office.address || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Telepon & WhatsApp:</p>
                          <p className="text-slate-900 dark:text-white">{office.phone || '-'} / {office.whatsapp || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Jam Operasional:</p>
                          <p className="text-slate-900 dark:text-white">{office.operatingHours || '-'}</p>
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-blue-500" />
                            Titik Peta Google Maps
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${office.latitude},${office.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Google Maps</span>
                          </a>
                        </div>
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          <iframe
                            title={`Preview ${office.name}`}
                            src={`https://www.google.com/maps?q=${office.latitude},${office.longitude}&hl=id&z=15&output=embed`}
                            className="w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

{/* TAB 5: TESTIMONIALS */}
          {activeTab === 'TESTIMONIALS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Kelola Testimoni & Ulasan Pelanggan ({draftData.testimonials.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ulasan yang disubmit pengguna akan langsung tampil di sini dan di halaman publik secara real-time.
                </p>
              </div>

              <div className="space-y-3">
                {draftData.testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 dark:text-white font-bold text-sm">
                          {t.name}
                        </strong>
                        <span className="text-slate-400">
                          ({t.role} · {t.companyOrStore})
                        </span>
                        <span className="text-amber-500 font-bold">★ {t.rating}/5</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {t.packageName}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">"{t.comment}"</p>
                      <span className="text-[10px] text-slate-400 block">{t.date}</span>
                    </div>

                    <button
                      onClick={() =>
                        setDraftData((prev) => ({
                          ...prev,
                          testimonials: prev.testimonials.filter((item) => item.id !== t.id),
                        }))
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Ulasan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LEADS / ORDERS */}
          {activeTab === 'LEADS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Pesanan & Leads Masuk ({(draftData.orders || []).length})
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Otomatis diperbarui langsung saat calon klien mengirim pesanan tanpa perlu refresh.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {unreadOrdersCount > 0 && (
                    <button
                      onClick={() => {
                        const allIds = (draftData.orders || []).map((o) => o.id);
                        setReadOrderIds(allIds);
                        localStorage.setItem('akardaya_read_order_ids', JSON.stringify(allIds));
                        showToast('Semua pesanan ditandai sudah dibaca', 'INFO');
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      Tandai Sudah Dibaca
                    </button>
                  )}

                  <button
                    onClick={handleManualRefreshLeads}
                    disabled={isRefreshingLeads}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                    title="Periksa pesanan baru sekarang"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshingLeads ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingLeads ? 'Menyinkronkan...' : 'Segarkan'}</span>
                  </button>

                  <select
                    value={leadStatusFilter}
                    onChange={(e: any) => setLeadStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="ALL">Semua Status ({(draftData.orders || []).length})</option>
                    <option value="UNREAD">Belum Dibaca ({unreadOrdersCount})</option>
                    <option value="PENDING">Pending (Baru)</option>
                    <option value="CONTACTED">Telah Dihubungi</option>
                    <option value="COMPLETED">Selesai (Deal)</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  Tidak ada data pesanan yang sesuai filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 dark:text-white font-bold text-sm">
                            {order.customerName}
                          </strong>
                          {order.businessName && (
                            <span className="text-slate-500 dark:text-slate-400">
                              ({order.businessName})
                            </span>
                          )}
                          <select
                            value={order.status}
                            onChange={(e: any) => handleUpdateLeadStatus(order.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-none ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : order.status === 'CONTACTED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300">
                          📦 Paket:{' '}
                          <strong className="text-slate-900 dark:text-white">
                            {order.selectedPackageName}
                          </strong>{' '}
                          | Budget: {order.estimatedBudget}
                        </p>
                        {order.targetCityOrArea && (
                          <p className="text-slate-500">📍 Area: {order.targetCityOrArea}</p>
                        )}
                        {order.notes && (
                          <p className="text-slate-500 italic">📝 "{order.notes}"</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Waktu: {new Date(order.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${order.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Chat WA ({order.whatsapp})</span>
                        </a>

                        <button
                          onClick={() => handleDeleteLead(order.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
