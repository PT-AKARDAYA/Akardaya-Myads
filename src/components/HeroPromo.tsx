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
  const { discountConfig, companyConfig } = data;

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 48,
    minutes: 30,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToPackages = () => {
    const el = document.getElementById('section-packages');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('section-calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero-promotion-section" className="relative pt-6 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Portal Iklan Telco & WhatsApp Broadcast Resmi</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Tingkatkan Penjualan dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Paket Iklan Digital & Broadcast
              </span>{' '}
              Terlengkap
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Jangkau jutaan pelanggan potensial di sekitar lokasi Anda melalui SMS, SMS Flash, MMS, Pop-up USSD, RCS, dan WhatsApp Bisnis Resmi (WABA). Mulai dari{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">Rp 100/pesan</strong> dengan bonus gratis konten medsos & website!
            </p>

            {/* Key Value Points Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-left font-medium text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WA Centang Hijau WABA</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <Radio className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Radius Lokasi Presisi (LBA)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Free Website 3 Bulan</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                id="btn-hero-explore-packages"
                onClick={scrollToPackages}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Pilih Paket Langganan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-simulate-cost"
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Simulasi Biaya & Diskon</span>
              </button>
            </div>
          </div>

          {/* Right Column: Special Reload Discount Card & Promo Box */}
          <div className="lg:col-span-5">
            <div
              id="promo-discount-card"
              className="relative p-6 sm:p-7 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 dark:from-slate-800/95 dark:via-slate-850 dark:to-slate-900 shadow-xl overflow-hidden"
            >
              {/* Top Pill / Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {discountConfig.promoBadge || 'Spesial Promo Hari Ini'}
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  <span>
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Promo Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {discountConfig.promoTitle}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {discountConfig.promoDescription}
              </p>

              {/* Special Big Discount Number Metric */}
              <div className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Diskon Isi Ulang Saldo
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {discountConfig.reloadDiscountPercent}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      OFF Setiap Top Up
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Percent className="w-6 h-6" />
                </div>
              </div>

              {/* Direct Package Fast Selector */}
              <div className="mt-5 space-y-2">
                <button
                  id="btn-promo-claim-whatsapp"
                  onClick={() => openOrderModalForPackage(null)}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Klaim Diskon & Konsultasi Sekarang</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  *Diskon isi ulang dan bonus website otomatis aktif di akun MyAds Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
