import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfficeLocation } from '../types';
import {
  MapPin,
  Building2,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
  Compass,
  Check,
  Copy,
  Layers,
} from 'lucide-react';

export const OfficeLocationsMap: React.FC = () => {
  const { data } = useApp();
  const offices = data.offices && data.offices.length > 0 ? data.offices : [];
  const { companyConfig } = data;

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    offices.find((o) => o.isPrimary)?.id || offices[0]?.id || ''
  );
  const [filterType, setFilterType] = useState<'ALL' | 'PUSAT' | 'CABANG'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected office data
  const selectedOffice =
    offices.find((o) => o.id === selectedOfficeId) || offices[0] || null;

  // Filtered offices
  const filteredOffices = offices.filter((office) => {
    if (filterType === 'PUSAT') return office.type === 'PUSAT';
    if (filterType === 'CABANG') return office.type === 'CABANG';
    return true;
  });

  const handleCopyCoordinates = (office: OfficeLocation) => {
    const text = `${office.latitude}, ${office.longitude}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(office.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard?.writeText(address);
    setCopiedId(`addr-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!offices.length) {
    return null;
  }

  return (
    <section
      id="section-office-maps"
      className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/60 border-t border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200 dark:border-blue-800/80 shadow-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Jaringan Kantor & Konsultasi Langsung</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Lokasi Kantor Pusat & Kantor Cabang
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Kunjungi kantor pusat kami atau temukan kantor cabang terdekat di kota Anda untuk konsultasi strategi kampanye iklan, demonstrasi sistem broadcast, dan aktivasi paket bersama tim spesialis kami.
          </p>

          {/* Filter Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              Semua Lokasi ({offices.length})
            </button>
            <button
              onClick={() => setFilterType('PUSAT')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                filterType === 'PUSAT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              Kantor Pusat ({offices.filter((o) => o.type === 'PUSAT').length})
            </button>
            <button
              onClick={() => setFilterType('CABANG')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                filterType === 'CABANG'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              Kantor Cabang ({offices.filter((o) => o.type === 'CABANG').length})
            </button>
          </div>
        </div>

        {/* Main Grid: Office List (Left) & Live Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office Cards List (5 Cols on LG) */}
          <div className="lg:col-span-5 space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredOffices.map((office) => {
              const isSelected = selectedOffice?.id === office.id;
              return (
                <div
                  key={office.id}
                  id={`office-card-${office.id}`}
                  onClick={() => setSelectedOfficeId(office.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          office.type === 'PUSAT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {office.type === 'PUSAT' ? 'Kantor Pusat' : 'Kantor Cabang'}
                      </span>
                      {office.cityName && (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          • {office.cityName}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 animate-spin" />
                        Aktif di Peta
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {office.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span>{office.address}</span>
                  </p>

                  {/* Coordinates & Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{office.operatingHours || companyConfig.operatingHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>
                        Lat: {office.latitude.toFixed(4)}, Lng: {office.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCoordinates(office);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                      title="Salin Koordinat Latitude & Longitude"
                    >
                      {copiedId === office.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Koordinat</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 transition-colors ml-auto"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Petunjuk Arah</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Interactive Google Map (7 Cols on LG) */}
          <div className="lg:col-span-7">
            {selectedOffice ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg flex flex-col">
                {/* Map Header Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          selectedOffice.type === 'PUSAT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {selectedOffice.type === 'PUSAT' ? 'Kantor Pusat' : 'Kantor Cabang'}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {selectedOffice.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Koordinat: {selectedOffice.latitude}, {selectedOffice.longitude} ({selectedOffice.cityName})
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedOffice.latitude},${selectedOffice.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-600 transition-colors shadow-xs shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Buka Aplikasi Maps</span>
                  </a>
                </div>

                {/* Map Iframe Container */}
                <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100 dark:bg-slate-900">
                  <iframe
                    title={`Peta Lokasi ${selectedOffice.name}`}
                    src={`https://www.google.com/maps?q=${selectedOffice.latitude},${selectedOffice.longitude}&hl=id&z=16&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                  {/* Floating Pin Indicator Pill */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 pointer-events-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>Pin: {selectedOffice.name}</span>
                  </div>
                </div>

                {/* Map Footer Action Bar */}
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block sm:inline">
                      Alamat:
                    </span>{' '}
                    {selectedOffice.address}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/${selectedOffice.whatsapp || companyConfig.waNumber}?text=${encodeURIComponent(
                        `Halo Admin, saya ingin konsultasi kampanye iklan dan berkunjung ke ${selectedOffice.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Cabang</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOffice.latitude},${selectedOffice.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Rute / Navigasi</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-semibold">Pilih kantor untuk melihat lokasi peta.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
