import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AdminApp } from './AdminApp';
import './index.css';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <AppProvider>
      <AdminApp />
    </AppProvider>
  </StrictMode>
);
