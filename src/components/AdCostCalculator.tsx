import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const AdCostCalculator: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const { channelRates, discountConfig, companyConfig } = data;

  const [selectedRateId, setSelectedRateId] = useState<string>(channelRates[0]?.id || 'sms_broadcast');
  const [calcMode, setCalcMode] = useState<'BUDGET' | 'REACH'>('BUDGET');
  const [budgetInput, setBudgetInput] = useState<number>(500000);
  const [reachInput, setReachInput] = useState<number>(3000);

  const currentRate = channelRates.find((r) => r.id === selectedRateId) || channelRates[0];

  // Calculation calculations
  const unitPrice = currentRate ? currentRate.ratePerUnit : 100;
  const discountPercent = discountConfig.reloadDiscountPercent || 3;

  let estimatedReach = 0;
  let estimatedBudget = 0;
  let savingsAmount = 0;
  let finalNetCost = 0;

  if (calcMode === 'BUDGET') {
    estimatedBudget = Math.max(50000, Number(budgetInput) || 0);
    estimatedReach = Math.floor(estimatedBudget / unitPrice);
    savingsAmount = Math.round((estimatedBudget * discountPercent) / 100);
    finalNetCost = estimatedBudget - savingsAmount;
  } else {
    estimatedReach = Math.max(100, Number(reachInput) || 0);
    estimatedBudget = estimatedReach * unitPrice;
    savingsAmount = Math.round((estimatedBudget * discountPercent) / 100);
    finalNetCost = estimatedBudget - savingsAmount;
  }

  // Recommended package matching
  const recommendedPackage = data.packages.find((pkg) => {
    if (finalNetCost <= 200000) return pkg.id === 'one_klik_tier1';
    if (finalNetCost <= 500000) return pkg.id === 'one_klik_tier2';
    if (finalNetCost <= 1000000) return pkg.id === 'paket_umkm';
    return pkg.id === 'paket_corporate';
  }) || data.packages[0];

  // Share calculation to WhatsApp
  const shareToWhatsApp = () => {
    const text = `Halo ${companyConfig.brandName}, saya melakukan simulasi iklan di website:\n\n` +
      `📌 *Saluran:* ${currentRate.facility} - ${currentRate.featureName} (${currentRate.rateDisplay})\n` +
      `👥 *Estimasi Jangkauan:* ${estimatedReach.toLocaleString('id-ID')} penerima\n` +
      `💰 *Total Anggaran:* Rp ${estimatedBudget.toLocaleString('id-ID')}\n` +
      `🎁 *Diskon Top-up (${discountPercent}%):* Hemat Rp ${savingsAmount.toLocaleString('id-ID')}\n` +
      `✨ *Total Bayar Bersih:* Rp ${finalNetCost.toLocaleString('id-ID')}\n\n` +
      `Saya tertarik berkonsultasi lebih lanjut untuk paket ini. Mohon informasinya.`;

    window.open(`https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="section-calculator" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulasi Cerdas Biaya & Jangkauan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kalkulator Anggaran Iklan & Diskon Isi Ulang
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Hitung estimasi jumlah calon pembeli yang dapat dijangkau dan dapatkan otomatis potongan diskon isi ulang {discountPercent}%.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-md space-y-5">
            {/* Choose Channel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Pilih Saluran & Tipe Iklan
              </label>
              <select
                id="select-calculator-channel"
                value={selectedRateId}
                onChange={(e) => setSelectedRateId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {channelRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.facility} - {rate.featureName} ({rate.rateDisplay} {rate.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher: By Budget vs By Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Metode Perhitungan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode('BUDGET')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    calcMode === 'BUDGET'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Berdasarkan Budget (Rp)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('REACH')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    calcMode === 'REACH'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Berdasarkan Target Nomor
                </button>
              </div>
            </div>

            {/* Input Slider & Numeric Field */}
            {calcMode === 'BUDGET' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Masukkan Anggaran Iklan:</span>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    Rp {budgetInput.toLocaleString('id-ID')}
                  </span>
                </div>
                <input
                  id="range-budget-input"
                  type="range"
                  min="150000"
                  max="5000000"
                  step="50000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rp 150.000</span>
                  <span>Rp 2.500.000</span>
                  <span>Rp 5.000.000+</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Target Jumlah Penerima:</span>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {reachInput.toLocaleString('id-ID')} nomor/pesan
                  </span>
                </div>
                <input
                  id="range-reach-input"
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={reachInput}
                  onChange={(e) => setReachInput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>500 nomor</span>
                  <span>15.000 nomor</span>
                  <span>30.000+</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Hasil Estimasi Kampanye
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Diskon {discountPercent}% Aktif
              </span>
            </div>

            {/* Estimated Reach Big Output */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                Estimasi Total Jangkauan Target Calon Pembeli
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {estimatedReach.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Penerima / Pesan
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200/80 dark:border-slate-700 py-3">
              <div className="flex justify-between">
                <span>Tarif Satuan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Rp {unitPrice.toLocaleString('id-ID')} {currentRate.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Estimasi Anggaran:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Rp {estimatedBudget.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Hemat Diskon Isi Ulang ({discountPercent}%):</span>
                <span>- Rp {savingsAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1">
                <span>Total Bayar Bersih:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  Rp {finalNetCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Recommended Package Tag */}
            {recommendedPackage && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                    Rekomendasi Paket Langganan:
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {recommendedPackage.name} ({recommendedPackage.priceDisplay})
                  </strong>
                </div>
                <button
                  onClick={() => openOrderModalForPackage(recommendedPackage)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0"
                >
                  Pilih
                </button>
              </div>
            )}

            {/* Share to WhatsApp Button */}
            <button
              id="btn-calculator-share-whatsapp"
              onClick={shareToWhatsApp}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim Hasil Simulasi ke WhatsApp Admin</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
