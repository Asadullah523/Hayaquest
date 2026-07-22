import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { X, LogOut, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoutConfirmModalProps {
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ onClose }) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-red-500/20"
      >
        <div className="p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
            <LogOut size={32} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Sign Out?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
            Are you sure you want to sign out? Your local data will remain, but cloud syncing will be paused.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClose}
              className="py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              onClick={handleLogout}
              className="py-3.5 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <AlertCircle size={12} />
            Stay logged in to sync across devices
          </div>
        </div>
      </motion.div>
    </div>
  );
};
