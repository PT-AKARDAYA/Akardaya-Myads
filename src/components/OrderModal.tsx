import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  PhoneCall,
  Send,
  Sparkles,
  Layers,
  MapPin,
  Building2,
  User,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderModal: React.FC = () => {
  const {
    data,
    isOrderModalOpen,
    setIsOrderModalOpen,
    selectedPackageForOrder,
    submitOrder,
  } = useApp();
  const { packages, companyConfig, discountConfig } = data;

  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [targetCityOrArea, setTargetCityOrArea] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPackageForOrder) {
      setSelectedPackageId(selectedPackageForOrder.id);
      setEstimatedBudget(selectedPackageForOrder.priceDisplay);
    } else if (packages.length > 0) {
      setSelectedPackageId(packages[0].id);
      setEstimatedBudget(packages[0].priceDisplay);
    }
  }, [selectedPackageForOrder, packages]);

  if (!isOrderModalOpen) return null;

  const currentPkg = packages.find((p) => p.id === selectedPackageId) || selectedPackageForOrder || packages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim()) return;

    setIsSubmitting(true);

    // Clean phone number
    let cleanWa = whatsapp.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
    }

    const payload = {
      customerName: customerName.trim(),
      whatsapp: cleanWa,
      businessName: businessName.trim(),
      selectedPackageId: currentPkg?.id || 'custom',
      selectedPackageName: currentPkg?.name || 'Paket Promosi Iklan',
      estimatedBudget: estimatedBudget || currentPkg?.priceDisplay || 'Sesuai Paket',
      targetCityOrArea: targetCityOrArea.trim(),
      notes: notes.trim(),
    };

    await submitOrder(payload);

    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.6 },
    });

    setIsSubmitting(false);
    setIsOrderModalOpen(false);

    // Format WhatsApp message to Admin
    const waText =
      `Halo ${companyConfig.brandName}, saya ingin memesan / konsultasi paket promosi iklan:\n\n` +
      `👤 *Nama:* ${customerName.trim()}\n` +
      `📱 *No. WhatsApp:* ${cleanWa}\n` +
      `🏢 *Nama Usaha/Brand:* ${businessName.trim() || '-'}\n` +
      `📦 *Paket Pilihan:* ${currentPkg ? currentPkg.name + ' (' + currentPkg.priceDisplay + ')' : 'Konsultasi Custom'}\n` +
      `📍 *Target Lokasi/Kota:* ${targetCityOrArea.trim() || 'Nasional / Seluruh Indonesia'}\n` +
      `💰 *Estimasi Budget:* ${estimatedBudget || currentPkg?.priceDisplay}\n` +
      `🎁 *Diskon Top-up:* ${discountConfig.reloadDiscountPercent}%\n` +
      (notes.trim() ? `📝 *Kebutuhan/Catatan:* ${notes.trim()}\n\n` : '\n') +
      `Mohon dibantu proses setup dan penjelasannya. Terima kasih!`;

    const waUrl = `https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      id="modal-order-consultation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Pesan Paket & Konsultasi Iklan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Terhubung langsung ke WhatsApp Admin Resmi
              </p>
            </div>
          </div>
          <button
            id="btn-close-order-modal"
            onClick={() => setIsOrderModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Package Highlight Bar */}
        {currentPkg && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                Paket yang dipilih:
              </span>
              <strong className="text-slate-900 dark:text-white font-bold text-sm">
                {currentPkg.name}
              </strong>
              <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {currentPkg.priceDisplay} · Gratis {currentPkg.freeContentPerMonth}x Konten
                {currentPkg.freeWebsiteMonths > 0 ? ' + Web 3 Bulan' : ''}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shrink-0">
              Diskon {discountConfig.reloadDiscountPercent}%
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Anda *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rian Pratama"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Usaha / Toko / Brand
              </label>
              <input
                type="text"
                placeholder="Contoh: Toko Berkah Jaya"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Kota / Lokasi Toko (LBA)
              </label>
              <input
                type="text"
                placeholder="Contoh: Surabaya Timur (Radius 2km)"
                value={targetCityOrArea}
                onChange={(e) => setTargetCityOrArea(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ganti Pilihan Paket
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => {
                setSelectedPackageId(e.target.value);
                const found = packages.find((p) => p.id === e.target.value);
                if (found) setEstimatedBudget(found.priceDisplay);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.categoryTitle} - {pkg.priceDisplay})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan atau Target Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Ingin promosi grand opening hari Sabtu ini, target ibu-ibu dan pekerja kantor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              id="btn-submit-order-lead"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyiapkan...' : 'Lanjutkan ke Chat WhatsApp Admin'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2">
              🔒 Data Anda aman dan tim admin kami akan membalas langsung dalam hitungan menit.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
