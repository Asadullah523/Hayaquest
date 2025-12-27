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

    // Convert relative local paths to absolute URLs for Capacitor
    if (url.startsWith('/') && !url.includes('://')) {
      url = window.location.origin + url;
    }

    // Use Capacitor Browser API on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url });
      } catch (error) {
        console.error('Failed to open URL:', error);
        alert('Unable to open this resource.');
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
          default: return '#a855f7'; // purple-500
      }
  };

  const color = getColor(resource.category);

  return (
    <div 
        onClick={handleOpen}
        className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
        {/* Background Decoration */}
        <div 
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110"
            style={{ backgroundColor: color }}
        />

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                {/* Icon Container */}
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${color}15`, color: color }}
                >
                    {resource.type === 'Book' && <BookOpen size={28} />}
                    {resource.type === 'PDF' && <FileText size={28} />}
                    {resource.type === 'Notes' && <FileText size={28} />}
                    {resource.type === 'Practice' && <Sparkles size={28} />}
                    {resource.type === 'Video' && <MonitorPlay size={28} />} 
                    {resource.type === 'Website' && <ExternalLink size={28} />}
                    {!['Book', 'PDF', 'Notes', 'Practice', 'Video', 'Website'].includes(resource.type) && <BookOpen size={28} />}
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
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${color}10`, color: color, borderColor: `${color}20`, borderWidth: '1px' }}
                >
                    {resource.category}
                </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
                {resource.title}
            </h3>
            
            <div className="flex items-end justify-between mb-2">
                 {/* Author or Description Snippet */}
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                    {resource.author || resource.type}
                 </span>
            </div>

            {/* Decorative Line (replaces progress bar) */}
            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 w-1/3"
                    style={{ backgroundColor: color }} // Fixed width just for decoration
                />
            </div>

            {/* Hover Action */}
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {resource.url ? 'Visit Link' : 'Open Resource'} 
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
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



