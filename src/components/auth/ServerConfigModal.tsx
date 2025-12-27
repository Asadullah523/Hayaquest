import React, { useState, useEffect } from 'react';
import { Save, X, Server, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateApiUrl } from '../../services/api';

interface ServerConfigModalProps {
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Load existing
    const stored = localStorage.getItem('custom_api_url');
    if (stored) {
        setUrl(stored);
    } else {
        setUrl('http://192.168.1.8:5001');
    }
  }, []);

  const handleSave = () => {
    if (!url) return;
    updateApiUrl(url);
    // Reload to force all services to pick up new config if needed, or just close
    // For safety, let's reload the page to ensure fresh start
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem('custom_api_url');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm glass-card rounded-2xl p-6 border border-slate-700 shadow-2xl bg-slate-800"
      >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Server size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Server Connection</h3>
                <p className="text-xs text-slate-400">Configure backend URL</p>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Server Address (Start with http://)
                </label>
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://192.168.1.X:5001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-2">
                    Must be on the same Wi-Fi network as the server.
                </p>
            </div>

            <div className="flex gap-2 pt-2">
                <button 
                    onClick={handleReset}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} />
                    Reset
                </button>
                <button 
                    onClick={handleSave}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    <Save size={16} />
                    Save & Reload
                </button>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
            <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};
