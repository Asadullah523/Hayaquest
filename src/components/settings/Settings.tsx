import React, { useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { Download, AlertCircle, Moon, Sun, Monitor, Upload, CheckCircle2, XCircle, Loader2, Clock, Check, User, Target } from 'lucide-react';
import { db } from '../../db/db';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTimerStore } from '../../store/useTimerStore';
import { LoginModal } from '../auth/LoginModal';
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal';
import { syncService } from '../../services/syncService';
import clsx from 'clsx';
import { Cloud, LogOut, RefreshCw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useSyncStore } from '../../store/useSyncStore';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { name, setName, avatar, setAvatar, dailyGoalMinutes, setDailyGoalMinutes } = useUserStore();
  const { user, isAuthenticated } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { status: syncStatus } = useSyncStore();
  const [hasGuestData, setHasGuestData] = useState(false);
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);
  const [previewStats, setPreviewStats] = useState<any>(null);

  // Detect guest data for merging
  React.useEffect(() => {
    const checkGuestData = async () => {
        try {
            const preview = await syncService.previewMerge();
            if (preview && (preview.details.length > 0 || preview.stats.topics > 0)) {
                setHasGuestData(true);
                setPreviewStats(preview);
            } else {
                setHasGuestData(false);
            }
        } catch (err) {
            console.error('Error checking guest data:', err);
        }
    };
    if (isAuthenticated) {
        checkGuestData();
    }
  }, [isAuthenticated]);

  const avatars = [
    { id: 'fox', name: 'Fox Scholar', path: '/avatars/fox.png' },
    { id: 'owl', name: 'Wise Owl', path: '/avatars/owl.png' },
    { id: 'cat', name: 'Cyber Cat', path: '/avatars/cat.png' },
    { id: 'panda', name: 'Zen Panda', path: '/avatars/panda.png' },
    { id: 'dragon', name: 'Quest Dragon', path: '/avatars/dragon.png' },
    { id: 'deer', name: 'Magic Deer', path: '/avatars/deer.png' },
    { id: 'unicorn', name: 'Stardust Unicorn', path: '/avatars/unicorn.jpg' },
    { id: 'bunny', name: 'Flora Bunny', path: '/avatars/bunny.jpg' },
    { id: 'kitten', name: 'Galaxy Kitten', path: '/avatars/kitten.jpg' },
    { id: 'cyber_fox', name: 'Cyber Kitsune', path: '/avatars/cyber_fox.jpg' },
    { id: 'astro_bear', name: 'Astro Bear', path: '/avatars/astro_bear.jpg' },
    { id: 'scholar_koala', name: 'Scholar Koala', path: '/avatars/scholar_koala.jpg' },
  ];

  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null, message: string, details?: string[] }>({ type: null, message: '' });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [backupPreview, setBackupPreview] = useState<{ userName: string; exportDate: string; stats?: any } | null>(null);

  const handleReset = async () => {
      setShowResetConfirm(false); // Close confirmation modal immediately
      
      // VITAL: Pause sync before wiping anything to prevent race condition where
      // an empty database is backed up to cloud before the page reloads.
      syncService.pauseSync();

      const lastResetAt = Date.now();
      localStorage.setItem('last_reset_at', lastResetAt.toString());
      
      setStatus({ type: 'loading', message: 'Resetting your data...', details: [] });
      const details: string[] = [];
      
      try {
          // 1. Clear cloud data first if logged in
          if (isAuthenticated) {
              await syncService.clearCloudData(lastResetAt);
              details.push('Cloud data cleared successfully');
              setStatus(prev => ({ ...prev, details: [...details] }));
          } else {
              details.push('Cloud data skipped (not logged in)');
          }

          // 2. Reset Pomodoro timer and daily goal progress
          const timerStore = useTimerStore.getState();
          timerStore.reset(); // Reset current timer
          // Reset today's stats and session history
          const today = new Date().toISOString().split('T')[0];
          useTimerStore.setState({
            todayStats: {
              totalFocusTime: 0,
              totalBreakTime: 0,
              sessionsCompleted: 0,
              lastUpdatedDate: today,
              subjectFocusTime: {},
            },
            sessionHistory: [],
            activeSession: null,
          });
          details.push('Pomodoro timer and daily progress reset');
          setStatus(prev => ({ ...prev, details: [...details] }));

          // 3. Clear IndexedDB (progress, subject logs, etc.)
          const userId = isAuthenticated && user ? user.email : 'guest';
          await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
            const tables = [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources];
            for (const table of tables) {
                await table.where('userId').equals(userId).delete();
            }
          });
          details.push('Local database wiped clean');
          setStatus(prev => ({ ...prev, details: [...details] }));

          // 4. Clear localStorage BUT preserve authentication
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key !== 'auth-storage' && key !== 'auth-token') { 
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          details.push('App settings reset');
          details.push('Login session preserved safely');
          
          setStatus({ 
            type: 'success', 
            message: 'All done! Your data has been reset.', 
            details: [...details] 
          });
          
          // 5. Proactively re-initialize preset subjects so they exist on next load
          try {
              const { initializePresetSubjects } = await import('../../utils/initializePresetSubjects');
              await initializePresetSubjects();
          } catch (err) {
              console.error('Proactive re-init failed:', err);
          }
          
          // Reload to re-initialize stores with empty data
          setTimeout(() => window.location.reload(), 3000); // Increased delay to read details
      } catch (e: any) {
          console.error("Reset failed:", e);
          const errorMessage = e.response?.data?.message || e.message || 'Unknown error';
          setStatus({ type: 'error', message: `Failed to reset data: ${errorMessage}` });
      }
  };

  const handleMergeGuestData = async () => {
    setShowMergeConfirm(false);
    setStatus({ type: 'loading', message: 'Merging local data into account...' });
    try {
        await syncService.mergeGuestData();
        
        setHasGuestData(false);
        setStatus({ type: 'success', message: 'Smart Merge complete! Best progress saved.' });
        setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Merge failed.' });
    }
  };


  const handleExportData = async () => {
      setStatus({ type: 'loading', message: 'Preparing your backup...' });
      try {
          // Get IndexedDB data
          const subjects = await db.subjects.toArray();
          const topics = await db.topics.toArray();
          const logs = await db.logs.toArray();
          const timetable = await db.timetable.toArray();
          
          // Get all localStorage data
          const localStorageData: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) {
                  const value = localStorage.getItem(key);
                  if (value) {
                      localStorageData[key] = value;
                  }
              }
          }
          
          // Create comprehensive backup with metadata
          const data = {
              // Metadata
              version: 2,
              exportDate: new Date().toISOString(),
              userName: name,
              userAvatar: avatar,
              
              // Statistics for preview
              stats: {
                  subjectsCount: subjects.length,
                  topicsCount: topics.length,
                  logsCount: logs.length,
                  timetableCount: timetable.length,
              },
              
              // All data
              indexedDB: {
                  subjects,
                  topics,
                  logs,
                  timetable,
                  
              },
              localStorage: localStorageData,
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          // Sanitize username for filename
          const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
          link.download = `hayaquest-${sanitizedName}-${new Date().toISOString().slice(0,10)}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
          setTimeout(() => setStatus({ type: null, message: '' }), 4000);
      } catch (e) {
          console.error(e);
          setStatus({ type: 'error', message: 'Export failed. Please try again.' });
      }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setImportFile(file);
          // Try to read and preview the backup file
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const data = JSON.parse(event.target?.result as string);
                  setBackupPreview({
                      userName: data.userName || 'Unknown User',
                      exportDate: data.exportDate || 'Unknown Date',
                      stats: data.stats,
                  });
                  setShowImportConfirm(true);
              } catch (err) {
                  console.error('Failed to preview backup:', err);
                  setBackupPreview({ userName: 'Unknown', exportDate: 'Unknown' });
                  setShowImportConfirm(true);
              }
          };
          reader.readAsText(file);
      }
  };

  const handleImportData = async () => {
      if (!importFile) return;

      setStatus({ type: 'loading', message: 'Importing your data...' });
      setShowImportConfirm(false);

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              
              // Handle both old (v1) and new (v2) backup formats
              if (data.version === 2) {
                  // New format with IndexedDB and localStorage separation
                  if (data.indexedDB) {
                      if (data.indexedDB.subjects) await db.subjects.bulkPut(data.indexedDB.subjects);
                      if (data.indexedDB.topics) await db.topics.bulkPut(data.indexedDB.topics);
                      if (data.indexedDB.logs) await db.logs.bulkPut(data.indexedDB.logs);
                      if (data.indexedDB.timetable) await db.timetable.bulkPut(data.indexedDB.timetable);
                  }
                  
                  // Restore all localStorage data
                  if (data.localStorage) {
                      Object.entries(data.localStorage).forEach(([key, value]) => {
                          localStorage.setItem(key, value as string);
                      });
                  }
              } else {
                  // Legacy format (v1) - direct properties
                  if (data.subjects) await db.subjects.bulkPut(data.subjects);
                  if (data.topics) await db.topics.bulkPut(data.topics);
                  if (data.logs) await db.logs.bulkPut(data.logs);
                  if (data.timetable) await db.timetable.bulkPut(data.timetable);
              }
              
              setStatus({ type: 'success', message: 'Data imported! Reloading to apply changes...' });
              setTimeout(() => window.location.reload(), 2000);
          } catch(err) {
              console.error(err);
              setStatus({ type: 'error', message: 'Invalid backup file format.' });
          }
      };
      reader.readAsText(importFile);
  };
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in p-2 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Customize your experience and manage your data.</p>
      </div>

      {/* Personal Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3 sm:mb-6">
              <User size={20} className="text-primary" /> Personal Profile
          </h2>
          
          <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                      Display Name
                  </label>
                  <div className="relative group">
                      <input 
                          type="text" 
                          value={isAuthenticated ? user?.name : name}
                          onChange={async (e) => {
                              const newName = e.target.value;
                              if (isAuthenticated) {
                                  // Optimistic update
                                  useAuthStore.getState().updateUser({ name: newName });
                                  try {
                                      await api.put('/auth/profile', { name: newName });
                                  } catch (err) {
                                      console.error('Failed to update name', err);
                                  }
                              } else {
                                  setName(newName);
                              }
                          }}
                          placeholder="Enter your name"
                          className="w-full bg-gray-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white font-bold transition-all outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-primary transition-colors">
                           <User size={18} />
                      </div>
                  </div>
                   <p className="mt-2 text-[10px] text-gray-400 font-medium">This is how HayaQuest will address you across the app.</p>
               </div>

               <div>
                   <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 block">
                       Choose Your Avatar
                   </label>
                   <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-6 md:gap-4 md:pb-0 custom-scrollbar scroll-smooth snap-x">
                       {avatars.map((av) => (
                           <button
                               key={av.id}
                               onClick={() => setAvatar(av.id)}
                               className={clsx(
                                   "relative aspect-square w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all group shrink-0 snap-center",
                                   avatar === av.id ? "border-primary scale-105 md:scale-110 shadow-lg shadow-primary/20" : "border-transparent bg-slate-100 dark:bg-slate-900/50 hover:scale-105"
                               )}
                           >
                               <img 
                                 src={av.path.startsWith('http') ? av.path : av.path} 
                                 alt={av.name} 
                                 className={clsx(
                                   "w-full h-full object-cover transition-transform",
                                   avatar === 'deer' ? "scale-[1.3] translate-y-1" : 
                                   ['unicorn', 'kitten', 'fairy', 'bunny'].includes(avatar) ? "scale-[1.25]" : "scale-110"
                                 )} 
                               />
                               {avatar === av.id && (
                                   <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                       <Check size={16} className="text-white drop-shadow-md sm:w-6 sm:h-6" strokeWidth={4} />
                                   </div>
                               )}
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       </div>

       {/* Study Goals */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3 sm:mb-6">
              <Target size={20} className="text-primary" /> Study Goals
          </h2>
           
           <div className="space-y-6">
               <div>
                   <div className="flex justify-between items-center mb-4">
                       <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                           Daily Study Goal
                       </label>
                       <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                           {Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m
                       </span>
                   </div>
                   <input 
                       type="range"
                       min="30"
                       max="480"
                       step="15"
                       value={dailyGoalMinutes}
                       onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value))}
                       className="w-full accent-primary h-2 bg-gray-100 dark:bg-slate-900 rounded-full cursor-pointer"
                   />
                   <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                       <span>30m</span>
                       <span>4h</span>
                       <span>8h</span>
                   </div>
                   <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                       "Setting a daily goal helps build a consistent study habit. Aim for a manageable target!"
                   </p>
               </div>
           </div>
       </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3 sm:mb-6">
          </h2>
          
          <div className="space-y-6">
              {/* Core Themes */}
              <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">System Preference</p>
                  <button 
                    onClick={() => setTheme('system')}
                    className={clsx(
                        "flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all w-full", 
                        theme === 'system' 
                            ? "bg-primary text-white shadow-lg shadow-primary/30" 
                            : "bg-gray-100 dark:bg-slate-900/50 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-900"
                    )}
                  >
                      <Monitor size={18} /> System Default
                  </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Light Themes */}
                  <div className="space-y-3">
                      <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Sun size={14} /> Light Premium
                      </p>
                      <div className="flex overflow-x-auto pb-4 gap-3 sm:flex-col sm:pb-0 sm:gap-2 custom-scrollbar scroll-smooth snap-x">
                          {[
                              { id: 'light', label: 'Default', color: 'bg-white' },
                              { id: 'light-sakura', label: 'Sakura', color: 'bg-rose-100' },
                              { id: 'light-ocean', label: 'Oceanic', color: 'bg-blue-100' },
                              { id: 'light-forest', label: 'Forest', color: 'bg-emerald-100' },
                              { id: 'light-lilac', label: 'Lilac', color: 'bg-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
                          ].map((t) => (
                              <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={clsx(
                                    "relative flex-shrink-0 snap-center flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-0 w-20 h-20 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all border-2",
                                    theme === t.id 
                                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10 scale-105 sm:scale-100" 
                                        : "border-transparent bg-gray-50 dark:bg-slate-900/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900/50"
                                )}
                              >
                                  <span className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                      <div className={clsx("w-6 h-6 sm:w-4 sm:h-4 rounded-full border border-gray-200 shadow-sm", t.color)} />
                                      <span className="truncate max-w-[60px] sm:max-w-none">{t.label}</span>
                                  </span>
                                  {theme === t.id && <div className="absolute top-1 right-1 sm:static w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Dark Themes */}
                  <div className="space-y-3">
                      <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Moon size={14} /> Dark Premium
                      </p>
                      <div className="flex overflow-x-auto pb-4 gap-3 sm:flex-col sm:pb-0 sm:gap-2 custom-scrollbar scroll-smooth snap-x">
                          {[
                              { id: 'dark', label: 'Default', color: 'bg-slate-800' },
                              { id: 'dark-violet', label: 'Violet', color: 'bg-[#6F00FF] shadow-[0_0_15px_rgba(111,0,255,0.4)]' },
                              { id: 'dark-aurora', label: 'Aurora', color: 'bg-teal-900 shadow-[0_0_10px_rgba(45,212,191,0.2)]' },
                              { id: 'dark-galaxy', label: 'Galaxy', color: 'bg-indigo-950 shadow-[0_0_10px_rgba(129,140,248,0.3)]' },
                              { id: 'dark-amethyst', label: 'Amethyst', color: 'bg-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
                          ].map((t) => (
                              <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={clsx(
                                    "relative flex-shrink-0 snap-center flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-0 w-20 h-20 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all border-2",
                                    theme === t.id 
                                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10 scale-105 sm:scale-100" 
                                        : "border-transparent bg-gray-50 dark:bg-slate-900/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900/50"
                                )}
                              >
                                  <span className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                      <div className={clsx("w-6 h-6 sm:w-4 sm:h-4 rounded-full border border-white/10 shadow-sm", t.color)} />
                                      <span className="truncate max-w-[60px] sm:max-w-none">{t.label}</span>
                                  </span>
                                  {theme === t.id && <div className="absolute top-1 right-1 sm:static w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Retro Themes - New Section */}
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="col-span-full mt-4 mb-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} /> Retro 90's (Nostalgic)
                      </h4>
                  </div>
                  {[
                      { id: 'light-retro', label: 'Classic 95', color: 'bg-gray-300 border-2 border-white border-r-gray-500 border-b-gray-500 shadow-none' },
                      { id: 'dark-retro', label: 'Midnight 90s', color: 'bg-slate-900 border-2 border-slate-700 border-r-black border-b-black shadow-none' },
                  ].map((t) => (
                      <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={clsx(
                              "relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all group",
                              theme === t.id 
                                  ? "bg-white dark:bg-slate-800 border-primary shadow-lg ring-4 ring-primary/10" 
                                  : "bg-gray-50/50 dark:bg-slate-900/50 border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                          )}
                      >
                          <div className={clsx("w-12 h-12 rounded-xl", t.color)} />
                          <span className={clsx("text-xs font-bold", theme === t.id ? "text-primary" : "text-slate-600 dark:text-slate-400")}>
                              {t.label}
                          </span>
                          {theme === t.id && (
                              <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-md animate-in zoom-in">
                                  <Check size={12} strokeWidth={4} />
                              </div>
                          )}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Data Management */}
       <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 relative overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Download size={20} className="text-primary" /> Data Management
          </h2>

          {/* Status Modal Overlay */}
          {status.type && (
              <div className={clsx(
                  "fixed inset-0 z-[110] flex items-center justify-center p-6 text-center animate-in fade-in duration-300",
                  "bg-slate-950/40 backdrop-blur-md"
              )}>
                  <div className={clsx(
                      "bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border max-w-sm w-full animate-in zoom-in-95",
                      status.type === 'success' ? "border-emerald-500/30" : status.type === 'error' ? "border-red-500/30" : "border-primary/30"
                  )}>
                      <div className="flex flex-col items-center gap-4">
                          <div className={clsx(
                              "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                              status.type === 'loading' ? "bg-primary/10" : 
                              status.type === 'success' ? "bg-emerald-100 dark:bg-emerald-900/30" : 
                              "bg-red-100 dark:bg-red-900/30"
                          )}>
                              {status.type === 'loading' && <Loader2 size={32} className="text-primary animate-spin" />}
                              {status.type === 'success' && <CheckCircle2 size={32} className="text-emerald-500" />}
                              {status.type === 'error' && <XCircle size={32} className="text-red-500" />}
                          </div>
                          
                          <h3 className={clsx(
                              "font-bold text-lg",
                              status.type === 'success' ? "text-emerald-600 dark:text-emerald-400" :
                              status.type === 'error' ? "text-red-600 dark:text-red-400" :
                              "text-gray-900 dark:text-white"
                          )}>
                              {status.type === 'loading' ? 'Processing...' : status.type === 'success' ? 'Success!' : 'Oops!'}
                          </h3>
                          
                          
                          {status.type === 'success' && status.details && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 w-full text-left space-y-2 mt-2">
                                {status.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        {detail}
                                    </div>
                                ))}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{status.message}</p>
                          
                          {status.type !== 'loading' && (
                              <button 
                                onClick={() => setStatus({ type: null, message: '' })}
                                className="mt-4 w-full py-3 px-6 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                  Got it
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* Import Confirmation Modal */}
          {showImportConfirm && (
             <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-primary/20 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
                     <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary rotate-3">
                         <Upload size={32} />
                     </div>
                     <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-2">Restore Backup?</h3>
                     
                     {/* Backup Preview Info */}
                     {backupPreview && (
                         <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 text-left space-y-3">
                             <div className="flex items-center gap-3">
                                 <User size={16} className="text-primary" />
                                 <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Backup Owner</p>
                                     <p className="text-sm font-bold text-gray-900 dark:text-white">{backupPreview.userName}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <Download size={16} className="text-primary" />
                                 <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Export Date</p>
                                     <p className="text-sm font-bold text-gray-900 dark:text-white">
                                         {new Date(backupPreview.exportDate).toLocaleString('en-US', { 
                                             dateStyle: 'medium', 
                                             timeStyle: 'short' 
                                         })}
                                     </p>
                                 </div>
                             </div>
                             {backupPreview.stats && (
                                 <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Data Summary</p>
                                     <div className="grid grid-cols-2 gap-2 text-xs">
                                         <div className="bg-white dark:bg-slate-900 rounded-lg p-2">
                                             <span className="font-bold text-primary">{backupPreview.stats.subjectsCount}</span>
                                             <span className="text-gray-500 ml-1">Subjects</span>
                                         </div>
                                         <div className="bg-white dark:bg-slate-900 rounded-lg p-2">
                                             <span className="font-bold text-primary">{backupPreview.stats.topicsCount}</span>
                                             <span className="text-gray-500 ml-1">Topics</span>
                                         </div>
                                         <div className="bg-white dark:bg-slate-900 rounded-lg p-2">
                                             <span className="font-bold text-primary">{backupPreview.stats.logsCount}</span>
                                             <span className="text-gray-500 ml-1">Logs</span>
                                         </div>
                                         <div className="bg-white dark:bg-slate-900 rounded-lg p-2">
                                             <span className="font-bold text-primary">{backupPreview.stats.timetableCount}</span>
                                             <span className="text-gray-500 ml-1">Schedule</span>
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                     
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                         This will restore all data from this backup, including profile settings, progress, and achievements.
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={() => { setShowImportConfirm(false); setImportFile(null); setBackupPreview(null); }}
                            className="py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                         >
                             Cancel
                         </button>
                         <button 
                            onClick={handleImportData}
                            className="py-3.5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                         >
                             Confirm
                         </button>
                     </div>
                 </div>
             </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
              {/* Local Backup Box */}
              <button 
                onClick={handleExportData}
                disabled={status.type === 'loading'}
                className="relative group flex flex-col items-center justify-center p-2 sm:p-5 bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all disabled:opacity-50 overflow-hidden"
              >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
                    <Download size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight sm:tracking-widest">Backup</span>
              </button>

              {/* Local Restore Box */}
              <label 
                className={clsx(
                    "relative group flex flex-col items-center justify-center p-2 sm:p-5 bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer overflow-hidden",
                    status.type === 'loading' && "opacity-50 pointer-events-none"
                )}
              >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight sm:tracking-widest">Restore</span>
                  <input type="file" accept=".json" onChange={onFileSelect} className="hidden" onClick={(e) => (e.currentTarget.value = '')} />
              </label>

              {/* Drive Backup Box */}
              <button 
                onClick={() => setStatus({ type: 'error', message: 'Google Drive integration is currently in preview.' })}
                className="relative group flex flex-col items-center justify-center p-2 sm:p-5 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10 rounded-2xl sm:rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all overflow-hidden"
              >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-blue-500 mb-1.5 sm:mb-2 group-hover:rotate-12 transition-transform">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="sm:w-5 sm:h-5">
                        <path d="M7.71,3.5L1.15,15L4.58,21L11.13,9.5L7.71,3.5Z" fill="#0066DA" />
                        <path d="M16.19,3.5L9.63,15L13.06,21L19.62,9.5L16.19,3.5Z" fill="#00AC47" />
                        <path d="M12.87,9L9.44,15L16,15L19.43,9L12.87,9Z" fill="#F8B600" />
                    </svg>
                  </div>
                  <span className="text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight sm:tracking-widest">Drive</span>
              </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 text-white border border-white/10 shadow-2xl">
                  {/* Background Decoration */}
                  <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                  
                  {/* Top Section: Status & Info */}
                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-white/5 pb-6 sm:pb-8">
                      <div className={clsx(
                          "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-inner transition-all duration-500 shrink-0",
                          syncStatus.isSyncing && "rotate-[360deg] scale-90 border-indigo-500/50 shadow-indigo-500/20"
                      )}>
                          <Cloud size={28} className={clsx("sm:w-9 sm:h-9", syncStatus.isSyncing ? "text-indigo-400 animate-pulse" : "text-white/80")} />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col gap-1 items-center sm:items-start">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                                <h3 className="font-black text-xl sm:text-2xl tracking-tight text-white">HayaQuest Cloud</h3>
                                {isAuthenticated ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_currentColor]" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-600/30">
                                        Offline
                                    </span>
                                )}
                              </div>
                              
                              <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed w-full">
                                  {isAuthenticated 
                                      ? <span className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2">
                                          <span>Mirrored to</span>
                                          <span className="text-white font-bold bg-white/10 px-2 py-1 rounded-lg text-[11px] break-all">{user?.email}</span>
                                        </span>
                                      : "Unlock real-time mirroring across all your devices."}
                              </p>
                          </div>
                          
                          {isAuthenticated && syncStatus.lastSyncTime && (
                              <div className="mt-4 sm:mt-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-indigo-400" />
                                    <span>Last Sync: <span className="text-slate-400">{new Date(syncStatus.lastSyncTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                                  </div>
                                  {hasGuestData && <span className="text-amber-400/80 hidden sm:inline">•</span>}
                                  {hasGuestData && <span className="text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 sm:bg-transparent sm:border-none sm:p-0">Guest Data Found</span>}
                              </div>
                          )}

                          {isAuthenticated && syncStatus.error && (
                              <div className="mt-2 text-[10px] font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  <span>{syncStatus.error}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Bottom Section: Actions */}
                  <div className="relative">
                      {!isAuthenticated ? (
                          <button
                              onClick={() => setShowLoginModal(true)}
                              className="w-full py-4 px-6 bg-white text-slate-950 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                          >
                              <Play size={16} fill="currentColor" /> Sync Now
                          </button>
                      ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {hasGuestData && (
                                  <button
                                      onClick={() => setShowMergeConfirm(true)}
                                      className="py-3.5 px-5 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-indigo-400/20"
                                  >
                                      <RefreshCw size={18} className="animate-spin-slow" /> 
                                      <span>Merge Data</span>
                                  </button>
                              )}
                              <button
                                  onClick={() => setShowLogoutConfirm(true)}
                                  className={clsx(
                                    "py-3.5 px-5 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 border",
                                    hasGuestData 
                                        ? "bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-white/5 hover:text-white" 
                                        : "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20 w-full sm:col-span-2" 
                                  )}
                              >
                                  <LogOut size={18} />
                                  <span>Logout</span>
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </motion.div>

          {/* Login Modal */}
          <AnimatePresence>
            {showLoginModal && (
              <LoginModal 
                onClose={() => setShowLoginModal(false)}
              />
            )}
          </AnimatePresence>

          {/* Logout Confirmation */}
          {showLogoutConfirm && (
            <LogoutConfirmModal
                onClose={() => setShowLogoutConfirm(false)}
            />
          )}

          {/* Merge Confirmation Modal */}
          {showMergeConfirm && previewStats && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="relative p-5 sm:p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/10">
                        <div className="absolute top-4 right-4 text-indigo-500/20">
                            <RefreshCw size={48} className="sm:w-16 sm:h-16" />
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-3 sm:mb-4 shadow-inner">
                            <RefreshCw size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Smart Merge</h3>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                            We found progress from your guest session. Let's merge it!
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                        {/* Subject Cards List */}
                        {previewStats.details.length > 0 ? (
                            <div className="space-y-2 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
                                {previewStats.details.map((stat: any) => (
                                    <div key={stat.name} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">{stat.name}</span>
                                            <span className="text-[10px] sm:text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                Result: {stat.result}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <span>Guest</span>
                                                <div className="h-1 sm:h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gray-400 rounded-full transition-all" style={{ width: `${stat.guest}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-gray-300 mb-[-8px] sm:mb-[-12px]">→</span>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <span>Merged</span>
                                                <div className="h-1 sm:h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stat.result}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                                <p className="text-xs sm:text-sm text-gray-500">No conflicting subject progress found. Safe to merge!</p>
                            </div>
                        )}

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-2 sm:p-3 bg-gray-50 dark:bg-slate-800/30 rounded-xl">
                                <span className="block text-lg sm:text-xl font-black text-gray-900 dark:text-white">{previewStats.stats.topics}</span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Topics</span>
                            </div>
                            <div className="p-2 sm:p-3 bg-gray-50 dark:bg-slate-800/30 rounded-xl">
                                <span className="block text-lg sm:text-xl font-black text-gray-900 dark:text-white">{previewStats.stats.logs}</span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logs</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400">
                                <Check size={10} strokeWidth={3} className="sm:w-3 sm:h-3" />
                            </div>
                            <p className="text-[10px] sm:text-xs font-medium text-emerald-800 dark:text-emerald-200/80 leading-relaxed">
                                <strong className="block text-emerald-900 dark:text-emerald-100 mb-0.5">Best Progress Wins</strong>
                                We always keep the higher completion percentage. Nothing will be lost or overwritten with lower progress.
                            </p>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-5 sm:p-6 pt-2 grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={() => setShowMergeConfirm(false)}
                            className="py-3 px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMergeGuestData}
                            className="py-3 px-4 bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Confirm Merge
                        </button>
                    </div>
                </div>
            </div>
          )}
      </div>

      {/* Danger Zone */}
       <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-red-100 dark:border-red-900/30">
          <h2 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="sm:w-5 sm:h-5" /> Danger Zone
          </h2>
          
          {!showResetConfirm ? (
            <div className="flex items-center justify-between">
                <p className="text-sm text-red-600/70 dark:text-red-400/70 font-medium">Irreversible action. Be careful.</p>
                <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="px-5 py-2.5 bg-white dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl font-bold shadow-sm hover:shadow-md transition-all border border-red-100 dark:border-red-900/30"
                >
                    Reset All Data
                </button>
            </div>
          ) : (
             <div className="fixed inset-0 z-[120] bg-red-950/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_32px_64px_-12px_rgba(220,38,38,0.3)] border border-red-500/20 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                     <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                         <AlertCircle size={32} />
                     </div>
                     <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-2">Erase Everything?</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                         This action cannot be undone. All your progress, logs, and settings will be permanently deleted from this browser.
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={() => setShowResetConfirm(false)}
                            className="py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                         >
                             Cancel
                         </button>
                         <button 
                            onClick={handleReset}
                            className="py-3.5 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                         >
                             Yes, Delete
                         </button>
                     </div>
                 </div>
             </div>
          )}
      </div>

      <AnimatePresence>
          {showLoginModal && (
              <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
          {showLogoutConfirm && (
              <LogoutConfirmModal onClose={() => setShowLogoutConfirm(false)} />
          )}
      </AnimatePresence>
    </div>
  );
};
