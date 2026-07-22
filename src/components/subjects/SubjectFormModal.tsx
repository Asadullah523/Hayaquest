import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Subject, Priority } from '../../types';
import { X } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
}

const COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#3b82f6', '#f43f5e', '#84cc16', '#a855f7', '#0ea5e9',
  // Neon
  '#00f3ff', // Neon Cyan
  '#ff00ff', // Neon Pink
  '#00ff41', // Neon Green
  '#fff01f', // Neon Yellow
  '#ff6700', // Neon Orange
  '#bc13fe', // Neon Purple
  // Light Neon
  '#b2ffda', // Light Neon Mint
  '#ffb7ce', // Light Neon Rose
  '#b7e9f7', // Light Neon Sky
  '#fdfd96', // Light Neon Lemon
  '#e1b1ff', // Light Neon Lavender
  '#ffd1dc', // Light Neon Peach
];

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ isOpen, onClose, editingSubject }) => {
  const { addSubject, updateSubject } = useSubjectStore();
  const { totalSubjectsCreated, updateStats } = useAchievementsStore();
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [color, setColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [targetHours, setTargetHours] = useState<number | ''>('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setPriority(editingSubject.priority);
      setColor(editingSubject.color);
      setTargetHours(editingSubject.targetHoursPerWeek || '');
    } else {
        // Reset form
        setName('');
        setPriority('medium');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setTargetHours('');
    }
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
        const subjectData = {
            name,
            priority,
            color,
            targetHoursPerWeek: targetHours ? Number(targetHours) : undefined,
            // Preserve other fields
            icon: 'book', // default
            archived: false,
            createdAt: editingSubject ? editingSubject.createdAt : Date.now(),
        };

        if (editingSubject && editingSubject.id) {
            await updateSubject(editingSubject.id, subjectData);
        } else {
            await addSubject(subjectData);
            // Increment subjects created for rewards
            updateStats({ totalSubjectsCreated: totalSubjectsCreated + 1 });
        }
        onClose();
    } catch (error) {
        console.error("Failed to save subject", error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />
        <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden transform transition-transform animate-scale-up max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700/50">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {editingSubject ? 'Edit Subject' : 'New Subject'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest px-1 mb-1.5">Subject Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white text-sm font-bold placeholder:text-gray-400"
                        placeholder="e.g. Biology"
                        autoFocus
                    />
                </div>

                {/* Priority */}
                <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest px-1 mb-1.5">Priority</label>
                     <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`flex-1 py-3 rounded-2xl text-xs font-bold capitalize transition-all ${
                                    priority === p 
                                    ? 'bg-gray-800 dark:bg-slate-700 text-white shadow-md' 
                                    : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                     </div>
                </div>

                {/* Color Selection */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest px-1 mb-1.5">Subject Color</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1 -mx-1">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-10 h-10 flex-shrink-0 rounded-full transition-all ${
                                    color === c 
                                    ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-gray-800 dark:ring-white dark:ring-offset-slate-900' 
                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>

                {/* Target Hours */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest px-1 mb-1.5">Weekly Target (Hours)</label>
                    <input 
                        type="number" 
                        value={targetHours}
                        onChange={(e) => setTargetHours(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white text-sm font-bold placeholder:text-gray-400"
                        placeholder="Optional"
                        min="0"
                    />
                </div>
                
                <div className="pt-2">
                    <button 
                        type="submit"
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm active:scale-[0.98] hover:scale-[1.02]"
                    >
                        {editingSubject ? 'Save Changes' : 'Create Subject'}
                    </button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  );

};
