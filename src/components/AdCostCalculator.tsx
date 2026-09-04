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
  Gift,
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
  const [reachInput, setReachInput] = useState<number>(5000);

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
  // 2. STATE & LOGIC: KALKULASI TOPUP SALDO & BONUS MONETARY (SESUAI TABEL)
  // ==========================================
  const [topupNominal, setTopupNominal] = useState<number>(1000000);
  const [isCustomBonusMode, setIsCustomBonusMode] = useState<boolean>(false);
  const [customBonusPercent, setCustomBonusPercent] = useState<number>(50);

  // Tabel Skema Bonus Monetary sesuai data tabel resmi:
  // <=500.000           : 0%
  // 500.000 - 1.000.000 : 30%
  // >=1.000.000         : 50%
  const MONETARY_TIERS = [
    {
      id: 'tier-0',
      label: '<=500.000',
      nominalDisplay: '<= Rp 500.000',
      bonusPercent: 0,
      description: 'Saldo utama utuh, tanpa bonus monetary',
    },
    {
      id: 'tier-30',
      label: '500.000 - 1.000.000',
      nominalDisplay: 'Rp 500.000 - 1.000.000',
      bonusPercent: 30,
      description: 'Mendapatkan ekstra bonus saldo monetary +30%',
    },
    {
      id: 'tier-50',
      label: '>=1.000.000',
      nominalDisplay: '>= Rp 1.000.000',
      bonusPercent: 50,
      description: 'Mendapatkan ekstra bonus saldo monetary maksimal +50%',
    },
  ];

  // Tentukan tier aktif berdasarkan nominal
  const getActiveTier = (amount: number) => {
    if (amount >= 1000000) return MONETARY_TIERS[2];
    if (amount >= 500000) return MONETARY_TIERS[1];
    return MONETARY_TIERS[0];
  };

  const currentTier = getActiveTier(topupNominal);

  // Persentase bonus monetary efektif
  const effectiveBonusPercent = isCustomBonusMode
    ? Math.max(0, Math.min(200, Number(customBonusPercent) || 0))
    : currentTier.bonusPercent;

  // Safe nominal
  const safeTopupNominal = Math.max(50000, Number(topupNominal) || 0);

  // 1. Saldo Utama: 100% utuh sesuai nominal yang diisi/ditransfer
  const saldoUtama = safeTopupNominal;

  // 2. Bonus Monetary: persentase dari saldo utama
  const bonusMonetary = Math.round((saldoUtama * effectiveBonusPercent) / 100);

  // 3. Total Saldo yang Diterima di Akun: Saldo Utama + Bonus Monetary
  const totalSaldoDiterima = saldoUtama + bonusMonetary;

  // 4. Total Yang Ditransfer / Dibayar: Murni nominal saldo utama (tanpa potongan/diskon)
  const totalYangDitransfer = safeTopupNominal;

  // Quick preset nominal options
  const quickTopupNominals = [
    { nominal: 200000, label: 'Rp 200 Rb' },
    { nominal: 500000, label: 'Rp 500 Rb' },
    { nominal: 750000, label: 'Rp 750 Rb' },
    { nominal: 1000000, label: 'Rp 1 Juta' },
    { nominal: 2500000, label: 'Rp 2.5 Juta' },
    { nominal: 5000000, label: 'Rp 5 Juta' },
  ];

  // Estimated reach from Total Saldo
  const approxSmsReachTotal = Math.floor(totalSaldoDiterima / (channelRates[0]?.ratePerUnit || 100));
  const approxSmsReachBonusOnly = Math.floor(bonusMonetary / (channelRates[0]?.ratePerUnit || 100));

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
      `💳 *Nominal Top-Up / Transfer:* Rp ${totalYangDitransfer.toLocaleString('id-ID')}\n` +
      `🪙 *Saldo Utama Diterima:* Rp ${saldoUtama.toLocaleString('id-ID')}\n` +
      `🎁 *Bonus Monetary (${effectiveBonusPercent}%):* +Rp ${bonusMonetary.toLocaleString('id-ID')}\n` +
      `✨ *Total Saldo Akun Didapat:* Rp ${totalSaldoDiterima.toLocaleString('id-ID')}\n` +
      `👥 *Estimasi Total Jangkauan:* ±${approxSmsReachTotal.toLocaleString('id-ID')} nomor/pesan\n\n` +
      `Mohon dibantu nomor rekening pembayaran dan aktivasi saldo akun MyAds saya. Terima kasih!`;

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
            Pilih mode kalkulasi sesuai kebutuhan Anda: simulasi jangkauan audiens kampanye atau kalkulasi top-up saldo utama dengan bonus monetary resmi.
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
                <span>2. Kalkulasi Top-Up Saldo & Bonus Monetary</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Bonus s/d 50%
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
        {/* TAB 2: KALKULASI TOP-UP SALDO & BONUS MONETARY (SESUAI TABEL RESMI) */}
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
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Bonus s/d 50%
                </span>
              </div>

              {/* 1. Input Nominal Saldo Utama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  1. Masukkan Nominal Saldo yang Ingin Diisi (Rp)
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
                    {quickTopupNominals.map((item) => {
                      const tier = getActiveTier(item.nominal);
                      return (
                        <button
                          key={`chip-nom-${item.nominal}`}
                          type="button"
                          onClick={() => setTopupNominal(item.nominal)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                            topupNominal === item.nominal
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`text-[10px] px-1 rounded ${
                              topupNominal === item.nominal
                                ? 'bg-emerald-700 text-white'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            +{tier.bonusPercent}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. Tabel Skema Bonus Monetary Resmi Sesuai Ketentuan */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    2. Skema Bonus Monetary Resmi
                  </label>
                  <span className="text-[10px] text-slate-400">Klik baris untuk memilih</span>
                </div>

                {/* Table representation matching the reference table */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white dark:bg-slate-950">
                        <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px]">Nominal</th>
                        <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-center">Bonus Monetary</th>
                        <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-[11px] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {MONETARY_TIERS.map((tier) => {
                        const isSelected = !isCustomBonusMode && currentTier.id === tier.id;
                        return (
                          <tr
                            key={tier.id}
                            onClick={() => {
                              setIsCustomBonusMode(false);
                              if (tier.id === 'tier-0' && topupNominal > 500000) setTopupNominal(300000);
                              else if (tier.id === 'tier-30' && (topupNominal < 500000 || topupNominal >= 1000000)) setTopupNominal(500000);
                              else if (tier.id === 'tier-50' && topupNominal < 1000000) setTopupNominal(1000000);
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span className={`font-bold ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                {tier.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                                  tier.bonusPercent > 0
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {tier.bonusPercent}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Pilih</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Custom Bonus Toggle (Optional if user needs manual adjustment) */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsCustomBonusMode(!isCustomBonusMode)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isCustomBonusMode ? 'Kembali ke Skema Otomatis' : 'Sesuaikan Bonus Manual (%)'}</span>
                  </button>

                  {isCustomBonusMode && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Bonus Custom:</span>
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="5"
                          value={customBonusPercent}
                          onChange={(e) => setCustomBonusPercent(Number(e.target.value) || 0)}
                          className="w-full py-1 pl-2 pr-6 rounded-lg border border-emerald-500 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs font-bold text-emerald-600">
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Column for Top-Up */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Rincian Saldo Akun & Bonus
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Bonus Monetary +{effectiveBonusPercent}%
                </span>
              </div>

              {/* Big Output: Total Saldo yang Masuk Akun */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Total Saldo MyAds yang Masuk ke Akun Anda:
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    Rp {totalSaldoDiterima.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Saldo Utama: <strong>Rp {saldoUtama.toLocaleString('id-ID')}</strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Bonus Monetary: <strong>+Rp {bonusMonetary.toLocaleString('id-ID')}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
                  ≈ Dapat menjangkau hingga <strong>{approxSmsReachTotal.toLocaleString('id-ID')}</strong> target penerima iklan (termasuk <strong>{approxSmsReachBonusOnly.toLocaleString('id-ID')}</strong> pesan ekstra gratis dari bonus).
                </span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200/80 dark:border-slate-700 py-3">
                <div className="flex justify-between items-center">
                  <span>Nominal Top-Up (Yang Ditransfer):</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Rp {totalYangDitransfer.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Saldo Utama Diterima (100%):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rp {saldoUtama.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Bonus Monetary ({effectiveBonusPercent}%):
                  </span>
                  <span>+ Rp {bonusMonetary.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Total Saldo Akhir di Akun:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                    Rp {totalSaldoDiterima.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Benefit Box */}
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Keuntungan Top-Up Saldo & Bonus Monetary:</span>
                </div>
                <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>Saldo utama 100% utuh tanpa potongan administrasi apapun.</li>
                  <li>Bonus monetary sebesar Rp {bonusMonetary.toLocaleString('id-ID')} langsung ditambahkan ke akun MyAds.</li>
                  <li>Bisa digunakan lintas saluran (SMS LBA, Broadcast, Targeted, MMS, USSD, WA WABA).</li>
                </ul>
              </div>

              {/* Submit Top-up to WhatsApp */}
              <button
                id="btn-calculator-share-topup-whatsapp"
                onClick={shareTopupToWhatsApp}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ajukan Top-Up Saldo + Bonus {effectiveBonusPercent}% via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

