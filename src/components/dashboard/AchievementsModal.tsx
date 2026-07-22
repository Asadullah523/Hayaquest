import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Zap } from 'lucide-react';
import { useGamificationStore, BADGE_DEFINITIONS } from '../../store/useGamificationStore';
import clsx from 'clsx';

interface AchievementsModalProps {
    onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
    const { unlockedBadges, level, xp } = useGamificationStore();
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">Hall of Trophies</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Level {level} Explorer • {xp} XP</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {BADGE_DEFINITIONS.map((badge) => {
                            const isUnlocked = unlockedBadges.includes(badge.id);
                            
                            return (
                                <div 
                                    key={badge.id}
                                    className={clsx(
                                        "relative group flex flex-col items-center text-center p-6 rounded-[2rem] border transition-all duration-500",
                                        isUnlocked 
                                            ? "bg-white dark:bg-slate-900 border-primary/20 shadow-lg shadow-primary/5" 
                                            : "bg-slate-50/50 dark:bg-slate-950/50 border-transparent grayscale opacity-60"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 transition-transform duration-500 group-hover:scale-110",
                                        isUnlocked ? "bg-primary/10 shadow-inner" : "bg-slate-200/50 dark:bg-slate-800/50"
                                    )}>
                                        {badge.icon}
                                    </div>
                                    
                                    <h3 className="font-black text-sm text-slate-800 dark:text-white mb-1">{badge.name}</h3>
                                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{badge.description}</p>

                                    {isUnlocked && (
                                        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 shadow-sm">
                                            <Zap size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        Keep studying to unlock all <span className="text-primary">{BADGE_DEFINITIONS.length}</span> legendary achievements!
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
