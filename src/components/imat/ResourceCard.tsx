import React, { useState } from 'react';
import type { Resource } from '../../data/imatResources';
import { BookOpen, ExternalLink, FileText, Lock, Sparkles, MonitorPlay, Trash2, AlertTriangle } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOpen = async () => {
    if (showConfirm) return; // Prevent opening if in delete mode
    
    let url = resource.url || resource.localPath;
    if (!url) {
      alert("This resource is not currently linked to a file.");
      return;
    }

    // Convert relative local paths to absolute URLs
    if (url.startsWith('/') && !url.includes('://')) {
      if (Capacitor.isNativePlatform()) {
        // On native, use the production origin so the system browser can reach them
        const liveOrigin = 'https://hayaquest.vercel.app';
        url = liveOrigin + url;
      } else {
        // On web (including local dev), use the current origin
        url = window.location.origin + url;
      }
    }

    // Use Capacitor Browser API on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ 
          url,
          windowName: '_blank',
          presentationStyle: 'fullscreen'
        });
      } catch (error) {
        console.error('Failed to open PDF:', error);
        alert('Cannot open PDF. Please ensure you have internet access and a PDF viewer app installed.');
      }
    } else {
      // Use standard window.open for web
      window.open(url, '_blank');
    }
  };

  // Determine color based on category
  const getColor = (category: string) => {
      switch (category) {
          case 'Biology': return '#22c55e'; // green-500
          case 'Chemistry': return '#3b82f6'; // blue-500
          case 'Physics': return '#f97316'; // orange-500
          case 'Math': return '#ef4444'; // red-500
          case 'Logic': return '#eab308'; // yellow-500
          case 'Past Papers': return '#3b82f6'; // blue-500 (same as Chemistry for now)
          default: return '#a855f7'; // purple-500
      }
  };

  const isPremium = resource.isFeatured || resource.isPremium;
  const color = isPremium ? '#f59e0b' : getColor(resource.category);

  return (
    <div 
        onClick={handleOpen}
        className={`group relative p-4 lg:p-4 2xl:p-6 rounded-3xl cursor-pointer hover:-translate-y-1.5 transition-all duration-300 overflow-hidden ${
          isPremium 
            ? 'bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-amber-900/30 border-2 border-amber-400/60 shadow-xl shadow-amber-500/15 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/30' 
            : 'glass-card border border-white/10'
        }`}
    >
        {/* Background Glow Decoration */}
        <div 
            className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl transition-all group-hover:scale-125 ${
              isPremium ? 'bg-amber-500/20 opacity-40 group-hover:opacity-70' : 'opacity-5 group-hover:opacity-10'
            }`}
            style={!isPremium ? { backgroundColor: color } : undefined}
        />

        {isPremium && (
          <div className="absolute top-0 right-0 z-20">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black px-3 py-1 rounded-bl-2xl text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/40">
              <Sparkles size={12} className="fill-slate-950" /> Featured
            </span>
          </div>
        )}

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4 lg:mb-3 2xl:mb-6">
                {/* Icon Container */}
                <div 
                    className={`w-12 h-12 lg:w-11 lg:h-11 2xl:w-14 2xl:h-14 rounded-2xl flex items-center justify-center text-2xl lg:text-xl 2xl:text-3xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                      isPremium ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-bold' : ''
                    }`}
                    style={!isPremium ? { backgroundColor: `${color}15`, color: color } : undefined}
                >
                    {resource.type === 'Book' && <BookOpen size={20} className="2xl:w-7 2xl:h-7" />}
                    {resource.type === 'PDF' && <FileText size={20} className="2xl:w-7 2xl:h-7" />}
                    {resource.type === 'Notes' && <FileText size={20} className="2xl:w-7 2xl:h-7" />}
                    {resource.type === 'Practice' && <Sparkles size={20} className="2xl:w-7 2xl:h-7" />}
                    {resource.type === 'Video' && <MonitorPlay size={20} className="2xl:w-7 2xl:h-7" />} 
                    {resource.type === 'Website' && <ExternalLink size={20} className="2xl:w-7 2xl:h-7" />}
                    {!['Book', 'PDF', 'Notes', 'Practice', 'Video', 'Website'].includes(resource.type) && <BookOpen size={20} className="2xl:w-7 2xl:h-7" />}
                </div>
                
                {resource.isLocked && <Lock size={20} className="text-gray-400" />}

                {/* Delete Button (Only if onDelete is provided) */}
                {onDelete && !showConfirm && (
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirm(true);
                        }}
                        className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors z-20"
                        title="Delete Resource"
                     >
                        <Trash2 size={18} />
                     </button>
                )}
                
                {/* Type Badge */}
                 <span 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isPremium ? 'mr-16' : ''}`}
                    style={{ backgroundColor: `${color}15`, color: isPremium ? '#fbbf24' : color, borderColor: `${color}30`, borderWidth: '1px' }}
                >
                    {resource.category}
                </span>
            </div>

            <h3 className={`text-lg lg:text-base 2xl:text-xl font-bold mb-1.5 lg:mb-1 2xl:mb-2 line-clamp-2 min-h-[3rem] 2xl:min-h-[3.5rem] leading-tight ${
              isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 font-extrabold' : 'text-gray-900 dark:text-white'
            }`}>
                {resource.title}
            </h3>
            
            <div className="flex items-end justify-between mb-1.5 lg:mb-1 2xl:mb-2">
                 {/* Author or Description Snippet */}
                 <span className={`text-sm lg:text-[10px] 2xl:text-base font-medium line-clamp-1 ${isPremium ? 'text-amber-200/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {resource.author || resource.type}
                 </span>
            </div>

            {/* Decorative Line */}
            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125 w-full"
                    style={{ backgroundColor: color }}
                />
            </div>

            {/* Hover Action */}
            <div className={`mt-6 lg:mt-3 2xl:mt-6 flex items-center gap-2 text-sm lg:text-xs 2xl:text-sm font-bold transition-colors ${
              isPremium ? 'text-amber-300 group-hover:text-yellow-200' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
            }`}>
                {resource.url ? 'Visit Link' : 'Open Resource'} 
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform lg:w-3.5 lg:h-3.5 2xl:w-4 2xl:h-4" />
            </div>
        </div>

        {/* In-Card Delete Confirmation Overlay */}
        {showConfirm && (
            <div className="absolute inset-0 z-30 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3 text-red-500">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Delete File?</h3>
                <p className="text-xs text-gray-400 mb-4">This cannot be undone.</p>
                
                <div className="flex gap-2 w-full">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirm(false);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-300 bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(resource.id);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-colors flex items-center justify-center gap-1"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};



