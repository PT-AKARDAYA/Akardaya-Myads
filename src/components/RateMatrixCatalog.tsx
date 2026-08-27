import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Zap,
  Image,
  Smartphone,
  Sparkles,
  Send,
  MessageCircle,
  FileText,
  MapPin,
  Users,
  Radio,
  HelpCircle,
} from 'lucide-react';

export const RateMatrixCatalog: React.FC = () => {
  const { data } = useApp();
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');

  const facilityTabs = [
    { id: 'ALL', label: 'Semua Saluran' },
    { id: 'SMS', label: 'SMS Reguler' },
    { id: 'SMS FLASH', label: 'SMS Flash' },
    { id: 'MMS', label: 'MMS Gambar' },
    { id: 'POPUP USSD', label: 'Pop-Up USSD' },
    { id: 'POPUP INTERAKTIF', label: 'Pop-Up Interaktif' },
    { id: 'RCS', label: 'RCS Modern' },
    { id: 'WA BUSINESS WABA', label: 'WhatsApp WABA' },
    { id: 'WA BUSINESS UTILITY WABA', label: 'WA Utility' },
  ];

  const filteredRates = data.channelRates.filter((rate) => {
    if (selectedFacility === 'ALL') return true;
    return rate.facility === selectedFacility;
  });

  const getIconForFacility = (facility: string) => {
    switch (facility) {
      case 'SMS':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'SMS FLASH':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'MMS':
        return <Image className="w-5 h-5 text-indigo-500" />;
      case 'POPUP USSD':
      case 'POPUP INTERAKTIF':
        return <Smartphone className="w-5 h-5 text-purple-500" />;
      case 'RCS':
        return <Sparkles className="w-5 h-5 text-rose-500" />;
      case 'WA BUSINESS WABA':
      case 'WA BUSINESS UTILITY WABA':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Radio className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeForFeature = (feature: string) => {
    switch (feature) {
      case 'BROADCAST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <Radio className="w-2.5 h-2.5" /> Broadcast Massal
          </span>
        );
      case 'TARGETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Users className="w-2.5 h-2.5" /> Demografi Tertarget
          </span>
        );
      case 'LBA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <MapPin className="w-2.5 h-2.5" /> Radius Lokasi (LBA)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="section-rates" className="py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Tarif Resmi MyAds</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparansi Tarif Satuan Semua Saluran Promosi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Pilih jenis pesan yang paling tepat untuk strategi bisnis Anda — Broadcast Massal, Profil Tertarget, atau Radius Lokasi Toko (LBA).
          </p>

          {/* Filter Tabs */}
          <div className="pt-3 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {facilityTabs.map((tab) => (
              <button
                key={tab.id}
                id={`btn-tab-rate-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedFacility(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedFacility === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRates.map((rate) => (
            <div
              key={rate.id}
              id={`rate-card-${rate.id}`}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getIconForFacility(rate.facility)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        {rate.facility}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rate.featureName}
                      </h4>
                    </div>
                  </div>
                  {getBadgeForFeature(rate.featureName)}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 min-h-[36px] line-clamp-2">
                  {rate.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Tarif Satuan
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    Rp {rate.ratePerUnit.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {rate.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strategy Explainer Guide (Mobile & Desktop) */}
        <div className="mt-8 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span>Panduan Memilih Tipe Pengiriman Iklan:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <strong className="text-blue-900 dark:text-blue-200 block text-xs mb-1">
                1. BROADCAST (Massal)
              </strong>
              Kirim informasi serentak ke ribuan hingga ratusan ribu nomor. Paling hemat biaya untuk promosi akbar, peluncuran produk, dan diskon besar.
            </div>
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
              <strong className="text-purple-900 dark:text-purple-200 block text-xs mb-1">
                2. TARGETED (Profil Tertarget)
              </strong>
              Saring calon konsumen berdasar kriteria gender, rentang usia, sistem operasi HP, penggunaan data, hingga ARPU (daya beli).
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <strong className="text-emerald-900 dark:text-emerald-200 block text-xs mb-1">
                3. LBA (Location Based Advertising)
              </strong>
              Iklan otomatis terkirim saat calon pembeli secara real-time memasuki radius 500m - 5km dari outlet/toko fisik Anda.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
