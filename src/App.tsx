import React, { Suspense, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroPromo } from './components/HeroPromo';
import { PackageCards } from './components/PackageCards';
import { FloatingCSButton } from './components/FloatingCSButton';
import { OrderModal } from './components/OrderModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { trackRealVisitor } from './utils/analyticsTracker';

// Lazy loaded below-the-fold components (Drastically reduces initial JS bundle size)
const ProductInventoryShowcase = React.lazy(() => import('./components/ProductInventoryShowcase').then(module => ({ default: module.ProductInventoryShowcase })));
const PackageMatrixTable = React.lazy(() => import('./components/PackageMatrixTable').then(module => ({ default: module.PackageMatrixTable })));
const RateMatrixCatalog = React.lazy(() => import('./components/RateMatrixCatalog').then(module => ({ default: module.RateMatrixCatalog })));
const AdCostCalculator = React.lazy(() => import('./components/AdCostCalculator').then(module => ({ default: module.AdCostCalculator })));
const OfficeLocationsMap = React.lazy(() => import('./components/OfficeLocationsMap').then(module => ({ default: module.OfficeLocationsMap })));
const TestimonialsSection = React.lazy(() => import('./components/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
const AdminDashboardModal = React.lazy(() => import('./components/AdminDashboardModal').then(module => ({ default: module.AdminDashboardModal })));

const FallbackLoader = () => (
  <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
    <span className="text-sm font-medium">Memuat komponen...</span>
  </div>
);

const MainLayout: React.FC = () => {
  const { data } = useApp();

  useEffect(() => {
    // Automatically track visitor sections as they explore
    const targetUrl = data?.companyConfig?.spreadsheetUrl;
    
    // Initial page load
    trackRealVisitor('/ (Beranda)', 'pageview', targetUrl);

    // Section mapping to human-friendly page names in database
    const sectionMap: { [elementId: string]: string } = {
      'section-hero': '/ (Beranda)',
      'section-packages': '/paket-langganan',
      'section-matrix': '/tabel-matriks',
      'section-rates': '/tarif-saluran',
      'section-inventory-products': '/inventori-myads',
      'section-calculator': '/kalkulator-biaya',
      'section-office-maps': '/lokasi-kantor',
      'section-testimonials': '/testimoni-ulasan',
    };

    let dwellTimer: any = null;
    let currentObservedSection = '/ (Beranda)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const pageName = sectionMap[entry.target.id];
            if (pageName && pageName !== currentObservedSection) {
              if (dwellTimer) clearTimeout(dwellTimer);
              // Wait 1 second of dwell time on this section before recording
              dwellTimer = setTimeout(() => {
                currentObservedSection = pageName;
                trackRealVisitor(pageName, 'pageview', targetUrl);
              }, 1000);
            }
          }
        });
      },
      {
        threshold: [0.3],
        rootMargin: '-10% 0px -20% 0px',
      }
    );

    const observeAll = () => {
      Object.keys(sectionMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };

    observeAll();
    const timeoutId = setTimeout(observeAll, 1500);

    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [data?.companyConfig?.spreadsheetUrl]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      <Toast />
      <Navbar />

      <main>
        {/* Above the fold: Loaded instantly */}
        <HeroPromo />
        <PackageCards />

        {/* Below the fold: Lazy loaded */}
        <Suspense fallback={<FallbackLoader />}>
          <PackageMatrixTable />
          <RateMatrixCatalog />
          <ProductInventoryShowcase />
          <AdCostCalculator />
          <OfficeLocationsMap />
          <TestimonialsSection />
        </Suspense>
      </main>

      <Footer />
      <MobileBottomNav />
      <FloatingCSButton />

      {/* Modals are hidden by default, perfect for lazy loading */}
      <OrderModal />
      <Suspense fallback={null}>
        <AdminDashboardModal />
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
