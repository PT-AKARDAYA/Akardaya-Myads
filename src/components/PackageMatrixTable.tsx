import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPackage } from '../types';
import {
  Check,
  Table as TableIcon,
  Search,
  Sparkles,
  Info,
  Layers,
  Send,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Globe,
  Palette,
  UserCheck,
} from 'lucide-react';

interface MatrixRow {
  facility: string;
  feature: string;
  one_1: boolean | string;
  one_2: boolean | string;
  one_3: boolean | string;
  man_1: boolean | string;
  man_2: boolean | string;
  man_3: boolean | string;
  umkm: boolean | string;
  corp: boolean | string;
  customText?: Record<string, string>;
}

export const PackageMatrixTable: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const { packages = [], channelRates = [], discountConfig } = data;
  const [searchFilter, setSearchFilter] = useState('');
  const [mobileMode, setMobileMode] = useState<'card' | 'table'>('card');
  const [selectedMobileTier, setSelectedMobileTier] = useState<string>('one_3');

  // Helper to map tier keys to actual SubscriptionPackage from database
  const getPackageForTier = (key: string): SubscriptionPackage | undefined => {
    const pkgs = packages || [];
    switch (key) {
      case 'one_1':
        return (
          pkgs.find(
            (p) =>
              p.category === 'ONE_KLIK' &&
              (p.tierName?.includes('<200') ||
                p.id.includes('tier1') ||
                p.priceDisplay?.includes('<') ||
                p.maxBudget === 200000)
          ) || pkgs.filter((p) => p.category === 'ONE_KLIK')[0]
        );
      case 'one_2':
        return (
          pkgs.find(
            (p) =>
              p.category === 'ONE_KLIK' &&
              (p.tierName?.includes('200') ||
                p.id.includes('tier2') ||
                p.priceDisplay?.includes('200') ||
                (p.minBudget === 200000 && p.maxBudget && p.maxBudget < 500000))
          ) || pkgs.filter((p) => p.category === 'ONE_KLIK')[1]
        );
      case 'one_3':
        return (
          pkgs.find(
            (p) =>
              p.category === 'ONE_KLIK' &&
              (p.tierName?.includes('500') ||
                p.id.includes('tier3') ||
                p.priceDisplay?.includes('500') ||
                p.minBudget >= 500000)
          ) || pkgs.filter((p) => p.category === 'ONE_KLIK')[2]
        );
      case 'man_1':
        return (
          pkgs.find(
            (p) =>
              p.category === 'MANDIRI' &&
              (p.tierName?.includes('<200') ||
                p.id.includes('tier1') ||
                p.priceDisplay?.includes('<') ||
                p.maxBudget === 200000)
          ) || pkgs.filter((p) => p.category === 'MANDIRI')[0]
        );
      case 'man_2':
        return (
          pkgs.find(
            (p) =>
              p.category === 'MANDIRI' &&
              (p.tierName?.includes('200') ||
                p.id.includes('tier2') ||
                p.priceDisplay?.includes('200') ||
                (p.minBudget === 200000 && p.maxBudget && p.maxBudget < 500000))
          ) || pkgs.filter((p) => p.category === 'MANDIRI')[1]
        );
      case 'man_3':
        return (
          pkgs.find(
            (p) =>
              p.category === 'MANDIRI' &&
              (p.tierName?.includes('500') ||
                p.id.includes('tier3') ||
                p.priceDisplay?.includes('500') ||
                p.minBudget >= 500000)
          ) || pkgs.filter((p) => p.category === 'MANDIRI')[2]
        );
      case 'umkm':
        return (
          pkgs.find(
            (p) =>
              p.category === 'UMKM' ||
              p.id.includes('umkm') ||
              p.name?.toLowerCase().includes('umkm')
          ) || pkgs.find((p) => p.category === 'UMKM')
        );
      case 'corp':
        return (
          pkgs.find(
            (p) =>
              p.category === 'CORPORATE' ||
              p.id.includes('corporate') ||
              p.name?.toLowerCase().includes('corp')
          ) || pkgs.find((p) => p.category === 'CORPORATE')
        );
      default:
        return undefined;
    }
  };

  const mobileTiers = useMemo(() => {
    const pkgOne3 = getPackageForTier('one_3');
    const pkgOne2 = getPackageForTier('one_2');
    const pkgOne1 = getPackageForTier('one_1');
    const pkgMan3 = getPackageForTier('man_3');
    const pkgMan2 = getPackageForTier('man_2');
    const pkgMan1 = getPackageForTier('man_1');
    const pkgUmkm = getPackageForTier('umkm');
    const pkgCorp = getPackageForTier('corp');

    return [
      {
        key: 'one_3',
        name: pkgOne3?.name || 'One Klik (≥500k)',
        label: `One Klik ${pkgOne3?.tierName || '≥500k'}`,
        sub: pkgOne3?.tagline || 'Terpopuler + Free Web',
        isPopular: pkgOne3?.isPopular ?? true,
      },
      {
        key: 'one_2',
        name: pkgOne2?.name || 'One Klik (200-499k)',
        label: `One Klik ${pkgOne2?.tierName || '200-499k'}`,
        sub: pkgOne2?.tagline || 'Terima Jadi',
        isPopular: pkgOne2?.isPopular ?? false,
      },
      {
        key: 'one_1',
        name: pkgOne1?.name || 'One Klik (<200k)',
        label: `One Klik ${pkgOne1?.tierName || '<200k'}`,
        sub: pkgOne1?.tagline || 'Hemat Starter',
        isPopular: pkgOne1?.isPopular ?? false,
      },
      {
        key: 'man_3',
        name: pkgMan3?.name || 'Mandiri (≥500k)',
        label: `Mandiri ${pkgMan3?.tierName || '≥500k'}`,
        sub: pkgMan3?.tagline || 'Kelola Bebas + Free Web',
        isPopular: pkgMan3?.isPopular ?? false,
      },
      {
        key: 'man_2',
        name: pkgMan2?.name || 'Mandiri (200-499k)',
        label: `Mandiri ${pkgMan2?.tierName || '200-499k'}`,
        sub: pkgMan2?.tagline || 'Kelola Mandiri',
        isPopular: pkgMan2?.isPopular ?? false,
      },
      {
        key: 'man_1',
        name: pkgMan1?.name || 'Mandiri (<200k)',
        label: `Mandiri ${pkgMan1?.tierName || '<200k'}`,
        sub: pkgMan1?.tagline || 'Starter Mandiri',
        isPopular: pkgMan1?.isPopular ?? false,
      },
      {
        key: 'umkm',
        name: pkgUmkm?.name || 'Paket UMKM (≥500k)',
        label: `UMKM ${pkgUmkm?.tierName || '≥500k'}`,
        sub: pkgUmkm?.tagline || 'Free Web & Konten',
        isPopular: pkgUmkm?.isPopular ?? true,
      },
      {
        key: 'corp',
        name: pkgCorp?.name || 'Corporate (≥1 Jt)',
        label: `Corporate ${pkgCorp?.tierName || '≥1 Jt'}`,
        sub: pkgCorp?.tagline || 'Fasilitas Prioritas',
        isPopular: pkgCorp?.isPopular ?? false,
      },
    ];
  }, [packages]);

  // Dynamically build rows synchronized with packages & channelRates database
  const rows = useMemo<MatrixRow[]>(() => {
    // 1. Channel rates rows (SMS, MMS, USSD, RCS, WA WABA, etc.)
    const channelRows = channelRates.map((cr) => {
      const isEnabledForPkg = (pkgKey: string) => {
        const pkg = getPackageForTier(pkgKey);
        if (!pkg) return true;
        if (!pkg.enabledRateIds || pkg.enabledRateIds.length === 0) return true;
        return pkg.enabledRateIds.includes(cr.id);
      };

      return {
        facility: cr.facility,
        feature: `${cr.featureName} ${cr.rateDisplay || `@Rp.${cr.ratePerUnit}`}`,
        one_1: isEnabledForPkg('one_1'),
        one_2: isEnabledForPkg('one_2'),
        one_3: isEnabledForPkg('one_3'),
        man_1: isEnabledForPkg('man_1'),
        man_2: isEnabledForPkg('man_2'),
        man_3: isEnabledForPkg('man_3'),
        umkm: isEnabledForPkg('umkm'),
        corp: isEnabledForPkg('corp'),
      };
    });

    // Helpers to retrieve package values from database
    const getContentCount = (pkgKey: string, defaultVal: number) => {
      const pkg = getPackageForTier(pkgKey);
      if (pkg && typeof pkg.freeContentPerMonth === 'number') {
        return `${pkg.freeContentPerMonth}X`;
      }
      return `${defaultVal}X`;
    };

    const hasFreeWebsite = (pkgKey: string, defaultVal: boolean) => {
      const pkg = getPackageForTier(pkgKey);
      if (pkg) {
        return Boolean(
          (pkg.freeWebsiteMonths && pkg.freeWebsiteMonths > 0) || (pkg as any).freeWebsiteBonus
        );
      }
      return defaultVal;
    };

    const getAccountType = (pkgKey: string, defaultVal: string) => {
      const pkg = getPackageForTier(pkgKey);
      if (pkg && pkg.accountType) {
        return pkg.accountType;
      }
      return defaultVal;
    };

    const getSaldoInfo = (pkgKey: string) => {
      const pkg = getPackageForTier(pkgKey);
      if (pkg && pkg.saldoInfo) {
        return pkg.saldoInfo;
      }
      return 'SESUAI PAKET';
    };

    const discountPercent = discountConfig?.reloadDiscountPercent || 50;

    // 2. Special Benefits Rows directly bound to Database
    const specialRows = [
      // GRATIS KONTEN UNTUK FB+INSTAGRAM+TIKTOK (Dynamic from pkg.freeContentPerMonth)
      {
        facility: 'GRATIS KONTEN UNTUK FB+INSTAGRAM+TIKTOK',
        feature: 'FREE PERBULAN',
        customText: {
          one_1: getContentCount('one_1', 1),
          one_2: getContentCount('one_2', 2),
          one_3: getContentCount('one_3', 4),
          man_1: getContentCount('man_1', 1),
          man_2: getContentCount('man_2', 2),
          man_3: getContentCount('man_3', 4),
          umkm: getContentCount('umkm', 4),
          corp: getContentCount('corp', 4),
        },
        one_1: getContentCount('one_1', 1),
        one_2: getContentCount('one_2', 2),
        one_3: getContentCount('one_3', 4),
        man_1: getContentCount('man_1', 1),
        man_2: getContentCount('man_2', 2),
        man_3: getContentCount('man_3', 4),
        umkm: getContentCount('umkm', 4),
        corp: getContentCount('corp', 4),
      },

      // FREE WEBSITE (Dynamic from pkg.freeWebsiteMonths)
      {
        facility: 'FREE WEBSITE',
        feature: '3 BULAN',
        one_1: hasFreeWebsite('one_1', false),
        one_2: hasFreeWebsite('one_2', false),
        one_3: hasFreeWebsite('one_3', true),
        man_1: hasFreeWebsite('man_1', false),
        man_2: hasFreeWebsite('man_2', false),
        man_3: hasFreeWebsite('man_3', true),
        umkm: hasFreeWebsite('umkm', true),
        corp: hasFreeWebsite('corp', true),
      },

      // PEMBUATAN AKUN MY ADS (Dynamic from pkg.accountType)
      {
        facility: 'PEMBUATAN AKUN MY ADS',
        feature: 'GRATIS',
        customText: {
          one_1: getAccountType('one_1', 'Akun AD'),
          one_2: getAccountType('one_2', 'Akun AD'),
          one_3: getAccountType('one_3', 'Akun AD'),
          man_1: getAccountType('man_1', 'Akun AD/Pribadi'),
          man_2: getAccountType('man_2', 'Akun AD/Pribadi'),
          man_3: getAccountType('man_3', 'Akun AD/Pribadi'),
          umkm: getAccountType('umkm', 'Akun AD/Pribadi'),
          corp: getAccountType('corp', 'Akun AD/Pribadi'),
        },
        one_1: getAccountType('one_1', 'Akun AD'),
        one_2: getAccountType('one_2', 'Akun AD'),
        one_3: getAccountType('one_3', 'Akun AD'),
        man_1: getAccountType('man_1', 'Akun AD/Pribadi'),
        man_2: getAccountType('man_2', 'Akun AD/Pribadi'),
        man_3: getAccountType('man_3', 'Akun AD/Pribadi'),
        umkm: getAccountType('umkm', 'Akun AD/Pribadi'),
        corp: getAccountType('corp', 'Akun AD/Pribadi'),
      },

      // SALDO MY ADS (Dynamic from pkg.saldoInfo)
      {
        facility: 'SALDO MY ADS',
        feature: 'NOMINAL',
        customText: {
          one_1: getSaldoInfo('one_1'),
          one_2: getSaldoInfo('one_2'),
          one_3: getSaldoInfo('one_3'),
          man_1: getSaldoInfo('man_1'),
          man_2: getSaldoInfo('man_2'),
          man_3: getSaldoInfo('man_3'),
          umkm: getSaldoInfo('umkm'),
          corp: getSaldoInfo('corp'),
        },
        one_1: getSaldoInfo('one_1'),
        one_2: getSaldoInfo('one_2'),
        one_3: getSaldoInfo('one_3'),
        man_1: getSaldoInfo('man_1'),
        man_2: getSaldoInfo('man_2'),
        man_3: getSaldoInfo('man_3'),
        umkm: getSaldoInfo('umkm'),
        corp: getSaldoInfo('corp'),
      },

      // BONUS SALDO ISI ULANG (Dynamic from discountConfig)
      {
        facility: 'BONUS SALDO ISI ULANG',
        feature: 'PROMO MONETARY',
        customText: {
          one_1: 'TIDAK ADA',
          one_2: 'TIDAK ADA',
          one_3: 'TIDAK ADA',
          man_1: `s/d ${discountPercent}%`,
          man_2: `s/d ${discountPercent}%`,
          man_3: `s/d ${discountPercent}%`,
          umkm: `s/d ${discountPercent}%`,
          corp: `s/d ${discountPercent}%`,
        },
        one_1: 'TIDAK ADA',
        one_2: 'TIDAK ADA',
        one_3: 'TIDAK ADA',
        man_1: `s/d ${discountPercent}%`,
        man_2: `s/d ${discountPercent}%`,
        man_3: `s/d ${discountPercent}%`,
        umkm: `s/d ${discountPercent}%`,
        corp: `s/d ${discountPercent}%`,
      },
    ];

    return [...channelRows, ...specialRows];
  }, [packages, channelRates, discountConfig]);

  const filteredRows = rows.filter((r) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return r.facility.toLowerCase().includes(q) || r.feature.toLowerCase().includes(q);
  });

  return (
    <section id="section-matrix" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <TableIcon className="w-3.5 h-3.5" />
              <span>Matriks Perbandingan Lengkap Sesuai Lampiran</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tabel Fasilitas & Matriks Fitur Paket
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Perbandingan detail fasilitas SMS, MMS, USSD, RCS, WA WABA, gratis konten, website, dan bonus saldo isi ulang s/d {discountConfig.reloadDiscountPercent}%.
            </p>
          </div>

          {/* Quick Search in Matrix */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-matrix"
              type="text"
              placeholder="Cari saluran (misal: SMS, WABA, RCS)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Mobile View Switcher (Visible on mobile screens) */}
        <div className="lg:hidden flex items-center justify-between p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 text-xs font-semibold">
          <button
            onClick={() => setMobileMode('card')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileMode === 'card'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mode HP (Cek Fitur)</span>
          </button>
          <button
            onClick={() => setMobileMode('table')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileMode === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Lengkap (Geser)</span>
          </button>
        </div>

        {/* MOBILE MODE 1: INTERACTIVE CARD VIEW */}
        {mobileMode === 'card' && (
          <div className="lg:hidden space-y-4 mb-6">
            {/* Horizontal Scrolling Tier Selector Chips */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-blue-500" />
                Pilih Paket untuk Cek Detail Fasilitas:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4">
                {mobileTiers.map((tier) => {
                  const isSelected = selectedMobileTier === tier.key;
                  return (
                    <button
                      key={tier.key}
                      onClick={() => setSelectedMobileTier(tier.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tier.isPopular && <Sparkles className="w-3 h-3 text-amber-300" />}
                      <span>{tier.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Mobile Specs Card for Selected Tier */}
            {(() => {
              const currentTierObj = mobileTiers.find((t) => t.key === selectedMobileTier) || mobileTiers[0];
              const tierKey = selectedMobileTier as keyof typeof rows[0];

              return (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 sm:p-5 shadow-sm space-y-4">
                  {/* Header of the Selected Tier Card */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Matriks Fasilitas
                        </span>
                        {currentTierObj.isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                            Paling Diminati
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                        {currentTierObj.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{currentTierObj.sub}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                        Bonus Saldo {discountConfig.reloadDiscountPercent}%
                      </span>
                    </div>
                  </div>

                  {/* List of Features for this Tier */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Daftar Saluran & Fasilitas:
                    </div>

                    <div className="space-y-1.5">
                      {filteredRows.map((row, rIdx) => {
                        const val = row[tierKey];
                        const isIncluded = val === true;
                        const isCustomText = typeof val === 'string' && val !== '-';
                        const isExcluded = val === false || val === '-';

                        return (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
                                {row.facility}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                                {row.feature}
                              </span>
                            </div>

                            <div className="shrink-0">
                              {isIncluded && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                                  <span>Tersedia</span>
                                </span>
                              )}

                              {isCustomText && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold border border-blue-200 dark:border-blue-800">
                                  {val.includes('FREE') ? <Globe className="w-3 h-3 text-emerald-500" /> : null}
                                  {val.includes('KONTEN') ? <Palette className="w-3 h-3 text-blue-500" /> : null}
                                  {val.includes('AKUN') ? <UserCheck className="w-3 h-3 text-indigo-500" /> : null}
                                  <span>{val}</span>
                                </span>
                              )}

                              {isExcluded && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-slate-400 text-[11px] font-semibold">
                                  <span>-</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Order Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => openOrderModalForPackage(null)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98] min-h-[44px]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Pesan / Konsultasi {currentTierObj.name}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Scroll Helper Notice on Mobile (Shown only when in full table mode) */}
        <div className={`lg:hidden flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs ${mobileMode === 'table' ? 'flex' : 'hidden'}`}>
          <span className="flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5" />
            Geser tabel ke kanan untuk melihat semua kolom paket & diskon
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Scroll ➔</span>
        </div>

        {/* Matrix Table Container - Always visible on desktop, toggleable on mobile */}
        <div className={`relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-md overflow-hidden ${mobileMode === 'table' ? 'block' : 'hidden lg:block'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                {/* Level 1 Header: Main Categories */}
                <tr className="bg-amber-300 dark:bg-amber-400 text-slate-900 font-extrabold text-[11px] uppercase tracking-wider border-b border-amber-400 dark:border-amber-500">
                  <th className="p-3 sticky left-0 z-20 bg-amber-300 dark:bg-amber-400 min-w-[140px]">
                    FASILITAS
                  </th>
                  <th className="p-3 min-w-[180px]">FITUR / TARIF</th>
                  <th colSpan={3} className="p-3 text-center border-l border-amber-400/60 bg-amber-400/50">
                    PAKET ONE KLIK TERIMA JADI
                  </th>
                  <th colSpan={3} className="p-3 text-center border-l border-amber-400/60 bg-amber-300">
                    PAKET MANDIRI
                  </th>
                  <th className="p-3 text-center border-l border-amber-400/60 bg-amber-400/60">
                    PAKET UMKM
                  </th>
                  <th className="p-3 text-center border-l border-amber-400/60 bg-amber-400/80">
                    PAKET CORPORATE
                  </th>
                  <th className="p-3 text-center border-l border-amber-400/60 bg-amber-300 min-w-[160px]">
                    PAKET DISKON ISI ULANG
                  </th>
                </tr>

                {/* Level 2 Header: Budget Tiers */}
                <tr className="bg-amber-200/90 dark:bg-amber-500/30 text-slate-800 dark:text-amber-100 font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 sticky left-0 z-20 bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-white">
                    Kategori Saluran
                  </th>
                  <th className="p-2.5">Rate Satuan</th>
                  
                  {/* One Klik Tiers */}
                  <th className="p-2 text-center border-l border-amber-300/40">&lt;200.000</th>
                  <th className="p-2 text-center">200.000 - 499.999</th>
                  <th className="p-2 text-center">≥ 500.000</th>

                  {/* Mandiri Tiers */}
                  <th className="p-2 text-center border-l border-amber-300/40">&lt;200.000</th>
                  <th className="p-2 text-center">200.000 - 499.999</th>
                  <th className="p-2 text-center">≥ 500.000</th>

                  {/* UMKM & Corporate */}
                  <th className="p-2 text-center border-l border-amber-300/40">≥ 500.000</th>
                  <th className="p-2 text-center border-l border-amber-300/40">≥ 1.000.000</th>

                  {/* Bonus Saldo Isi Ulang Column */}
                  <th className="p-2 text-center border-l border-amber-300/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                    Bonus Saldo ({discountConfig.reloadDiscountPercent}%)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRows.map((row, idx) => {
                  const isSpecialRow =
                    row.facility.includes('GRATIS KONTEN') ||
                    row.facility.includes('FREE WEBSITE') ||
                    row.facility.includes('PEMBUATAN AKUN') ||
                    row.facility.includes('SALDO MY ADS') ||
                    row.facility.includes('BONUS SALDO');

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors ${
                        isSpecialRow
                          ? 'bg-slate-50/80 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-white'
                          : ''
                      }`}
                    >
                      {/* Facility */}
                      <td className="p-2.5 font-bold sticky left-0 z-10 bg-white dark:bg-slate-850 border-r border-slate-100 dark:border-slate-800">
                        {row.facility}
                      </td>

                      {/* Feature Name & Rate */}
                      <td className="p-2.5 font-medium text-slate-600 dark:text-slate-300">
                        {row.feature}
                      </td>

                      {/* Helper to render either custom text, checkmark, or dash */}
                      {['one_1', 'one_2', 'one_3', 'man_1', 'man_2', 'man_3', 'umkm', 'corp'].map(
                        (colKey, colIdx) => {
                          const borderLeft =
                            colIdx === 0 || colIdx === 3 || colIdx === 6 || colIdx === 7
                              ? 'border-l border-slate-100 dark:border-slate-800'
                              : '';

                          if (row.customText) {
                            const val = (row.customText as any)[colKey];
                            const isNoBonus = val === 'TIDAK ADA';
                            const isBonus = val && val.includes('%');
                            return (
                              <td
                                key={colKey}
                                className={`p-2 text-center font-bold text-[11px] ${borderLeft} ${
                                  val && val.includes('4X') || isBonus
                                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                    : isNoBonus
                                    ? 'text-slate-400 dark:text-slate-500 font-medium'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <span className="inline-flex items-center justify-center gap-1">
                                  {val}
                                  {row.facility.includes('GRATIS KONTEN') && (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </span>
                              </td>
                            );
                          }

                          const isChecked = (row as any)[colKey];
                          return (
                            <td key={colKey} className={`p-2 text-center ${borderLeft}`}>
                              {isChecked ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                              )}
                            </td>
                          );
                        }
                      )}

                      {/* Column 9: Paket Diskon Isi Ulang Notice */}
                      {idx === 0 ? (
                        <td
                          rowSpan={rows.length}
                          className="p-4 text-center border-l border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 align-middle"
                        >
                          <div className="space-y-3 max-w-[140px] mx-auto">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm shadow-md">
                              {discountConfig.reloadDiscountPercent}%
                            </span>
                            <div>
                              <p className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                                Bonus Saldo
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Bonus monetary s/d 50% atau sesuai setting di Dashboard Admin.
                              </p>
                            </div>
                            <button
                              id="btn-matrix-order-discount"
                              onClick={() => openOrderModalForPackage(null)}
                              className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Pesan Sekarang</span>
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
