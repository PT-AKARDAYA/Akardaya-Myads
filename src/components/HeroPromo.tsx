import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Percent,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Globe,
  Radio,
  Layers,
  Award,
} from 'lucide-react';

export const HeroPromo: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const { discountConfig } = data;

  const tiers = discountConfig.monetaryTiers || [];
  const maxTierBonus = tiers.length > 0
    ? Math.max(...tiers.map((t) => Number(t.bonusPercent) || 0))
    : Number(String(discountConfig.reloadDiscountPercent).replace(/\D/g, '')) || 50;

  const rawReloadPercent = discountConfig.reloadDiscountPercent;
  const effectiveBonusPercent = (rawReloadPercent !== undefined && rawReloadPercent !== null && rawReloadPercent !== '')
    ? String(rawReloadPercent).replace(/%/g, '')
    : String(maxTierBonus);

  // Dynamic values that faithfully reflect admin dashboard settings
  const displayTitle = (discountConfig.promoTitle || `Promo Bonus Saldo Isi Ulang s/d ${effectiveBonusPercent}%`)
    .replace(/diskon saldo/gi, 'Bonus Saldo')
    .replace(/1%\s*-\s*50%/gi, `s/d ${effectiveBonusPercent}%`);

  const displayBadge = (discountConfig.promoBadge || 'Spesial Bonus Saldo')
    .replace(/diskon/gi, 'Bonus');

  const displayDescription = (
    discountConfig.promoDescription ||
    `Dapatkan bonus saldo monetary langsung hingga ${effectiveBonusPercent}% setiap top-up saldo My Ads untuk semua channel promosi!`
  )
    .replace(/\s*\(atau sesuai setting admin\)/gi, '')
    .replace(/potongan langsung/gi, 'bonus saldo monetary langsung');

  // Real countdown timer calculation based on promoCountdownEnd from database
  const calculateTimeLeft = () => {
    if (!discountConfig.promoCountdownEnd) {
      return { hours: 48, minutes: 29, seconds: 19 };
    }
    const diff = new Date(discountConfig.promoCountdownEnd).getTime() - Date.now();
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours: totalHours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [discountConfig.promoCountdownEnd]);

  const scrollToPackages = () => {
    const el = document.getElementById('section-packages');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('section-calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero-promotion-section" className="relative pt-4 sm:pt-6 pb-10 sm:pb-16 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Portal Iklan Telco & WhatsApp Broadcast Resmi</span>
            </div>

            {/* Main Headline - Mobile Optimized Sizing */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.25]">
              Tingkatkan Penjualan dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Paket Iklan Digital & Broadcast
              </span>{' '}
              Terlengkap
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Jangkau jutaan calon pembeli di sekitar lokasi Anda melalui SMS LBA, MMS, USSD, RCS, dan WhatsApp Bisnis Resmi (WABA). Mulai dari{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">Rp 100/pesan</strong> dengan bonus konten & website siap pakai!
            </p>

            {/* Key Value Points Badges - Mobile Optimized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-left font-medium text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">WA Centang Hijau WABA</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <Radio className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Radius Lokasi Presisi (LBA)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">Free Website Usaha 3 Bulan</span>
              </div>
            </div>

            {/* CTA Buttons - High Touch Target */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-1">
              <button
                id="btn-hero-explore-packages"
                onClick={scrollToPackages}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Layers className="w-4 h-4" />
                <span>Pilih Paket Langganan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-simulate-cost"
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Simulasi Biaya & Bonus Saldo</span>
              </button>
            </div>

            {/* Quick Jump Pills for Mobile Users */}
            <div className="lg:hidden flex items-center justify-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs font-semibold">
              <button
                onClick={() => {
                  const el = document.getElementById('section-inventory-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 whitespace-nowrap active:scale-95"
              >
                📱 12 Mockup HP
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('section-matrix');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 whitespace-nowrap active:scale-95"
              >
                📋 Matriks Fitur
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('section-office-maps');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 whitespace-nowrap active:scale-95"
              >
                📍 Lokasi Cabang
              </button>
            </div>
          </div>

          {/* Right Column: Special Reload Bonus Card & Promo Box */}
          <div className="lg:col-span-5">
            <div
              id="promo-discount-card"
              className="relative p-5 sm:p-7 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 dark:from-slate-800/95 dark:via-slate-850 dark:to-slate-900 shadow-xl overflow-hidden"
            >
              {/* Top Pill / Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {displayBadge}
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                  <span>
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Promo Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {displayTitle}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {displayDescription}
              </p>

              {/* Special Big Bonus Number Metric */}
              <div className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bonus Isi Ulang Saldo
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {effectiveBonusPercent}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      BONUS Setiap Top Up
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Percent className="w-6 h-6" />
                </div>
              </div>

              {/* Skema Tier dari Database Admin Dashboard */}
              {tiers.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Skema Bonus Saldo (Sesuai Setting Admin):</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Top-Up Otomatis</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {tiers.map((t) => (
                      <div
                        key={t.id}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-850 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
                      >
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate" title={t.label}>
                          {t.label}
                        </div>
                        <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          +{t.bonusPercent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Package Fast Selector */}
              <div className="mt-5 space-y-2">
                <button
                  id="btn-promo-claim-whatsapp"
                  onClick={() => openOrderModalForPackage(null)}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Klaim Bonus & Konsultasi Sekarang</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  *Bonus saldo isi ulang dan bonus website otomatis aktif di akun MyAds Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
