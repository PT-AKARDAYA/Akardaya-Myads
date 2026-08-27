import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { trackRealVisitor } from '../utils/analyticsTracker';
import {
  Home,
  Layers,
  Calculator,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  targetId?: string;
  isExternal?: boolean;
}

export const MobileBottomNav: React.FC = () => {
  const { data } = useApp();
  const [activeTab, setActiveTab] = useState<string>('beranda');

  const navItems: NavItem[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
      targetId: 'section-hero',
    },
    {
      id: 'paket',
      label: 'Paket',
      icon: Layers,
      targetId: 'section-packages',
    },
    {
      id: 'kalkulator',
      label: 'Hitung',
      icon: Calculator,
      targetId: 'section-calculator',
    },
    {
      id: 'testimoni',
      label: 'Favorit',
      icon: Heart,
      targetId: 'section-testimonials',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      isExternal: true,
    },
  ];

  // Scroll listener to update active tab based on viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      const packagesEl = document.getElementById('section-packages');
      const calcEl = document.getElementById('section-calculator');
      const testiEl = document.getElementById('section-testimonials');

      if (testiEl && scrollPos >= testiEl.offsetTop - 100) {
        setActiveTab('testimoni');
      } else if (calcEl && scrollPos >= calcEl.offsetTop - 100) {
        setActiveTab('kalkulator');
      } else if (packagesEl && scrollPos >= packagesEl.offsetTop - 100) {
        setActiveTab('paket');
      } else {
        setActiveTab('beranda');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (item: NavItem) => {
    setActiveTab(item.id);

    const navSectionMap: { [id: string]: string } = {
      beranda: '/ (Beranda)',
      paket: '/paket-langganan',
      kalkulator: '/kalkulator-biaya',
      testimoni: '/testimoni-ulasan',
      chat: '/chat-konsultasi-wa',
    };
    trackRealVisitor(navSectionMap[item.id] || `/${item.id}`, 'pageview', data?.companyConfig?.spreadsheetUrl);

    if (item.isExternal) {
      const directWhatsAppLink = `https://wa.me/${data.companyConfig.waNumber}?text=${encodeURIComponent(
        `Halo ${data.companyConfig.brandName}, saya ingin konsultasi paket promosi iklan.`
      )}`;
      window.open(directWhatsAppLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.targetId) {
      if (item.id === 'beranda') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(item.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="mobile-bottom-navigation-bar"
      className="md:hidden fixed bottom-3 left-3 right-3 sm:left-auto sm:right-auto sm:w-[420px] sm:inset-x-0 sm:mx-auto z-40 pointer-events-none"
    >
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="pointer-events-auto relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.18)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-slate-800/90 px-3 py-2"
      >
        <div className="flex items-center justify-between relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}`}
                onClick={() => handleTabClick(item)}
                className="relative flex-1 flex flex-col items-center justify-end h-11 focus:outline-none transition-transform active:scale-95 select-none"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Floating Pop-up Circle with Spring Animation */}
                {isActive ? (
                  <>
                    <motion.div
                      layoutId="activeTabBubble"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 30,
                      }}
                      className="absolute -top-5.5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.45)] border-[3.5px] border-white dark:border-slate-900 z-10"
                    >
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-5 h-5 stroke-[2.5]" />
                      </motion.div>
                    </motion.div>

                    {/* Active Label */}
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-auto transition-colors">
                      {item.label}
                    </span>
                  </>
                ) : (
                  <>
                    {/* Inactive Icon */}
                    <div className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-0.5">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>

                    {/* Inactive Label */}
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 transition-colors">
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
