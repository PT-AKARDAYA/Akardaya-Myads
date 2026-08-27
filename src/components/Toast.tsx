import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { notificationToast, dismissToast } = useApp();

  return (
    <AnimatePresence>
      {notificationToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div
            id="toast-notification-banner"
            className="flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-3">
              {notificationToast.type === 'success' && (
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {notificationToast.type === 'warning' && (
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {notificationToast.type === 'info' && (
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Info className="w-5 h-5" />
                </div>
              )}
              <span className="text-sm font-medium leading-snug">{notificationToast.message}</span>
            </div>
            <button
              id="btn-dismiss-toast"
              onClick={dismissToast}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
