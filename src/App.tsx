import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroPromo } from './components/HeroPromo';
import { PackageCards } from './components/PackageCards';
import { ProductInventoryShowcase } from './components/ProductInventoryShowcase';
import { PackageMatrixTable } from './components/PackageMatrixTable';
import { RateMatrixCatalog } from './components/RateMatrixCatalog';
import { AdCostCalculator } from './components/AdCostCalculator';
import { OfficeLocationsMap } from './components/OfficeLocationsMap';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FloatingCSButton } from './components/FloatingCSButton';
import { OrderModal } from './components/OrderModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Toast Notification Container */}
      <Toast />

      {/* Main Header / Navigation */}
      <Navbar />

      {/* Hero & Promotion Showcase */}
      <main>
        <HeroPromo />

        {/* Subscription Packages Card Section (Optimized for Mobile/Tablet/Desktop) */}
        <PackageCards />

        {/* Full Side-by-Side Facility Matrix Table (Matching Attachment) */}
        <PackageMatrixTable />

        {/* Official Channel Rates Explorer */}
        <RateMatrixCatalog />

        {/* Official Product Inventory (3 Pillars: LBA, Targeted, Broadcast & 12 Formats) */}
        <ProductInventoryShowcase />

        {/* Cost & Reach Simulation Calculator with Discount */}
        <AdCostCalculator />

        {/* Office and Branch Locations Maps Network */}
        <OfficeLocationsMap />

        {/* Customer Reviews & Testimonials with Live Submission */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sticky Bottom Bar for HP / Mobile View */}
      <MobileBottomNav />

      {/* Floating Customer Service (CS) Icon Button */}
      <FloatingCSButton />

      {/* Modals */}
      <OrderModal />
      <AdminDashboardModal />
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
