import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPackage, PackageCategory } from '../types';
import {
  Check,
  Sparkles,
  Layers,
  Globe,
  Palette,
  UserCheck,
  Coins,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const PackageCards: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Semua Paket' },
    { id: 'ONE_KLIK', label: 'One Klik (Terima Jadi)' },
    { id: 'MANDIRI', label: 'Paket Mandiri' },
    { id: 'UMKM', label: 'Paket UMKM' },
    { id: 'CORPORATE', label: 'Paket Corporate' },
  ];

  const filteredPackages = data.packages.filter((pkg) => {
    if (selectedCategory === 'ALL') return true;
    return pkg.category === selectedCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="section-packages" className="py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3.5 h-3.5" />
            <span>Pilihan Paket Langganan Iklan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pilih Paket Sesuai Target & Skala Bisnis Anda
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Mulai dari paket terima jadi siap pesan, kelola mandiri, paket khusus UMKM, hingga skala korporasi besar.
          </p>

          {/* Category Filter Tabs - Mobile Friendly Scrollable */}
          <div className="pt-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`btn-filter-category-${cat.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => {
            const isExpanded = expandedCardId === pkg.id;
            const isHighlighted = pkg.isPopular || pkg.freeWebsiteMonths > 0;

            return (
              <div
                key={pkg.id}
                id={`package-card-${pkg.id}`}
                className={`relative flex flex-col rounded-2xl transition-all duration-200 border ${
                  pkg.isPopular
                    ? 'bg-white dark:bg-slate-850 border-blue-500/80 dark:border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3 left-4 right-4 flex justify-start">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide shadow-xs ${
                        pkg.isPopular
                          ? 'bg-blue-600 text-white'
                          : pkg.freeWebsiteMonths > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Category Title & Tier */}
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    {pkg.categoryTitle}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                    {pkg.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                      Nominal / Budget Paket
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {pkg.priceDisplay}
                      </span>
                    </div>
                  </div>

                  {/* High-Value Included Special Perks */}
                  <div className="py-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                    {/* Free Content */}
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                      <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-blue-900 dark:text-blue-200">
                          Gratis {pkg.freeContentPerMonth}x Konten Promosi
                        </span>
                        <p className="text-[10px] text-blue-700 dark:text-blue-300">FB + Instagram + TikTok</p>
                      </div>
                    </div>

                    {/* Free Website */}
                    <div
                      className={`flex items-center gap-2.5 p-2 rounded-lg border ${
                        pkg.freeWebsiteMonths > 0
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Globe
                        className={`w-4 h-4 shrink-0 ${
                          pkg.freeWebsiteMonths > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      />
                      <div>
                        <span className="font-semibold">
                          {pkg.freeWebsiteMonths > 0
                            ? `FREE Website Usaha (${pkg.freeWebsiteMonths} Bulan)`
                            : 'Free Website (Khusus tier >501k)'}
                        </span>
                        {pkg.freeWebsiteMonths > 0 && (
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                            Landing page katalog online siap pesan
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Account Type & Saldo */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate" title={`Pembuatan: ${pkg.accountType}`}>
                          {pkg.accountType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate" title="Saldo My Ads Penuh">
                          Saldo 100%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Highlights Checklist */}
                  <div className="pt-2 pb-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Fasilitas Saluran:
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>SMS Broadcast (@100), Targeted (@180), LBA (@200)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>SMS Flash (@250-350) & MMS Gambar (@250-330)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Pop-up USSD (@100-175) & Pop-up Interaktif (@200)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>RCS Multimedia (@350-450) & WA WABA (@605-1100)</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details for Deep Specification */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-in fade-in">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">Deskripsi Lengkap:</p>
                      <p className="text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        {pkg.description}
                      </p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <p>• Diskon top-up saldo berlaku otomatis ({data.discountConfig.reloadDiscountPercent}%)</p>
                        <p>• Pelaporan impresi/delivery rate transparan</p>
                        <p>• Pendampingan setup target audiens</p>
                      </div>
                    </div>
                  )}

                  {/* Expand Toggle Button */}
                  <button
                    onClick={() => toggleExpand(pkg.id)}
                    className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 py-1"
                  >
                    <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail & Deskripsi'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {/* Action CTA Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id={`btn-order-package-${pkg.id}`}
                      onClick={() => openOrderModalForPackage(pkg)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        pkg.isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Pilih {pkg.name.split(' ')[0]} Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
