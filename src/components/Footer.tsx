import React from 'react';
import { useApp } from '../context/AppContext';
import { AkarDayaLogo } from './AkarDayaLogo';
import {
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Table,
  Calculator,
  MessageSquareQuote,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { data } = useApp();
  const { companyConfig } = data;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer-section" className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                <AkarDayaLogo className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                {companyConfig.brandName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {companyConfig.brandTagline}. Menghubungkan promosi bisnis Anda secara langsung ke layar jutaan pengguna telekomunikasi di seluruh Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollTo('section-packages')}
                  className="hover:text-white transition-colors"
                >
                  Paket Langganan Iklan
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('section-matrix')}
                  className="hover:text-white transition-colors"
                >
                  Tabel Matriks Fasilitas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('section-rates')}
                  className="hover:text-white transition-colors"
                >
                  Katalog Tarif Saluran Resmi
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('section-inventory-products')}
                  className="hover:text-white transition-colors text-left"
                >
                  Inventori MyAds (3 Pilar & 12 Saluran)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('section-calculator')}
                  className="hover:text-white transition-colors"
                >
                  Kalkulator Simulasi Biaya
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('section-testimonials')}
                  className="hover:text-white transition-colors"
                >
                  Ulasan & Testimoni Klien
                </button>
              </li>
            </ul>
          </div>

          {/* Channel Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Saluran Promosi
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• SMS Broadcast (@Rp.100) & Targeted (@Rp.180)</li>
              <li>• SMS LBA Radius Lokasi (@Rp.200)</li>
              <li>• SMS Pop-up Flash (@Rp.250-350)</li>
              <li>• MMS Visual Gambar (@Rp.250-330)</li>
              <li>• Pop-up USSD Interaktif (@Rp.100-175)</li>
              <li>• RCS Interactive Messaging (@Rp.350-450)</li>
              <li>• WhatsApp Business Resmi WABA (@Rp.605-1100)</li>
              <li>• WhatsApp Utility Notification (@Rp.354)</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Layanan & Hubungi Kami
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`https://wa.me/${companyConfig.waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WA: {companyConfig.waDisplayNumber}</span>
              </a>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{companyConfig.officeAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{companyConfig.operatingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {companyConfig.brandName}. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span>Privasi & Keamanan Data</span>
            <span>Syarat & Ketentuan</span>
            <span>Telco Gateway Resmi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
