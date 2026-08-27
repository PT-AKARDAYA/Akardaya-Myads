import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AkarDayaLogo } from './AkarDayaLogo';
import {
  Moon,
  Sun,
  Menu,
  X,
  Headset,
  PhoneCall,
  Sparkles,
  Layers,
  Calculator,
  MessageSquareQuote,
  Table,
  Heart,
  MapPin,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, darkMode, toggleDarkMode, openOrderModalForPackage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const directWhatsAppLink = `https://wa.me/${data.companyConfig.waNumber}?text=${encodeURIComponent(
    `Halo ${data.companyConfig.brandName}, saya ingin konsultasi paket promosi iklan MyAds.`
  )}`;

  return (
    <>
      {/* Announcement Bar if enabled */}
      {data.companyConfig.showAnnouncement && data.companyConfig.announcementText && (
        <div
          id="top-announcement-bar"
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 font-medium shadow-sm transition-all overflow-hidden relative"
        >
          {/* Mobile View: Right-to-Left Auto-Scrolling Running Text Marquee */}
          <div className="flex sm:hidden items-center gap-2 overflow-hidden w-full">
            <span className="shrink-0 z-10 flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 shadow-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
              <span>PROMO</span>
            </span>
            <div className="overflow-hidden flex-1 relative mask-linear">
              <div className="animate-marquee-rtl flex items-center gap-8 py-0.5">
                <span className="inline-block shrink-0">{data.companyConfig.announcementText}</span>
                <span className="text-amber-300 shrink-0 font-bold">★</span>
                <span className="inline-block shrink-0">{data.companyConfig.announcementText}</span>
                <span className="text-amber-300 shrink-0 font-bold">★</span>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet View: Centered Clear Layout */}
          <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-center gap-2.5 text-center">
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-amber-300" />
            <span className="tracking-wide leading-tight">{data.companyConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header
        id="main-navigation-header"
        className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Real-time Indicator */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <AkarDayaLogo className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  {data.companyConfig.brandName}
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                    Official
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
                  SMS · Flash · MMS · USSD · RCS · WA WABA
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              id="nav-link-packages"
              onClick={() => scrollToSection('section-packages')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Paket Langganan
            </button>
            <button
              id="nav-link-matrix"
              onClick={() => scrollToSection('section-matrix')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Tabel Matriks
            </button>
            <button
              id="nav-link-rates"
              onClick={() => scrollToSection('section-rates')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Tarif Saluran
            </button>
            <button
              id="nav-link-inventory"
              onClick={() => scrollToSection('section-inventory-products')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Inventori MyAds
            </button>
            <button
              id="nav-link-calculator"
              onClick={() => scrollToSection('section-calculator')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Kalkulator Biaya
            </button>
            <button
              id="nav-link-office-maps"
              onClick={() => scrollToSection('section-office-maps')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Lokasi & Maps</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-dark-mode"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-dropdown-nav"
            className="lg:hidden px-4 pt-2 pb-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xl animate-in slide-in-from-top-2"
          >
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => scrollToSection('section-packages')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Paket Langganan</span>
              </button>
              <button
                onClick={() => scrollToSection('section-matrix')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Table className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Tabel Matriks</span>
              </button>
              <button
                onClick={() => scrollToSection('section-rates')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Tarif Saluran</span>
              </button>
              <button
                onClick={() => scrollToSection('section-calculator')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kalkulator Iklan</span>
              </button>
              <button
                onClick={() => scrollToSection('section-inventory-products')}
                className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl border border-red-200 dark:border-red-850 bg-red-50/50 dark:bg-red-950/30 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                <span>Inventori MyAds (3 Pilar & 12 Saluran)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => scrollToSection('section-office-maps')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Lokasi & Maps</span>
              </button>
              <button
                onClick={() => scrollToSection('section-testimonials')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <MessageSquareQuote className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Testimoni</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat WhatsApp Admin</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
