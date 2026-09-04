import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  Table as TableIcon,
  Search,
  Sparkles,
  Info,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';

export const PackageMatrixTable: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const { discountConfig } = data;
  const [searchFilter, setSearchFilter] = useState('');

  const rows = [
    // SMS
    {
      facility: 'SMS',
      feature: 'BROADCAST @Rp.100',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'SMS',
      feature: 'TARGETED @Rp.180',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'SMS',
      feature: 'LBA @Rp.200',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // SMS FLASH
    {
      facility: 'SMS FLASH',
      feature: 'BROADCAST @Rp.250',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'SMS FLASH',
      feature: 'TARGETED @Rp.350',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'SMS FLASH',
      feature: 'LBA @Rp.350',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // MMS
    {
      facility: 'MMS',
      feature: 'BROADCAST @Rp.250',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'MMS',
      feature: 'TARGETED @Rp.330',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'MMS',
      feature: 'LBA @Rp.330',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // POPUP USSD
    {
      facility: 'POPUP USSD',
      feature: 'BROADCAST @Rp.100',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'POPUP USSD',
      feature: 'TARGETED @Rp.175',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'POPUP USSD',
      feature: 'LBA @Rp.175',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // POPUP INTERAKTIF
    {
      facility: 'POPUP INTERAKTIF',
      feature: 'BROADCAST @Rp.200',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // RCS
    {
      facility: 'RCS',
      feature: 'BROADCAST @Rp.350',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'RCS',
      feature: 'TARGETED @Rp.350',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'RCS',
      feature: 'LBA @Rp.450',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // WA BUSINESS WABA
    {
      facility: 'WA BUSINESS WABA',
      feature: 'BROADCAST @Rp.605',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'WA BUSINESS WABA',
      feature: 'TARGETED @Rp.1100',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },
    {
      facility: 'WA BUSINESS WABA',
      feature: 'LBA @Rp.1100',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // WA BUSINESS UTILITY WABA
    {
      facility: 'WA BUSINESS UTILITY WABA',
      feature: 'BROADCAST @Rp.354',
      one_1: true,
      one_2: true,
      one_3: true,
      man_1: true,
      man_2: true,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // GRATIS KONTEN
    {
      facility: 'GRATIS KONTEN UNTUK FB+INSTAGRAM+TIKTOK',
      feature: 'FREE PERBULAN',
      customText: {
        one_1: '1X',
        one_2: '2X',
        one_3: '4X',
        man_1: '1X',
        man_2: '2X',
        man_3: '4X',
        umkm: '4X',
        corp: '4X',
      },
    },

    // FREE WEBSITE
    {
      facility: 'FREE WEBSITE',
      feature: '3 BULAN',
      one_1: false,
      one_2: false,
      one_3: true,
      man_1: false,
      man_2: false,
      man_3: true,
      umkm: true,
      corp: true,
    },

    // PEMBUATAN AKUN MY ADS
    {
      facility: 'PEMBUATAN AKUN MY ADS',
      feature: 'GRATIS',
      customText: {
        one_1: 'Akun AD',
        one_2: 'Akun AD',
        one_3: 'Akun AD',
        man_1: 'Akun AD/Pribadi',
        man_2: 'Akun AD/Pribadi',
        man_3: 'Akun AD/Pribadi',
        umkm: 'Akun AD/Pribadi',
        corp: 'Akun AD/Pribadi',
      },
    },

    // SALDO MY ADS
    {
      facility: 'SALDO MY ADS',
      feature: 'NOMINAL',
      customText: {
        one_1: 'SESUAI PAKET',
        one_2: 'SESUAI PAKET',
        one_3: 'SESUAI PAKET',
        man_1: 'SESUAI PAKET',
        man_2: 'SESUAI PAKET',
        man_3: 'SESUAI PAKET',
        umkm: 'SESUAI PAKET',
        corp: 'SESUAI PAKET',
      },
    },
  ];

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

        {/* Scroll Helper Notice on Mobile */}
        <div className="lg:hidden flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5" />
            Geser tabel ke kanan untuk melihat semua kolom paket & diskon
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Scroll ➔</span>
        </div>

        {/* Matrix Table Container */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-md overflow-hidden">
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
                  <th className="p-2 text-center">201.000 - 500.000</th>
                  <th className="p-2 text-center">&gt;501.000</th>

                  {/* Mandiri Tiers */}
                  <th className="p-2 text-center border-l border-amber-300/40">&lt;200.000</th>
                  <th className="p-2 text-center">201.000 - 500.000</th>
                  <th className="p-2 text-center">&gt;501.000</th>

                  {/* UMKM & Corporate */}
                  <th className="p-2 text-center border-l border-amber-300/40">&gt;500.000</th>
                  <th className="p-2 text-center border-l border-amber-300/40">&gt;1000.000</th>

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
                    row.facility.includes('SALDO MY ADS');

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
                            return (
                              <td
                                key={colKey}
                                className={`p-2 text-center font-bold text-[11px] ${borderLeft} ${
                                  val && val.includes('4X')
                                    ? 'text-emerald-600 dark:text-emerald-400'
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
