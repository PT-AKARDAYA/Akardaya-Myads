import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppData, SubscriptionPackage, ChannelRate, Testimonial, OrderLead, OfficeLocation, BankAccount } from '../types';
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
  CreditCard,
  Star,
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

  // Bank Accounts Management States
  const [isAddingBankAccount, setIsAddingBankAccount] = useState<boolean>(false);
  const [editingBankAccountId, setEditingBankAccountId] = useState<string | null>(null);
  const [bankAccountForm, setBankAccountForm] = useState<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    notes: string;
    isPrimary: boolean;
    isActive: boolean;
  }>({
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '',
    accountHolder: 'PT Akardaya Telekomunikasi Indonesia',
    notes: '',
    isPrimary: false,
    isActive: true,
  });

  // Check if draft has unsaved changes
  const isDirty = React.useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(data);
  }, [draftData, data]);

  // Focus tracking: Pause G-Sheets sync strictly when cursor is inside an input field,
  // and resume sync immediately when cursor leaves or user clicks outside/switches menu
  useEffect(() => {
    if (!isAdminOpen) return;

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
  }, [isAdminOpen, setIsSyncPaused]);

  // Helper when clicking another menu/tab: blur inputs and restore active sync
  const handleSelectTab = (tab: typeof activeTab) => {
    if (typeof document !== 'undefined' && document.activeElement) {
      (document.activeElement as HTMLElement).blur?.();
    }
    setIsSyncPaused(false);
    setActiveTab(tab);
  };

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
    const finalValue = typeof value === 'string'
      ? value.replace(/>=/g, '≥').replace(/<=/g, '≤').replace(/>\s*Rp/g, '≥ Rp').replace(/^>\s*/, '≥ ')
      : value;
    setDraftData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => (pkg.id === id ? { ...pkg, [field]: finalValue } : pkg)),
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

  const POPULAR_BANKS = [
    'BCA (Bank Central Asia)',
    'Bank Mandiri',
    'BRI (Bank Rakyat Indonesia)',
    'BNI (Bank Negara Indonesia)',
    'BSI (Bank Syariah Indonesia)',
    'CIMB Niaga',
    'Bank Permata',
    'Bank Danamon',
    'Bank Jago',
    'SeaBank',
    'QRIS (Semua E-Wallet / Mobile)',
  ];

  const handleOpenAddBankAccount = () => {
    setEditingBankAccountId(null);
    const existingAccounts = draftData.companyConfig.bankAccounts || [];
    setBankAccountForm({
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '',
      accountHolder: draftData.companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
      notes: '',
      isPrimary: existingAccounts.length === 0,
      isActive: true,
    });
    setIsAddingBankAccount(true);
  };

  const handleOpenEditBankAccount = (bank: BankAccount) => {
    setEditingBankAccountId(bank.id);
    setBankAccountForm({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolder: bank.accountHolder,
      notes: bank.notes || '',
      isPrimary: Boolean(bank.isPrimary),
      isActive: bank.isActive !== false,
    });
    setIsAddingBankAccount(true);
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountForm.bankName.trim() || !bankAccountForm.accountNumber.trim()) {
      alert('Nama bank dan nomor rekening wajib diisi.');
      return;
    }

    setDraftData((prev) => {
      const currentList: BankAccount[] = (prev.companyConfig.bankAccounts && prev.companyConfig.bankAccounts.length > 0)
        ? [...prev.companyConfig.bankAccounts]
        : [
            {
              id: 'bank-default-1',
              bankName: prev.companyConfig.bankName || 'BCA (Bank Central Asia)',
              accountNumber: prev.companyConfig.bankAccountNumber || '0188-3333-7157',
              accountHolder: prev.companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
              isPrimary: true,
              isActive: true,
              notes: 'Rekening Utama',
            },
          ];

      const isNewPrimary = bankAccountForm.isPrimary || currentList.length === 0;
      let updatedList: BankAccount[];

      if (editingBankAccountId) {
        updatedList = currentList.map((b) => {
          if (b.id === editingBankAccountId) {
            return {
              ...b,
              bankName: bankAccountForm.bankName.trim(),
              accountNumber: bankAccountForm.accountNumber.trim(),
              accountHolder: bankAccountForm.accountHolder.trim() || 'PT Akardaya Telekomunikasi Indonesia',
              notes: bankAccountForm.notes.trim(),
              isPrimary: isNewPrimary,
              isActive: bankAccountForm.isActive,
            };
          }
          return isNewPrimary ? { ...b, isPrimary: false } : b;
        });
      } else {
        const newBank: BankAccount = {
          id: `bank-${Date.now()}`,
          bankName: bankAccountForm.bankName.trim(),
          accountNumber: bankAccountForm.accountNumber.trim(),
          accountHolder: bankAccountForm.accountHolder.trim() || 'PT Akardaya Telekomunikasi Indonesia',
          notes: bankAccountForm.notes.trim(),
          isPrimary: isNewPrimary,
          isActive: bankAccountForm.isActive,
        };
        const resetOldPrimary = isNewPrimary ? currentList.map((b) => ({ ...b, isPrimary: false })) : currentList;
        updatedList = [...resetOldPrimary, newBank];
      }

      if (!updatedList.some((b) => b.isPrimary) && updatedList.length > 0) {
        updatedList[0].isPrimary = true;
      }

      const primaryBank = updatedList.find((b) => b.isPrimary) || updatedList[0];

      return {
        ...prev,
        companyConfig: {
          ...prev.companyConfig,
          bankAccounts: updatedList,
          bankName: primaryBank ? primaryBank.bankName : prev.companyConfig.bankName,
          bankAccountNumber: primaryBank ? primaryBank.accountNumber : prev.companyConfig.bankAccountNumber,
          bankAccountHolder: primaryBank ? primaryBank.accountHolder : prev.companyConfig.bankAccountHolder,
        },
      };
    });

    setIsAddingBankAccount(false);
    setEditingBankAccountId(null);
  };

  const handleDeleteBankAccount = (id: string) => {
    const currentList = draftData.companyConfig.bankAccounts || [];
    if (currentList.length <= 1) {
      alert('Minimal harus ada 1 rekening bank resmi terdaftar untuk pembayaran.');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus rekening bank ini?')) return;

    setDraftData((prev) => {
      const list = prev.companyConfig.bankAccounts || [];
      const filtered = list.filter((b) => b.id !== id);
      const hasPrimary = filtered.some((b) => b.isPrimary);
      const updatedList = hasPrimary
        ? filtered
        : filtered.map((b, idx) => (idx === 0 ? { ...b, isPrimary: true } : b));

      const primaryBank = updatedList.find((b) => b.isPrimary) || updatedList[0];

      return {
        ...prev,
        companyConfig: {
          ...prev.companyConfig,
          bankAccounts: updatedList,
          bankName: primaryBank ? primaryBank.bankName : prev.companyConfig.bankName,
          bankAccountNumber: primaryBank ? primaryBank.accountNumber : prev.companyConfig.bankAccountNumber,
          bankAccountHolder: primaryBank ? primaryBank.accountHolder : prev.companyConfig.bankAccountHolder,
        },
      };
    });
  };

  const handleSetPrimaryBankAccount = (id: string) => {
    setDraftData((prev) => {
      const currentList = prev.companyConfig.bankAccounts || [];
      const updatedList = currentList.map((b) => ({
        ...b,
        isPrimary: b.id === id,
      }));
      const primaryBank = updatedList.find((b) => b.isPrimary);
      return {
        ...prev,
        companyConfig: {
          ...prev.companyConfig,
          bankAccounts: updatedList,
          bankName: primaryBank ? primaryBank.bankName : prev.companyConfig.bankName,
          bankAccountNumber: primaryBank ? primaryBank.accountNumber : prev.companyConfig.bankAccountNumber,
          bankAccountHolder: primaryBank ? primaryBank.accountHolder : prev.companyConfig.bankAccountHolder,
        },
      };
    });
  };

  const handleToggleActiveBankAccount = (id: string) => {
    setDraftData((prev) => {
      const currentList = prev.companyConfig.bankAccounts || [];
      const updatedList = currentList.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
      return {
        ...prev,
        companyConfig: {
          ...prev.companyConfig,
          bankAccounts: updatedList,
        },
      };
    });
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

  // Save Bank Accounts Directly to Database
  const handleSaveBankAccountsDirectly = async () => {
    setIsSaving(true);
    const success = await updateAppData({
      companyConfig: draftData.companyConfig,
    });
    setIsSaving(false);
  };

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
            {/* Google Sheets Sync Status Icon Indicator */}
            <button
              type="button"
              onClick={() => {
                const nextPaused = !isSyncPaused;
                setIsSyncPaused(nextPaused);
                if (nextPaused) {
                  showToast('⏸️ Sinkronisasi G-Sheets dijeda manual', 'info');
                } else {
                  showToast('🟢 Sinkronisasi G-Sheets aktif kembali', 'success');
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
            onClick={() => handleSelectTab('ANALYTICS')}
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
            onClick={() => handleSelectTab('PACKAGES')}
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
            onClick={() => handleSelectTab('DISCOUNT')}
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
            onClick={() => handleSelectTab('RATES')}
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
            onClick={() => handleSelectTab('CONTACT')}
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
            onClick={() => handleSelectTab('OFFICES')}
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
            onClick={() => handleSelectTab('TESTIMONIALS')}
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
            onClick={() => handleSelectTab('LEADS')}
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
                                  newTiers[index].label = e.target.value.replace(/>=/g, '≥').replace(/<=/g, '≤');
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

                {/* Pengaturan Rekening Pembayaran Resmi (Multi-Rekening) */}
                <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Pengaturan Rekening Bank Pembayaran</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {(draftData.companyConfig.bankAccounts || []).length} Rekening Terdaftar
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Kelola nomor rekening resmi untuk pembayaran iklan. Pemesan dapat memilih rekening dan menyalin nomor secara instan.
                        </p>
                      </div>
                    </div>

                    {!isAddingBankAccount && (
                      <button
                        type="button"
                        id="btn-admin-modal-add-bank-account"
                        onClick={handleOpenAddBankAccount}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Rekening Baru</span>
                      </button>
                    )}
                  </div>

                  {/* FORM TAMBAH / EDIT REKENING */}
                  {isAddingBankAccount && (
                    <form
                      onSubmit={handleSaveBankAccount}
                      className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-500/30 mb-5 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200 dark:border-emerald-800/60">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {editingBankAccountId ? 'Edit Data Rekening Bank' : 'Tambah Rekening Bank Baru'}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingBankAccount(false);
                            setEditingBankAccountId(null);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                        >
                          Batal
                        </button>
                      </div>

                      {/* Quick Bank Choice Chips */}
                      <div className="mb-3">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Pilihan Cepat Bank / E-Wallet:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_BANKS.map((bName) => (
                            <button
                              key={bName}
                              type="button"
                              onClick={() => setBankAccountForm((prev) => ({ ...prev, bankName: bName }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                                bankAccountForm.bankName === bName
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {bName.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Bank / Metode Transfer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: BCA (Bank Central Asia)"
                            value={bankAccountForm.bankName}
                            onChange={(e) => setBankAccountForm((prev) => ({ ...prev, bankName: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nomor Rekening <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: 0188-3333-7157"
                            value={bankAccountForm.accountNumber}
                            onChange={(e) => setBankAccountForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Atas Nama Rekening <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: PT Akardaya Telekomunikasi Indonesia"
                            value={bankAccountForm.accountHolder}
                            onChange={(e) => setBankAccountForm((prev) => ({ ...prev, accountHolder: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </div>
                      </div>

                      <div className="mb-3 text-xs">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan / Fasilitas Transfer (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Menerima transfer dari seluruh bank (BI-FAST / Realtime Online)"
                          value={bankAccountForm.notes}
                          onChange={(e) => setBankAccountForm((prev) => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/40">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={bankAccountForm.isPrimary}
                              onChange={(e) => setBankAccountForm((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Jadikan Rekening Utama (Default)
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={bankAccountForm.isActive}
                              onChange={(e) => setBankAccountForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">
                              Status Aktif (Ditampilkan ke Pemesan)
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingBankAccount(false);
                              setEditingBankAccountId(null);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{editingBankAccountId ? 'Simpan Perubahan Rekening' : 'Tambahkan Rekening'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* DAFTAR REKENING BANK TERDAFTAR */}
                  <div className="space-y-2.5 mb-4">
                    {(draftData.companyConfig.bankAccounts || []).map((account, index) => {
                      const isPrimary = Boolean(account.isPrimary);
                      const isActive = account.isActive !== false;

                      return (
                        <div
                          key={account.id || index}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isPrimary
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700'
                          } ${!isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}`}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {account.bankName}
                              </span>
                              {isPrimary && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                                  <span>Rekening Utama</span>
                                </span>
                              )}
                              {!isActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                Nonaktif
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                {account.accountNumber}
                              </div>
                              <span className="text-slate-400">•</span>
                              <div className="text-slate-700 dark:text-slate-300 font-semibold">
                                a/n {account.accountHolder}
                              </div>
                            </div>

                            {account.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                💡 {account.notes}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0">
                            {!isPrimary && isActive && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryBankAccount(account.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
                                title="Jadikan sebagai rekening utama"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span>Jadikan Utama</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleActiveBankAccount(account.id)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                                isActive
                                  ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                  : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                              title={isActive ? 'Nonaktifkan rekening ini' : 'Aktifkan rekening ini'}
                            >
                              {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditBankAccount(account)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                              title="Edit rekening"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBankAccount(account.id)}
                              disabled={(draftData.companyConfig.bankAccounts || []).length <= 1}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Hapus rekening"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Panduan Instruksi Pembayaran */}
                  <div className="text-xs pt-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Panduan / Instruksi Pembayaran (Muncul di Layar Selesai Order):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Silakan transfer sesuai estimasi total tagihan ke rekening resmi di atas. Setelah transfer, kirim bukti transfer ke WhatsApp admin untuk verifikasi..."
                      value={draftData.companyConfig.paymentInstructions || ''}
                      onChange={(e) =>
                        setDraftData((prev) => ({
                          ...prev,
                          companyConfig: { ...prev.companyConfig, paymentInstructions: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      💡 Petunjuk ini akan langsung terbaca oleh pelanggan bersama nomor rekening resmi begitu mereka menekan tombol <strong>Kirim Pesanan</strong>.
                    </p>
                  </div>

                  {/* Tombol Simpan Pengaturan Rekening Langsung */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50">
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Perubahan rekening tersimpan di draft. Klik tombol untuk menyimpan ke database server & spreadsheet.</span>
                    </div>
                    <button
                      type="button"
                      id="btn-save-bank-accounts-modal"
                      disabled={isSaving}
                      onClick={handleSaveBankAccountsDirectly}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Rekening'}</span>
                    </button>
                  </div>
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
                          📦 Paket: <strong className="text-slate-900 dark:text-white">{order.selectedPackageName}</strong> | Budget: {order.estimatedBudget} • <span className="font-semibold text-blue-600 dark:text-blue-400">{order.campaignType || 'BROADCAST'}</span>
                        </p>
                        {order.targetCityOrArea && (
                          <p className="text-slate-500">📍 Area: {order.targetCityOrArea}</p>
                        )}
                        {(order.latitude !== undefined && order.longitude !== undefined) && (
                          <p className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                            🗺️ GPS: Lat {order.latitude}, Lng {order.longitude} (Radius {order.radiusMeters >= 1000 ? `${(order.radiusMeters / 1000).toFixed(1)} km` : `${order.radiusMeters} m`})
                            {order.streetAddress && ` • ${order.streetAddress}`}
                          </p>
                        )}
                        {order.uploadedListFileName && (
                          <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                            📊 File Kontak: <strong>{order.uploadedListFileName}</strong> ({order.uploadedListFileSize || ''}{order.uploadedListFileCount ? ` • ~${order.uploadedListFileCount} Nomor` : ''})
                          </p>
                        )}
                        {order.broadcastDate && (
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                            📅 Tanggal Siar: <strong>{order.broadcastDate}</strong> {order.senderName && `• Sender: ${order.senderName}`}
                          </p>
                        )}
                        {(order.campaignType === 'TARGETED' || order.targetAgeGroup) && (
                          <div className="mt-1 p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-[10px] space-y-0.5">
                            <span className="font-bold text-rose-700 dark:text-rose-400 block">🎯 Filter Targeting:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-slate-700 dark:text-slate-300">
                              <span>• Usia: {order.targetAgeGroup || 'Semua'}</span>
                              <span>• Religi: {order.targetReligion || 'Semua'}</span>
                              <span>• Gender: {order.targetGender || 'Semua'}</span>
                              <span>• ARPU: {order.targetArpuSpending || 'Semua'}</span>
                              <span>• SES: {order.targetSes || 'Semua'}</span>
                              <span>• Device: {order.targetDeviceOs || 'Semua'}</span>
                              <span>• Status: {order.targetMaritalStatus || 'Semua'}</span>
                              <span className="truncate" title={order.targetInterests?.join(', ') || 'Semua'}>
                                • Minat: {order.targetInterests && order.targetInterests.length > 0 ? `${order.targetInterests.length} Minat` : 'Semua'}
                              </span>
                            </div>
                          </div>
                        )}
                        {order.adMessageContent && (
                          <p className="text-slate-600 dark:text-slate-300 italic text-[11px] bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded border border-slate-200/70 dark:border-slate-700">
                            💬 "{order.adMessageContent}"
                            {order.webLink && <span className="block not-italic text-blue-500 underline mt-0.5">Link: {order.webLink}</span>}
                          </p>
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
