import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Headset, MessageCircle, X, Send, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingCSButton: React.FC = () => {
  const { data } = useApp();
  const { companyConfig } = data;
  const [isOpen, setIsOpen] = useState(false);

  const directWhatsAppLink = `https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(
    'Halo CS Admin, saya ingin konsultasi mengenai paket iklan dan kebutuhan promosi bisnis saya.'
  )}`;

  return (
    <div
      id="floating-cs-container"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Floating Interactive CS Card Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3 w-[290px] sm:w-[320px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/25">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                      <span>Customer Service</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      {companyConfig.brandName || 'MyAds Pro'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Tutup Popup CS"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-1.5">
                <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  👋 Ada yang bisa kami bantu? Konsultasikan strategi iklan, target lokasi, atau aktivasi paket Anda.
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{companyConfig.operatingHours}</span>
                </div>
              </div>

              {/* Direct WA Action */}
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold transition-all shadow-md shadow-emerald-500/25"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mulai Chat WhatsApp</span>
                <Send className="w-3.5 h-3.5 ml-auto opacity-80" />
              </a>

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                Terhubung langsung dengan tim CS {companyConfig.brandName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating CS Icon Trigger Button */}
      <div className="relative group">
        {/* Hover Tooltip (Shown when closed) */}
        {!isOpen && (
          <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Chat CS Online</span>
            </div>
          </div>
        )}

        <button
          id="btn-floating-cs"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 focus:outline-none ${
            isOpen
              ? 'bg-slate-800 dark:bg-slate-700 rotate-90 shadow-slate-800/30'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/35 hover:scale-105'
          }`}
          aria-label="Customer Service WhatsApp Floating"
          title="Customer Service"
        >
          {/* Animated Glow Halo */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping pointer-events-none"></span>
          )}

          {/* Active Online Green Dot Badge */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full"></span>
            </span>
          )}

          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Headset className="w-7 h-7" />
          )}
        </button>
      </div>
    </div>
  );
};
