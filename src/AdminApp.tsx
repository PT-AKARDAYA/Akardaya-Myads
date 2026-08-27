import React, { useState, useEffect } from 'react';
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
  } = useApp();

  // Local editable draft
  const [draftData, setDraftData] = useState<AppData>(data);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PACKAGES' | 'DISCOUNT' | 'RATES' | 'CONTACT' | 'OFFICES' | 'TESTIMONIALS' | 'LEADS'>('ANALYTICS');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL');
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

  // Simple optional PIN lock to prevent accidental edits
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('digiads_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Sync draft when server data updates
  useEffect(() => {
    setDraftData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  // Faster background lead poller (every 4s) when activeTab is LEADS
  useEffect(() => {
    if (activeTab === 'LEADS') {
      refreshData(true);
      const interval = setInterval(() => {
        refreshData(true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, refreshData]);

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

    if (leadStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && o.status === leadStatusFilter;
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
            {/* View public website */}
            <a
              href="/"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Website Publik</span>
              <span className="sm:hidden">Web</span>
            </a>

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
              onClick={() => setActiveTab('ANALYTICS')}
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
              onClick={() => setActiveTab('PACKAGES')}
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
              onClick={() => setActiveTab('DISCOUNT')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'DISCOUNT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Percent className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Diskon Isi Ulang</span>
                <span className="hidden md:inline-block ml-1 opacity-75 text-[10px]">
                  ({draftData.discountConfig.reloadDiscountPercent}%)
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('RATES')}
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
              onClick={() => setActiveTab('CONTACT')}
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
              onClick={() => setActiveTab('OFFICES')}
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
              onClick={() => setActiveTab('TESTIMONIALS')}
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
              onClick={() => setActiveTab('LEADS')}
              className={`flex-1 md:w-full px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'LEADS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>Pesanan Masuk</span>
                {(draftData.orders?.length || 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                    {draftData.orders?.length}
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
                  <span>Pengaturan Diskon Saldo Isi Ulang & Banner Promo</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ubah persentase diskon isi ulang yang otomatis terhitung di kalkulator biaya iklan, matriks tabel, dan pesan WhatsApp.
                </p>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Persentase Diskon Top-Up Saldo (%):
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Misal: 3% akan otomatis memotong total biaya saat pengiklan melakukan top-up.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={draftData.discountConfig.reloadDiscountPercent}
                      onChange={(e) =>
                        setDraftData((prev) => ({
                          ...prev,
                          discountConfig: {
                            ...prev.discountConfig,
                            reloadDiscountPercent: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-24 px-3 py-2 text-xl font-black text-center rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 focus:outline-none"
                    />
                    <span className="text-lg font-black text-slate-700 dark:text-slate-300">%</span>
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  ></textarea>
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
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Phone className="w-5 h-5" />
                <span>Pengaturan Nomor WhatsApp & Informasi Brand</span>
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
                    <span>Kelola Lokasi Kantor Pusat & Kantor Cabang ({(draftData.offices || []).length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Atur nama kantor, alamat lengkap, jam operasional, serta koordinat Latitude & Longitude Google Maps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewOffice}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kantor / Cabang</span>
                </button>
              </div>

              {/* Office Cards */}
              <div className="space-y-4">
                {(draftData.offices || []).map((office, idx) => (
                  <div
                    key={office.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={office.name}
                          onChange={(e) => handleOfficeChange(office.id, 'name', e.target.value)}
                          placeholder="Nama Kantor (e.g. Kantor Cabang Surabaya)"
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 min-w-[220px]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={office.type}
                          onChange={(e) =>
                            handleOfficeChange(office.id, 'type', e.target.value as 'PUSAT' | 'CABANG')
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="PUSAT">Kantor Pusat</option>
                          <option value="CABANG">Kantor Cabang</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteOffice(office.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus Kantor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick City Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400">Preset Cepat:</span>
                      {CITY_PRESETS.map((preset) => (
                        <button
                          key={preset.city}
                          type="button"
                          onClick={() => {
                            handleOfficeChange(office.id, 'cityName', preset.city);
                            handleOfficeChange(office.id, 'latitude', preset.lat);
                            handleOfficeChange(office.id, 'longitude', preset.lng);
                            showToast(`Koordinat diisi untuk ${preset.city.split(',')[0]}`, 'INFO');
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors"
                        >
                          {preset.city.split(',')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Kota / Wilayah:
                        </label>
                        <input
                          type="text"
                          value={office.cityName}
                          onChange={(e) => handleOfficeChange(office.id, 'cityName', e.target.value)}
                          placeholder="Gresik, Jawa Timur"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Latitude (Garis Lintang):
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={office.latitude}
                          onChange={(e) =>
                            handleOfficeChange(office.id, 'latitude', parseFloat(e.target.value) || 0)
                          }
                          placeholder="-7.161240"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Longitude (Garis Bujur):
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={office.longitude}
                          onChange={(e) =>
                            handleOfficeChange(office.id, 'longitude', parseFloat(e.target.value) || 0)
                          }
                          placeholder="112.651890"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Alamat Lengkap Kantor:
                        </label>
                        <textarea
                          rows={2}
                          value={office.address}
                          onChange={(e) => handleOfficeChange(office.id, 'address', e.target.value)}
                          placeholder="Jl. RA Kartini No. 88, Kebomas, Gresik, Jawa Timur 61121"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          No. WhatsApp Cabang:
                        </label>
                        <input
                          type="text"
                          value={office.whatsapp || ''}
                          onChange={(e) => handleOfficeChange(office.id, 'whatsapp', e.target.value)}
                          placeholder="6281234567890"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Jam Layanan Operasional:
                        </label>
                        <input
                          type="text"
                          value={office.operatingHours || ''}
                          onChange={(e) => handleOfficeChange(office.id, 'operatingHours', e.target.value)}
                          placeholder="Senin - Sabtu ( 08.00 - 16.00 )"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Catatan / Layanan:
                        </label>
                        <input
                          type="text"
                          value={office.notes || ''}
                          onChange={(e) => handleOfficeChange(office.id, 'notes', e.target.value)}
                          placeholder="Layanan konsultasi & aktivasi"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
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
                ))}
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

                <div className="flex items-center gap-2">
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
                    <option value="ALL">Semua Status</option>
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
