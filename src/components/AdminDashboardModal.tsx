import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppData, SubscriptionPackage, ChannelRate, Testimonial, OrderLead, OfficeLocation } from '../types';
import { VisitorAnalyticsDashboard } from './VisitorAnalyticsDashboard';
import {
  X,
  Save,
  RotateCcw,
  ShieldCheck,
  Percent,
  Layers,
  Phone,
  MessageSquareQuote,
  Radio,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Coins,
  Sparkles,
  Award,
  Clock,
  Inbox,
  UserCheck,
  Globe,
  Palette,
  ExternalLink,
  MapPin,
  Building2,
  Navigation,
  Compass,
  BarChart3,
  RefreshCw,
  Sliders,
  Pause,
  Play,
  AlertTriangle,
  Check,
} from 'lucide-react';

export const AdminDashboardModal: React.FC = () => {
  const {
    data,
    isAdminOpen,
    setIsAdminOpen,
    updateAppData,
    resetToDefaults,
    isConnected,
    activeUsers,
    refreshData,
    showToast,
    isSyncPaused,
    setIsSyncPaused,
  } = useApp();
  
  // Local editable draft of AppData
  const [draftData, setDraftData] = useState<AppData>(data);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PACKAGES' | 'DISCOUNT' | 'RATES' | 'CONTACT' | 'OFFICES' | 'TESTIMONIALS' | 'LEADS'>('ANALYTICS');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

  // Check if draft has unsaved changes
  const isDirty = React.useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(data);
  }, [draftData, data]);

  // Automatically pause background sync whenever admin is actively editing or adding data
  useEffect(() => {
    if (isDirty && !isSyncPaused) {
      setIsSyncPaused(true);
    }
  }, [isDirty, isSyncPaused, setIsSyncPaused]);

  // Load initial data when modal opens
  useEffect(() => {
    if (isAdminOpen) {
      setDraftData(JSON.parse(JSON.stringify(data)));
    }
  }, [isAdminOpen]);

  // Sync draft data when server data updates ONLY IF NOT DIRTY and NOT PAUSED
  React.useEffect(() => {
    if (isAdminOpen) {
      if (isDirty || isSyncPaused) {
        // Do NOT overwrite user's editing draft!
        // Only update incoming orders safely so Leads tab gets new orders without resetting forms
        if (data.orders && JSON.stringify(draftData.orders) !== JSON.stringify(data.orders)) {
          setDraftData((prev) => ({ ...prev, orders: data.orders }));
        }
        return;
      }
      setDraftData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return JSON.parse(JSON.stringify(data));
      });
    }
  }, [isAdminOpen, data, isDirty, isSyncPaused]);

  // Real-time polling when modal is on Leads tab
  const refreshDataRef = useRef(refreshData);
  useEffect(() => {
    refreshDataRef.current = refreshData;
  }, [refreshData]);

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

  // Calculate unread orders count
  const unreadOrdersCount = React.useMemo(() => {
    return (draftData.orders || []).filter(
      (o) => !readOrderIds.includes(o.id) && o.status === 'PENDING' && !o.isRead
    ).length;
  }, [draftData.orders, readOrderIds]);

  // Mark all current orders as read when modal opens on LEADS tab or user switches to LEADS
  useEffect(() => {
    if (isAdminOpen && activeTab === 'LEADS' && draftData.orders && draftData.orders.length > 0) {
      const allIds = draftData.orders.map((o) => o.id);
      setReadOrderIds((prev) => {
        const next = Array.from(new Set([...prev, ...allIds]));
        if (typeof window !== 'undefined') {
          localStorage.setItem('akardaya_read_order_ids', JSON.stringify(next));
        }
        return next;
      });
    }
  }, [isAdminOpen, activeTab, draftData.orders]);

  useEffect(() => {
    if (isAdminOpen && activeTab === 'LEADS') {
      refreshDataRef.current(true);
      const interval = setInterval(() => {
        refreshDataRef.current(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdminOpen, activeTab]);

  const handleManualRefreshLeads = async () => {
    setIsRefreshingLeads(true);
    await refreshData(false);
    setIsRefreshingLeads(false);
  };

  const handleUpdateLeadStatus = async (orderId: string, status: 'PENDING' | 'CONTACTED' | 'COMPLETED') => {
    const updatedOrders = (draftData.orders || []).map((o) => (o.id === orderId ? { ...o, status } : o));
    setDraftData((prev) => ({ ...prev, orders: updatedOrders }));
    await updateAppData({ orders: updatedOrders });
    showToast(`Status pesanan diperbarui ke: ${status}`, 'success');
  };

  if (!isAdminOpen) return null;

  // Handlers for Package editing
  const handlePackageChange = (id: string, field: keyof SubscriptionPackage, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)),
    }));
  };

  const handleAddNewPackage = () => {
    const newId = `custom_pkg_${Date.now()}`;
    const newPkg: SubscriptionPackage = {
      id: newId,
      category: 'ONE_KLIK',
      categoryTitle: 'PAKET ONE KLIK TERIMA JADI',
      tierName: '<200.000',
      name: 'Paket Promo Baru',
      tagline: 'Paket promosi khusus dengan penawaran menarik',
      minBudget: 150000,
      priceDisplay: 'Rp 175.000',
      badge: 'Promo Baru',
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
      packages: [...prev.packages, newPkg],
    }));
    setEditingPackageId(newId);
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm('Hapus paket ini?')) {
      setDraftData((prev) => ({
        ...prev,
        packages: prev.packages.filter((pkg) => pkg.id !== id),
      }));
      if (editingPackageId === id) setEditingPackageId(null);
    }
  };

  // Handlers for Channel Rates
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

  // Handlers for Office / Branch Locations
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
      address: 'Jl. Pemuda / Raya Bisnis No. 1, Jawa Timur',
      latitude: -7.16124,
      longitude: 112.65189,
      phone: '+62 812-3456-7890',
      whatsapp: draftData.companyConfig.waNumber,
      operatingHours: 'Senin - Sabtu ( 08.00 - 16.00 )',
      isPrimary: false,
      notes: 'Layanan konsultasi & aktivasi kampanye iklan',
    };
    setDraftData((prev) => ({
      ...prev,
      offices: [...(prev.offices || []), newOffice],
    }));
    setEditingOfficeId(newId);
  };

  const handleDeleteOffice = (id: string) => {
    if (window.confirm('Hapus data kantor / cabang ini?')) {
      setDraftData((prev) => ({
        ...prev,
        offices: (prev.offices || []).filter((off) => off.id !== id),
      }));
      if (editingOfficeId === id) setEditingOfficeId(null);
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

  // Save all modifications and broadcast real-time
  const handleSaveAll = async () => {
    setIsSaving(true);
    const success = await updateAppData(draftData);
    setIsSaving(false);
    if (success) {
      setIsSyncPaused(false);
      setIsAdminOpen(false);
    }
  };

  // Close modal with unsaved check
  const handleCloseModal = () => {
    if (isDirty) {
      if (!window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup dashboard?')) {
        return;
      }
    }
    setIsSyncPaused(false);
    setIsAdminOpen(false);
  };

  // Reset to original default configuration
  const handleReset = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua data ke format default lampiran?')) {
      setIsSaving(true);
      await resetToDefaults();
      setIsSaving(false);
      setIsSyncPaused(false);
      setIsAdminOpen(false);
    }
  };

  return (
    <div
      id="modal-admin-dashboard-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Dashboard Pengaturan Admin
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
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
                  <span>{isConnected ? 'Server Aktif' : 'Menghubungkan...'}</span>
                  <span className="text-emerald-400 dark:text-emerald-600">|</span>
                  <span>{activeUsers} Pengunjung Website</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Semua perubahan yang disimpan otomatis terupdate langsung di semua HP, tablet & laptop pengunjung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Pause Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextPaused = !isSyncPaused;
                setIsSyncPaused(nextPaused);
                if (nextPaused) {
                  showToast('⏸️ Sinkronisasi otomatis dijeda (aman untuk edit & tambah menu)', 'info');
                } else {
                  showToast('🟢 Sinkronisasi otomatis aktif kembali', 'success');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isSyncPaused || isDirty
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs hover:bg-amber-600'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
              title="Klik untuk menjeda atau mengaktifkan sinkronisasi otomatis"
            >
              {isSyncPaused || isDirty ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Sinkron Dijeda (Aman Edit)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Sinkron Otomatis Aktif</span>
                </>
              )}
            </button>

            <a
              href="/admin.html"
              title="Buka di Halaman Penuh Terpisah (admin.html)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka admin.html</span>
            </a>
            <button
              id="btn-admin-close"
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Pengunjung & Analitik (Live)</span>
          </button>

          <button
            onClick={() => setActiveTab('PACKAGES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'PACKAGES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Paket & Fasilitas ({draftData.packages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DISCOUNT')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'DISCOUNT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Bonus Saldo ({draftData.discountConfig.reloadDiscountPercent}{String(draftData.discountConfig.reloadDiscountPercent).includes('%') ? '' : '%'})</span>
          </button>

          <button
            onClick={() => setActiveTab('RATES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'RATES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Tarif Saluran ({draftData.channelRates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTACT')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'CONTACT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp & Info Brand</span>
          </button>

          <button
            onClick={() => setActiveTab('OFFICES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'OFFICES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Lokasi & Maps ({(draftData.offices || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TESTIMONIALS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'TESTIMONIALS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Testimoni ({draftData.testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LEADS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'LEADS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Pesanan Masuk</span>
            <span className="opacity-75 text-[10px]">
              ({(draftData.orders || []).length})
            </span>
            {unreadOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold animate-pulse shadow-xs">
                {unreadOrdersCount} baru
              </span>
            )}
          </button>
        </div>

        {/* Sync Status / Edit Protection Notice Banner */}
        {(isDirty || isSyncPaused) && (
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                <Pause className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>{isDirty ? 'Mode Edit / Tambah Aktif' : 'Sinkronisasi Otomatis Dijeda'}:</strong> Sinkronisasi latar belakang dijeda agar data yang sedang Anda ketik/tambah tidak tertimpa atau berubah-ubah.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/60">
          {/* TAB 0: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <VisitorAnalyticsDashboard />
          )}

          {/* TAB 1: PACKAGES MANAGEMENT */}
          {activeTab === 'PACKAGES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Paket Langganan & Fasilitas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Edit nama paket, harga tier, gratis konten, gratis website 3 bulan, dan jenis akun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewPackage}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Paket Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftData.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                          {pkg.categoryTitle}
                        </span>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)}
                          className="w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 py-0.5 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
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
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
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
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
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
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
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
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                          Tandai sebagai Paket Populer (Border Biru)
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RELOAD DISCOUNT & PROMO */}
          {activeTab === 'DISCOUNT' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-850 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <Percent className="w-5 h-5" />
                  <span>Pengaturan Bonus Saldo Isi Ulang</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ubah persentase bonus saldo top-up yang berlaku di banner promo, kalkulator, dan formulir pemesanan.
                </p>

                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tabel Skema Bonus Saldo Isi Ulang:
                    </label>
                  </div>

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

                  <div>
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

          {/* TAB 3: CHANNEL RATES MATRIX */}
          {activeTab === 'RATES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Tarif Saluran Promosi (Rate Matrix)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Edit tarif satuan per SMS, MMS, USSD, RCS, atau WhatsApp WABA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {draftData.channelRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs flex items-center justify-between"
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
                        min="10"
                        value={rate.ratePerUnit}
                        onChange={(e) => handleRateChange(rate.id, Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs font-black text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP & CONTACT */}
          {activeTab === 'CONTACT' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>Pengaturan WhatsApp & Kontak Resmi</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tersinkronisasi 2-arah dengan Sheet <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">PENGATURAN_UMUM</span> di Google Spreadsheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof refreshData === 'function') {
                      await refreshData(false);
                      if (typeof showToast === 'function') showToast('Data WhatsApp & Brand telah ditarik dari Google Spreadsheet', 'SUCCESS');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronisasi GSheet</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor WhatsApp Admin (Untuk Link wa.me) *
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
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 628xxx tanpa tanda + atau spasi</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tampilan Nomor WhatsApp di Header:
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Brand / Usaha:
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                      Jam Layanan Operasional:
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
                      Tampilkan Pengumuman Bar di Atas Header:
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
                      className="rounded text-blue-600"
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
            </div>
          )}

          {/* TAB: OFFICES & MAPS CONFIGURATION */}
          {activeTab === 'OFFICES' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Lokasi Kantor Pusat & Kantor Cabang ({(draftData.offices || []).length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Kelola daftar kantor cabang. Tersinkronisasi 2-arah dengan Sheet <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">LOKASI_CABANG</span> di Google Spreadsheet.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof refreshData === 'function') {
                        await refreshData(false);
                        if (typeof showToast === 'function') showToast('Data lokasi tersinkronisasi dari Google Sheet', 'SUCCESS');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sinkronisasi GSheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewOffice}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Lokasi Baru</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah / Edit Kantor */}
              {editingOfficeId && (() => {
                const currentEditing = (draftData.offices || []).find((o) => o.id === editingOfficeId);
                if (!currentEditing) return null;
                return (
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-blue-500/50 dark:border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-200/50 dark:border-blue-900/50">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Form Edit Lokasi: {currentEditing.name || 'Kantor Baru'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingOfficeId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"
                      >
                        Tutup Form
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Kantor / Outlet *
                        </label>
                        <input
                          type="text"
                          value={currentEditing.name}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'name', e.target.value)}
                          placeholder="e.g. TDC Gresik"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tipe Kantor
                        </label>
                        <select
                          value={currentEditing.type}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'type', e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
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
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
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
                              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 transition-colors"
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
                          placeholder="Alamat jalan, nomor, RT/RW..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={currentEditing.latitude}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'latitude', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={currentEditing.longitude}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'longitude', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
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
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nomor Telepon
                        </label>
                        <input
                          type="text"
                          value={currentEditing.phone || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'phone', e.target.value)}
                          placeholder="+62 812-3456-7890"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan Khusus
                        </label>
                        <input
                          type="text"
                          value={currentEditing.notes || ''}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'notes', e.target.value)}
                          placeholder="Layanan konsultasi..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-blue-200/50 dark:border-blue-900/50">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean(currentEditing.isPrimary)}
                          onChange={(e) => handleOfficeChange(currentEditing.id, 'isPrimary', e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Tandai sebagai Kantor Pusat Utama</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingOfficeId(null);
                          if (typeof showToast === 'function') showToast('Perubahan lokasi disimpan di formulir draft', 'SUCCESS');
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
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
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Data lokasi masih kosong.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Tambahkan lokasi cabang baru atau tarik data dari Google Spreadsheet.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewOffice}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Tarik dari Google Sheet</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  (draftData.offices || []).map((office, index) => (
                    <div
                      key={office.id || index}
                      className={`p-4 sm:p-5 rounded-2xl border ${
                        editingOfficeId === office.id
                          ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      } bg-white dark:bg-slate-850 shadow-xs space-y-4`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {office.name || 'Kantor'}
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
                            <Edit2 className="w-3.5 h-3.5" />
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

                      {/* Live Map Preview */}
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
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kelola Testimoni & Ulasan Pelanggan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review ulasan yang masuk atau edit data testimoni pelanggan setia.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {draftData.testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white font-bold">{t.name}</strong>
                        <span className="text-slate-400">({t.role} - {t.companyOrStore})</span>
                        <span className="text-amber-500 font-bold">★ {t.rating}/5</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">"{t.comment}"</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                        {t.packageName} · {t.date}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setDraftData((prev) => ({
                          ...prev,
                          testimonials: prev.testimonials.filter((item) => item.id !== t.id),
                        }))
                      }
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Hapus Ulasan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ORDERS / LEADS */}
          {activeTab === 'LEADS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Daftar Pesanan & Lead Konsultasi Masuk ({(draftData.orders || []).length})
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Otomatis diperbarui langsung saat calon klien mengirim pesanan tanpa perlu refresh halaman.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadOrdersCount > 0 && (
                    <button
                      onClick={() => {
                        const allIds = (draftData.orders || []).map((o) => o.id);
                        setReadOrderIds(allIds);
                        localStorage.setItem('akardaya_read_order_ids', JSON.stringify(allIds));
                        showToast('Semua pesanan ditandai sudah dibaca', 'success');
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      Tandai Sudah Dibaca
                    </button>
                  )}

                  <button
                    onClick={handleManualRefreshLeads}
                    disabled={isRefreshingLeads}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-60"
                    title="Periksa pesanan baru sekarang"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshingLeads ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingLeads ? 'Menyinkronkan...' : 'Segarkan'}</span>
                  </button>
                </div>
              </div>

              {(!draftData.orders || draftData.orders.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  Belum ada pesanan baru yang masuk.
                </div>
              ) : (
                <div className="space-y-3">
                  {draftData.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-none cursor-pointer ${
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
                          📦 Paket: <strong className="text-slate-900 dark:text-white">{order.selectedPackageName}</strong> | Budget: {order.estimatedBudget}
                        </p>
                        {order.targetCityOrArea && (
                          <p className="text-slate-500">📍 Area: {order.targetCityOrArea}</p>
                        )}
                        {order.notes && <p className="text-slate-500 italic">📝 "{order.notes}"</p>}
                        <p className="text-[10px] text-slate-400">
                          Waktu: {new Date(order.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${order.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Hubungi WA ({order.whatsapp})</span>
                        </a>

                        <button
                          onClick={() =>
                            setDraftData((prev) => ({
                              ...prev,
                              orders: prev.orders.filter((o) => o.id !== order.id),
                            }))
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
          <button
            id="btn-admin-reset-defaults"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Default Lampiran</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tutup
            </button>

            <button
              id="btn-admin-save-broadcast"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan & Siarkan Real-Time'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
