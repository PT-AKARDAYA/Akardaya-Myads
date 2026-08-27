import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppData, SubscriptionPackage, ChannelRate, Testimonial, OrderLead, OfficeLocation } from '../types';
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
  HelpCircle,
  Coins,
  Sparkles,
  Inbox,
  UserCheck,
  Globe,
  Palette,
  ExternalLink,
  MapPin,
  Building2,
  Navigation,
  Compass,
} from 'lucide-react';

export const AdminDashboardModal: React.FC = () => {
  const { data, isAdminOpen, setIsAdminOpen, updateAppData, resetToDefaults, isConnected, activeUsers } = useApp();
  
  // Local editable draft of AppData
  const [draftData, setDraftData] = useState<AppData>(data);
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'DISCOUNT' | 'RATES' | 'CONTACT' | 'OFFICES' | 'TESTIMONIALS' | 'LEADS'>('PACKAGES');
  const [isSaving, setIsSaving] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

  // Sync draft data when modal opens
  React.useEffect(() => {
    if (isAdminOpen) {
      setDraftData(JSON.parse(JSON.stringify(data)));
    }
  }, [isAdminOpen, data]);

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
      setIsAdminOpen(false);
    }
  };

  // Reset to original default configuration
  const handleReset = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua data ke format default lampiran?')) {
      setIsSaving(true);
      await resetToDefaults();
      setIsSaving(false);
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
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
                  <span>{isConnected ? 'Server Sinkronisasi Aktif' : 'Menghubungkan...'}</span>
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
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar py-2">
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
            <span>Diskon Isi Ulang ({draftData.discountConfig.reloadDiscountPercent}%)</span>
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
            <span>Pesanan Masuk ({draftData.orders?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/60">
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
                  <span>Pengaturan Diskon Saldo Isi Ulang</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ubah persentase diskon top-up yang berlaku di kalkulator, matriks paket, dan formulir pemesanan.
                </p>

                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Persentase Diskon Isi Ulang (%):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="input-admin-discount-percent"
                      type="number"
                      min="0"
                      max="50"
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
                      className="w-24 px-3 py-2 text-lg font-black text-center rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      % OFF untuk Setiap Top-Up Saldo Iklan
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    ></textarea>
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
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Pengaturan WhatsApp & Kontak Resmi</span>
                </h3>

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
                    <span>Pengaturan Lokasi Kantor Pusat & Kantor Cabang</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Kelola nama, alamat, jam buka, serta koordinat Latitude & Longitude Google Maps yang tampil di halaman depan.
                  </p>
                </div>

                <button
                  id="btn-admin-add-office"
                  type="button"
                  onClick={handleAddNewOffice}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kantor / Cabang</span>
                </button>
              </div>

              {/* Quick Preset Guide */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  💡 Tips Koordinat & Preset Kota Cepat:
                </span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                  Anda dapat menyalin Latitude dan Longitude langsung dari Google Maps (klik kanan di peta lalu pilih koordinat), atau klik tombol preset kota di bawah kartu untuk mengisi otomatis.
                </p>
              </div>

              {/* Office Cards List */}
              <div className="space-y-4">
                {(draftData.offices || []).map((office, index) => {
                  const isEditing = editingOfficeId === office.id || editingOfficeId === null;

                  return (
                    <div
                      key={office.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={office.name}
                            onChange={(e) => handleOfficeChange(office.id, 'name', e.target.value)}
                            placeholder="Nama Kantor (e.g. Kantor Cabang Gresik)"
                            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={office.type}
                            onChange={(e) =>
                              handleOfficeChange(office.id, 'type', e.target.value as 'PUSAT' | 'CABANG')
                            }
                            className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="PUSAT">Kantor Pusat</option>
                            <option value="CABANG">Kantor Cabang</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteOffice(office.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Hapus Kantor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* City Preset Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Preset Koordinat:</span>
                        {CITY_PRESETS.slice(0, 6).map((preset) => (
                          <button
                            key={preset.city}
                            type="button"
                            onClick={() => {
                              handleOfficeChange(office.id, 'cityName', preset.city);
                              handleOfficeChange(office.id, 'latitude', preset.lat);
                              handleOfficeChange(office.id, 'longitude', preset.lng);
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors"
                          >
                            {preset.city.split(',')[0]}
                          </button>
                        ))}
                      </div>

                      {/* Fields Form */}
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
                            No. WhatsApp Khusus Cabang:
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
                            Catatan / Layanan Cabang:
                          </label>
                          <input
                            type="text"
                            value={office.notes || ''}
                            onChange={(e) => handleOfficeChange(office.id, 'notes', e.target.value)}
                            placeholder="Konsultasi & Layanan Aktivasi"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Live Mini Preview Iframe */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-blue-500" />
                            Preview Titik Peta Google Maps
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${office.latitude},${office.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka di Google Maps</span>
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
                  );
                })}
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
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Pesanan & Lead Konsultasi Masuk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar calon klien yang mengisi formulir pemesanan dan tersinkron secara real-time.
                </p>
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
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-white font-bold text-sm">
                            {order.customerName}
                          </strong>
                          {order.businessName && (
                            <span className="text-slate-500 dark:text-slate-400">
                              ({order.businessName})
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : order.status === 'CONTACTED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {order.status}
                          </span>
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
