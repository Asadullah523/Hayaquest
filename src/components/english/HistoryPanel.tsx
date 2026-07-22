import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, FileText, Trash2, Calendar } from 'lucide-react';
import { useWritingCheckerStore } from '../../store/useWritingCheckerStore';
import type { Draft } from '../../types/writingChecker';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft: (draft: Draft) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, onSelectDraft }) => {
  const { drafts, deleteDraft } = useWritingCheckerStore();

  const handleSelect = (draft: Draft) => {
    onSelectDraft(draft);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-slate-100 dark:border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Saved Drafts</h2>
                <p className="text-slate-500 font-medium">Your previous essays</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Clock size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No essays yet</h3>
                  <p className="text-slate-500 max-w-xs">
                    Your saved drafts and checked essays will appear here.
                  </p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <motion.div
                    key={draft.id}
                    layoutId={draft.id}
                    className="group bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => handleSelect(draft)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 flex-1 mr-4">
                        {draft.title || 'Untitled Essay'}
                      </h3>
                      {draft.statistics.healthScore > 0 && (
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                          draft.statistics.healthScore >= 90 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          draft.statistics.healthScore >= 70 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {draft.statistics.healthScore}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {draft.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(draft.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {draft.statistics.words} words
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this draft?')) {
                            deleteDraft(draft.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
              <p className="text-xs text-slate-400 font-medium">History is stored locally on your device</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
