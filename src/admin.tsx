import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AdminApp } from './AdminApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Portal Admin Akardaya">
      <AppProvider>
        <AdminApp />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>
);
