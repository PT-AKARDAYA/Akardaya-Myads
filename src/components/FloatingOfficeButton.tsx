import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { trackRealVisitor } from '../utils/analyticsTracker';
import { OfficeLocation } from '../types';
import {
  MapPin,
  X,
  Navigation,
  ExternalLink,
  Building2,
  Phone,
  Clock,
  Compass,
  ChevronRight,
  Check,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingOfficeButton: React.FC = () => {
  const { data } = useApp();
  const offices = (data?.offices && data.offices.length > 0) ? data.offices : [];
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!offices.length) return null;

  const handleScrollToOfficeMap = () => {
    setIsOpen(false);
    trackRealVisitor('/peta-lokasi-kantor', 'pageview', data?.companyConfig?.spreadsheetUrl);
    const el = document.getElementById('section-office-maps');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDirectionsUrl = (office: OfficeLocation) => {
    if (office.latitude && office.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${office.cityName} ${office.address} ${office.name}`
    )}`;
  };

  const handleCopyAddress = (office: OfficeLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${office.name} - ${office.address}, ${office.cityName}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(office.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="floating-office-container"
      className="md:hidden fixed right-3.5 bottom-20 z-30 flex flex-col items-end pointer-events-auto"
    >
      {/* Floating Office Popup / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3 w-[88vw] max-w-[340px] max-h-[75vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 relative shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/25">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-tight flex items-center gap-1.5">
                      <span>Lokasi Kantor & Cabang</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-medium">
                        {offices.length} Lokasi
                      </span>
                    </h3>
                    <p className="text-[10px] text-blue-100 font-normal">
                      Kunjungi kantor kami untuk konsultasi langsung
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
                  aria-label="Tutup Popup Lokasi Kantor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List of Offices */}
            <div className="p-3 overflow-y-auto space-y-2.5 max-h-[46vh] bg-slate-50/70 dark:bg-slate-900/70 text-xs">
              {offices.map((office) => {
                const isHQ = office.type === 'PUSAT' || office.isPrimary;
                const directionsUrl = getDirectionsUrl(office);

                return (
                  <div
                    key={office.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isHQ ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                            <Building2 className="w-2.5 h-2.5" />
                            <span>Pusat</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Cabang
                          </span>
                        )}
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                          {office.name}
                        </h4>
                      </div>

                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                        {office.cityName}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {office.address}
                    </p>

                    {/* Operational Details */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {office.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{office.phone}</span>
                        </div>
                      )}
                      {office.operatingHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{office.operatingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 transition-all shadow-xs"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Buka Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => handleCopyAddress(office, e)}
                        className="py-1.5 px-2 rounded-xl text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-all"
                      >
                        {copiedId === office.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Salin Alamat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Quick Action */}
            <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={handleScrollToOfficeMap}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Lihat Semua di Peta Interaktif</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <div className="relative group flex items-center gap-2">
        {/* Animated Label Pill (Shown when closed) */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              trackRealVisitor('/floating-office-pill-click', 'pageview', data?.companyConfig?.spreadsheetUrl);
            }}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white text-[10px] font-bold shadow-lg border border-slate-700/60 backdrop-blur-xs animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Lokasi Kantor</span>
          </button>
        )}

        {/* Main Floating Icon Button */}
        <button
          id="btn-floating-office-mobile"
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            trackRealVisitor('/floating-office-click', 'pageview', data?.companyConfig?.spreadsheetUrl);
          }}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-90 focus:outline-none ${
            isOpen
              ? 'bg-slate-800 dark:bg-slate-700 rotate-90 shadow-slate-800/30'
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-blue-600/40 hover:scale-105 ring-2 ring-white/60 dark:ring-slate-800/80'
          }`}
          aria-label="Lokasi Kantor dan Cabang"
          title="Lokasi Kantor"
        >
          {/* Animated Glow Halo */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping pointer-events-none"></span>
          )}

          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MapPin className="w-5 h-5 text-white stroke-[2.2]" />
          )}
        </button>
      </div>
    </div>
  );
};
