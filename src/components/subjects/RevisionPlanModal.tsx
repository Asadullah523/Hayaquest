import React, { useState } from 'react';
import { X, Calendar, Target } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import type { Subject } from '../../types';

interface RevisionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

export const RevisionPlanModal: React.FC<RevisionPlanModalProps> = ({ isOpen, onClose, subject }) => {
  const { createRevisionPlan } = useSubjectStore();
  const [duration, setDuration] = useState(30);
  const [planType, setPlanType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (subject.id) {
        await createRevisionPlan(subject.id, duration, planType);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create revision plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEndDate = () => {
    const start = new Date();
    let end = new Date();
    
    if (planType === 'daily') {
      end.setDate(start.getDate() + duration);
    } else if (planType === 'weekly') {
      end.setDate(start.getDate() + (duration * 7));
    } else {
      end.setMonth(start.getMonth() + duration);
    }
    
    return end.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <Target className="text-primary" size={20} />
              Create Revision Plan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              for {subject.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Duration Input */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Duration
            </label>
            <input
              type="number"
              min="1"
              max={planType === 'daily' ? 365 : planType === 'weekly' ? 52 : 12}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              required
            />
          </div>

          {/* Plan Type Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              Plan Type
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPlanType(type as any)}
                  className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    planType === type
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-blue-700 dark:text-blue-400 mb-1.5 sm:mb-2">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Plan Summary</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed">
              You'll study <strong>{subject.name}</strong> for <strong>{duration} {planType === 'daily' ? 'days' : planType === 'weekly' ? 'weeks' : 'months'}</strong>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-1.5 sm:mt-2">
              Starting today, ending approximately on <strong>{getEndDate()}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
