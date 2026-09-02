import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { trackRealVisitor } from '../utils/analyticsTracker';
import {
  Calculator,
  Wallet,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  Share2,
  Coins,
  Sliders,
  Tag,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react';

export const AdCostCalculator: React.FC = () => {
  const { data, openOrderModalForPackage } = useApp();
  const { channelRates, discountConfig, companyConfig } = data;

  // Main Active Calculator Tab: 'CAMPAIGN' (Anggaran Iklan) vs 'TOPUP' (Topup Saldo)
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'TOPUP'>('CAMPAIGN');

  // ==========================================
  // 1. STATE: KALKULASI ANGGARAN IKLAN (MURNI TANPA DISKON)
  // ==========================================
  const [selectedRateId, setSelectedRateId] = useState<string>(channelRates[0]?.id || 'sms_broadcast');
  const [calcMode, setCalcMode] = useState<'BUDGET' | 'REACH'>('BUDGET');
  const [budgetInput, setBudgetInput] = useState<number>(500000);
  const [reachInput, setReachInput] = useState<number>(3000);

  const currentRate = channelRates.find((r) => r.id === selectedRateId) || channelRates[0];
  const unitPrice = currentRate ? currentRate.ratePerUnit : 100;

  let campaignEstimatedReach = 0;
  let campaignTotalBudget = 0;

  if (calcMode === 'BUDGET') {
    campaignTotalBudget = Math.max(50000, Number(budgetInput) || 0);
    campaignEstimatedReach = Math.floor(campaignTotalBudget / unitPrice);
  } else {
    campaignEstimatedReach = Math.max(100, Number(reachInput) || 0);
    campaignTotalBudget = campaignEstimatedReach * unitPrice;
  }

  // Recommended package matching for campaign budget
  const recommendedPackage = data.packages.find((pkg) => {
    if (campaignTotalBudget <= 200000) return pkg.id === 'one_klik_tier1';
    if (campaignTotalBudget <= 500000) return pkg.id === 'one_klik_tier2';
    if (campaignTotalBudget <= 1000000) return pkg.id === 'paket_umkm';
    return pkg.id === 'paket_corporate';
  }) || data.packages[0];

  // ==========================================
  // 2. STATE: KALKULASI TOPUP SALDO DENGAN DISKON MANUAL
  // ==========================================
  const [topupNominal, setTopupNominal] = useState<number>(1000000);
  const [discountMode, setDiscountMode] = useState<'PERCENT' | 'NOMINAL'>('PERCENT');
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(discountConfig.reloadDiscountPercent || 5);
  const [customDiscountNominal, setCustomDiscountNominal] = useState<number>(50000);

  // Quick preset nominal options
  const quickTopupNominals = [200000, 500000, 1000000, 2500000, 5000000, 10000000];
  const quickDiscountPercents = [0, 3, 5, 7.5, 10, 15];

  // Top-up calculation
  const safeTopupNominal = Math.max(50000, Number(topupNominal) || 0);
  let topupSavings = 0;
  let topupFinalPay = 0;
  let effectiveDiscountPercent = 0;

  if (discountMode === 'PERCENT') {
    effectiveDiscountPercent = Math.max(0, Math.min(100, Number(customDiscountPercent) || 0));
    topupSavings = Math.round((safeTopupNominal * effectiveDiscountPercent) / 100);
    topupFinalPay = Math.max(0, safeTopupNominal - topupSavings);
  } else {
    topupSavings = Math.max(0, Math.min(safeTopupNominal, Number(customDiscountNominal) || 0));
    topupFinalPay = Math.max(0, safeTopupNominal - topupSavings);
    effectiveDiscountPercent = safeTopupNominal > 0 ? Number(((topupSavings / safeTopupNominal) * 100).toFixed(1)) : 0;
  }

  // Estimated SMS broadcast equivalents from topup balance
  const approxSmsReach = Math.floor(safeTopupNominal / (channelRates[0]?.ratePerUnit || 100));

  // ==========================================
  // HANDLERS: SHARE TO WHATSAPP
  // ==========================================
  const handleTabSwitch = (tab: 'CAMPAIGN' | 'TOPUP') => {
    setActiveTab(tab);
    trackRealVisitor(
      tab === 'CAMPAIGN' ? '/kalkulator-biaya/anggaran-iklan' : '/kalkulator-biaya/topup-saldo',
      'pageview',
      companyConfig.spreadsheetUrl
    );
  };

  // Share Campaign Simulation
  const shareCampaignToWhatsApp = () => {
    trackRealVisitor('/kalkulator-biaya/konsultasi-anggaran-wa', 'simulasi', companyConfig.spreadsheetUrl);
    const text =
      `Halo ${companyConfig.brandName}, saya melakukan simulasi anggaran kampanye iklan di website:\n\n` +
      `📌 *Saluran Iklan:* ${currentRate.facility} - ${currentRate.featureName}\n` +
      `💵 *Tarif Satuan:* Rp ${unitPrice.toLocaleString('id-ID')} ${currentRate.unit}\n` +
      `👥 *Estimasi Jangkauan Target:* ${campaignEstimatedReach.toLocaleString('id-ID')} nomor/pesan\n` +
      `💰 *Total Estimasi Anggaran:* Rp ${campaignTotalBudget.toLocaleString('id-ID')}\n\n` +
      `Saya tertarik konsultasi dan memesan paket ini. Mohon info teknis pelaksanaannya.`;

    window.open(`https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Share Top-up Simulation
  const shareTopupToWhatsApp = () => {
    trackRealVisitor('/kalkulator-biaya/pengajuan-topup-saldo-wa', 'simulasi', companyConfig.spreadsheetUrl);
    const text =
      `Halo ${companyConfig.brandName}, saya ingin melakukan Top-Up Saldo MyAds dengan simulasi berikut:\n\n` +
      `💳 *Nominal Saldo Diterima:* Rp ${safeTopupNominal.toLocaleString('id-ID')}\n` +
      `🎁 *Setting Diskon (${effectiveDiscountPercent}%):* Hemat Rp ${topupSavings.toLocaleString('id-ID')}\n` +
      `✨ *Total Yang Ditransfer:* Rp ${topupFinalPay.toLocaleString('id-ID')}\n\n` +
      `Mohon dibantu instruksi pembayaran dan aktivasi saldo akun MyAds saya. Terima kasih!`;

    window.open(`https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="section-calculator" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>Pusat Simulasi & Kalkulator Cerdas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kalkulator Anggaran Iklan & Top-Up Saldo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Pilih mode kalkulasi sesuai kebutuhan Anda: simulasi jangkauan audiens kampanye atau kalkulasi pengisian saldo dengan diskon manual.
          </p>

          {/* Primary Top Navigation Tabs: Anggaran Iklan VS Topup Saldo */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner max-w-full overflow-x-auto">
              <button
                type="button"
                id="tab-calc-campaign"
                onClick={() => handleTabSwitch('CAMPAIGN')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                  activeTab === 'CAMPAIGN'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>1. Kalkulasi Anggaran Iklan</span>
              </button>

              <button
                type="button"
                id="tab-calc-topup"
                onClick={() => handleTabSwitch('TOPUP')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                  activeTab === 'TOPUP'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>2. Kalkulasi Top-Up Saldo (Diskon Manual)</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Baru
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KALKULASI ANGGARAN IKLAN (MURNI TANPA DISKON ISI ULANG) */}
        {/* ========================================================================= */}
        {activeTab === 'CAMPAIGN' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Controls Column */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Parameter Kampanye Iklan
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tarif Resmi MyAds
                </span>
              </div>

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

            {/* Results Summary Box for Campaign */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Hasil Estimasi Anggaran Kampanye
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Estimasi Jangkauan
                </span>
              </div>

              {/* Estimated Reach Big Output */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Estimasi Total Jangkauan Target Penerima Iklan
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    {campaignEstimatedReach.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Penerima / Nomor Aktif
                  </span>
                </div>
              </div>

              {/* Cost Breakdown (Pure calculation without reload discount) */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200/80 dark:border-slate-700 py-3">
                <div className="flex justify-between">
                  <span>Saluran Terpilih:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentRate.facility} ({currentRate.featureName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarif Satuan:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rp {unitPrice.toLocaleString('id-ID')} {currentRate.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Target Penerima:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {campaignEstimatedReach.toLocaleString('id-ID')} nomor
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Total Anggaran Kampanye:</span>
                  <span className="text-blue-600 dark:text-blue-400 text-base">
                    Rp {campaignTotalBudget.toLocaleString('id-ID')}
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
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 shadow-xs"
                  >
                    Pilih Paket
                  </button>
                </div>
              )}

              {/* Share to WhatsApp Button */}
              <button
                id="btn-calculator-share-campaign-whatsapp"
                onClick={shareCampaignToWhatsApp}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasikan Anggaran Ini ke WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KALKULASI TOP-UP SALDO (DENGAN SETTING DISKON MANUAL) */}
        {/* ========================================================================= */}
        {activeTab === 'TOPUP' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Top-up Form Controls Column */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-850 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Pengaturan Top-Up Saldo
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Diskon Custom
                </span>
              </div>

              {/* 1. Input Nominal Saldo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  1. Masukkan Nominal Saldo yang Ingin Diisi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    Rp
                  </div>
                  <input
                    type="number"
                    id="input-topup-nominal"
                    min="50000"
                    step="50000"
                    value={topupNominal || ''}
                    onChange={(e) => setTopupNominal(Number(e.target.value) || 0)}
                    placeholder="1.000.000"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Range Slider for Quick Adjustment */}
                <div className="mt-3 space-y-1.5">
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="100000"
                    value={Math.min(10000000, safeTopupNominal)}
                    onChange={(e) => setTopupNominal(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Rp 100 Rb</span>
                    <span>Rp 5 Juta</span>
                    <span>Rp 10 Juta+</span>
                  </div>
                </div>

                {/* Quick Nominal Chips */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    Pilihan Cepat Nominal:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickTopupNominals.map((nom) => (
                      <button
                        key={`chip-nom-${nom}`}
                        type="button"
                        onClick={() => setTopupNominal(nom)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          topupNominal === nom
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        Rp {(nom / 1000).toLocaleString('id-ID')} Rb
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Setting Diskon Manual (Bisa Diisi Manual) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    2. Setting Diskon (Isi Manual)
                  </label>
                  {/* Toggle Discount Mode: Persen vs Nominal */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountMode('PERCENT')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        discountMode === 'PERCENT'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Persen (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode('NOMINAL')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        discountMode === 'NOMINAL'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Nominal (Rp)
                    </button>
                  </div>
                </div>

                {discountMode === 'PERCENT' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        id="input-custom-discount-percent"
                        min="0"
                        max="100"
                        step="0.5"
                        value={customDiscountPercent === 0 ? '0' : customDiscountPercent || ''}
                        onChange={(e) => setCustomDiscountPercent(Number(e.target.value))}
                        placeholder="Contoh: 5"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        %
                      </div>
                    </div>

                    {/* Quick discount preset buttons */}
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                        Preset Diskon Cepat:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickDiscountPercents.map((pct) => (
                          <button
                            key={`chip-pct-${pct}`}
                            type="button"
                            onClick={() => setCustomDiscountPercent(pct)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              customDiscountPercent === pct
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                        Rp
                      </div>
                      <input
                        type="number"
                        id="input-custom-discount-nominal"
                        min="0"
                        max={safeTopupNominal}
                        step="5000"
                        value={customDiscountNominal || ''}
                        onChange={(e) => setCustomDiscountNominal(Number(e.target.value) || 0)}
                        placeholder="Contoh: 50.000"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Column for Top-Up */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Rincian Pembayaran Top-Up
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Hemat {effectiveDiscountPercent}%
                </span>
              </div>

              {/* Big Output: Saldo yang Masuk Akun */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Total Saldo MyAds yang Masuk ke Akun Anda:
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    Rp {safeTopupNominal.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  ≈ Dapat menjangkau hingga <strong>{approxSmsReach.toLocaleString('id-ID')}</strong> target penerima iklan
                </span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200/80 dark:border-slate-700 py-3">
                <div className="flex justify-between items-center">
                  <span>Nominal Saldo Dipilih:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rp {safeTopupNominal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Potongan Diskon ({effectiveDiscountPercent}%):
                  </span>
                  <span>- Rp {topupSavings.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Total Yang Harus Ditransfer:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                    Rp {topupFinalPay.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Benefit Box */}
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Keuntungan Isi Ulang Saldo:</span>
                </div>
                <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>Bisa digunakan lintas saluran (SMS LBA, Broadcast, Targeted, MMS).</li>
                  <li>Potongan diskon Rp {topupSavings.toLocaleString('id-ID')} langsung berlaku saat transfer.</li>
                </ul>
              </div>

              {/* Submit Top-up to WhatsApp */}
              <button
                id="btn-calculator-share-topup-whatsapp"
                onClick={shareTopupToWhatsApp}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ajukan Top-Up Saldo Diskon {effectiveDiscountPercent}% via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

