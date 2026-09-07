import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPackage } from '../types';
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
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const PackageCards: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'swipe' | 'list' | 'grid'>('swipe');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'ALL', label: 'Semua Paket' },
    { id: 'ONE_KLIK', label: 'One Klik' },
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

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlideIndex(Math.min(index, filteredPackages.length - 1));
    }
  };

  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const targetEl = carouselRef.current.children[index] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveSlideIndex(index);
    }
  };

  return (
    <section id="section-packages" className="py-10 sm:py-16 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3.5 h-3.5" />
            <span>Pilihan Paket Langganan Iklan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Pilih Paket Sesuai Target & Skala Bisnis Anda
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">
            Mulai dari paket terima jadi siap pesan, kelola mandiri, paket khusus UMKM, hingga skala korporasi besar.
          </p>

          {/* Category Filter Tabs - Mobile Friendly Smooth Scroll */}
          <div className="pt-2 sm:pt-4 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {categories.map((cat) => {
              const count = cat.id === 'ALL' ? data.packages.length : data.packages.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  id={`btn-filter-category-${cat.id.toLowerCase()}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveSlideIndex(0);
                    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile View Mode Switcher (Visible on small screens) */}
          <div className="md:hidden pt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 mt-3 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
              Mode Tampilan HP:
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
              <button
                onClick={() => setMobileViewMode('swipe')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  mobileViewMode === 'swipe'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Geser (Swipe)</span>
              </button>
              <button
                onClick={() => setMobileViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  mobileViewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Daftar</span>
              </button>
              <button
                onClick={() => setMobileViewMode('grid')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  mobileViewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Kartu</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE MODE 1: COMPACT LIST VIEW */}
        {/* ========================================================================= */}
        {mobileViewMode === 'list' && (
          <div className="md:hidden space-y-3">
            {filteredPackages.map((pkg) => (
              <div
                key={`list-${pkg.id}`}
                id={`package-list-${pkg.id}`}
                className={`p-4 rounded-2xl border transition-all ${
                  pkg.isPopular
                    ? 'bg-white dark:bg-slate-850 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {pkg.categoryTitle}
                      </span>
                      {pkg.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug mt-0.5">
                      {pkg.name}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-slate-900 dark:text-white block leading-tight">
                      {pkg.priceDisplay}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Nominal Paket</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/60">
                    <Palette className="w-3 h-3 text-blue-500" />
                    Gratis {pkg.freeContentPerMonth}x Konten
                  </span>
                  {pkg.freeWebsiteMonths > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-100 dark:border-emerald-900/60">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      Free Web 3 Bulan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {pkg.accountType}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                    <Coins className="w-3 h-3 text-amber-500" />
                    Bonus Saldo s/d {data.discountConfig.reloadDiscountPercent}%
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleExpand(pkg.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                  >
                    <span>{expandedCardId === pkg.id ? 'Tutup Detail' : 'Lihat Fasilitas'}</span>
                    {expandedCardId === pkg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => openOrderModalForPackage(pkg)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[38px]"
                  >
                    <Send className="w-3 h-3" />
                    <span>Pilih Paket</span>
                  </button>
                </div>

                {expandedCardId === pkg.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 animate-in fade-in">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl">
                      {pkg.description}
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>SMS Broadcast (@100), Targeted (@180), LBA (@200)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>SMS Flash (@250-350), MMS (@250-330)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>USSD (@100-175), RCS & WA WABA (@605-1100)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE MODE 2: SWIPE CAROUSEL (Default on Mobile) */}
        {/* ========================================================================= */}
        {mobileViewMode === 'swipe' && (
          <div className="md:hidden">
            {/* Carousel Swipe Instruction Helper */}
            <div className="flex items-center justify-between px-1 mb-2.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Zap className="w-3 h-3 text-amber-500" />
                Geser kartu ke kanan / kiri ({activeSlideIndex + 1} dari {filteredPackages.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollToSlide(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSlide(Math.min(filteredPackages.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === filteredPackages.length - 1}
                  className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Track with CSS Scroll Snap */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-4 no-scrollbar -mx-4 px-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filteredPackages.map((pkg, idx) => {
                const isExpanded = expandedCardId === pkg.id;
                return (
                  <div
                    key={`carousel-${pkg.id}`}
                    className="w-[84vw] max-w-[330px] shrink-0 snap-center flex flex-col"
                  >
                    <div
                      className={`relative flex flex-col h-full rounded-2xl transition-all border ${
                        pkg.isPopular
                          ? 'bg-white dark:bg-slate-850 border-blue-500 shadow-xl ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      {/* Top Badge */}
                      {pkg.badge && (
                        <div className="absolute -top-3 left-4 flex justify-start">
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xs ${
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

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">
                          {pkg.categoryTitle}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                          {pkg.tagline}
                        </p>

                        {/* Price Tag */}
                        <div className="mt-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                            Nominal Budget Paket
                          </span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {pkg.priceDisplay}
                          </span>
                        </div>

                        {/* High-Value Special Perks */}
                        <div className="py-3 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div>
                              <span className="font-bold text-blue-900 dark:text-blue-200">
                                Gratis {pkg.freeContentPerMonth}x Konten Promosi
                              </span>
                              <p className="text-[10px] text-blue-700 dark:text-blue-300">FB + Instagram + TikTok</p>
                            </div>
                          </div>

                          <div
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              pkg.freeWebsiteMonths > 0
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
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
                              <span className="font-bold">
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

                          <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px]">
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 truncate">
                              <UserCheck className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="truncate">{pkg.accountType}</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 truncate">
                              <Coins className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">Saldo 100% Utuh</span>
                            </div>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="pt-1 pb-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span>SMS Broadcast (@100), Targeted (@180), LBA (@200)</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span>MMS, Pop-up USSD, RCS & WA WABA (@605-1100)</span>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-in fade-in">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white">Deskripsi Lengkap:</p>
                            <p className="text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                              {pkg.description}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => toggleExpand(pkg.id)}
                          className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 py-1"
                        >
                          <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail & Deskripsi'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {/* CTA */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            id={`btn-order-carousel-${pkg.id}`}
                            onClick={() => openOrderModalForPackage(pkg)}
                            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-[0.98] ${
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
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots for Mobile Carousel */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {filteredPackages.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  onClick={() => scrollToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlideIndex === idx ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DESKTOP & MOBILE GRID VIEW */}
        {/* ========================================================================= */}
        <div className={`${mobileViewMode === 'grid' ? 'grid' : 'hidden md:grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
          {filteredPackages.map((pkg) => {
            const isExpanded = expandedCardId === pkg.id;

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
                        <p>• Bonus top-up saldo berlaku otomatis (s/d {data.discountConfig.reloadDiscountPercent}%)</p>
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
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-[0.98] ${
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
