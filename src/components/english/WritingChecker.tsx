import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, CheckCircle, Loader2, Download, Save, Trash2, BookOpen, TrendingUp, Zap, AlertCircle, Sparkles, Copy, Check, History, X, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { WritingError } from '../../types/writingChecker';
import { checkText, getCategoryColor, getSeverityIcon } from '../../services/languageToolService';
import { analyzeText, getReadabilityLevel, exportText, calculateHealthScore } from '../../utils/writingAnalyzer';
import { useWritingCheckerStore } from '../../store/useWritingCheckerStore';
import { WritingEditor, CircularProgress } from './WritingEditor';
import { HistoryPanel } from './HistoryPanel';
import clsx from 'clsx';

import { getSynonyms } from '../../services/dictionaryService';
import type { Draft } from '../../types/writingChecker';

export const WritingChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<WritingError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFixAllConfirm, setShowFixAllConfirm] = useState(false);


  const [selectedWord, setSelectedWord] = useState<{ word: string; start: number; end: number; x: number; y: number } | null>(null);
  const [synonyms, setSynonyms] = useState<string[]>([]);

  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { saveDraft, preferences } = useWritingCheckerStore();
  
  const statistics = analyzeText(text);
  const healthScore = calculateHealthScore(statistics, errors.length);
  statistics.healthScore = healthScore;
  
  const readabilityInfo = getReadabilityLevel(statistics.fleschReadingEase);

  // Auto-check with debounce
  useEffect(() => {
    if (preferences.checkAsYouType && text.trim().length > 0) {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      checkTimeoutRef.current = setTimeout(() => {
        handleCheck();
      }, 1500);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, preferences.checkAsYouType]);

  const handleCheck = async () => {
    if (!text.trim()) return;
    
    setIsChecking(true);
    try {
      const foundErrors = await checkText(text);
      setErrors(foundErrors);
    } catch (error) {
      console.error('Error checking text:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplySuggestion = (error: WritingError, replacement: string) => {
    const before = text.substring(0, error.offset);
    const after = text.substring(error.offset + error.length);
    const newText = before + replacement + after;
    setText(newText);
    
    // Calculate the length difference to shift subsequent errors
    const diff = replacement.length - error.length;
    
    // Remove the fixed error and update offsets for subsequent errors
    setErrors(prevErrors => 
      prevErrors
        .filter(e => e.id !== error.id)
        .map(e => {
          if (e.offset > error.offset) {
            return {
              ...e,
              offset: e.offset + diff,
              context: {
                ...e.context,
                offset: e.context.offset + diff // Update context offset if needed, though mostly visual
              }
            };
          }
          return e;
        })
    );
  };

  const handleSaveDraft = () => {
    saveDraft({
      title: `Draft - ${new Date().toLocaleDateString()}`,
      content: text,
      statistics,
      errors, // Save current errors with the draft
    });
    setShowHistory(true); // Open history to confirm save
  };

  const handleSelectDraft = (draft: Draft) => {
    setText(draft.content);
    // If the draft has saved errors, use them. Otherwise, clear errors (will be rechecked on edit)
    setErrors(draft.errors || []); 
  };


  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearText = () => {
    if (confirm('Are you sure you want to clear all text?')) {
      setText('');
      setErrors([]);
    }
  };

  const errorsByCategory = errors.reduce((acc, error) => {
    acc[error.category] = (acc[error.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [activeTab, setActiveTab] = useState<'write' | 'analyze'>('write');

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/english" className="p-2 md:p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl transition-colors shadow-sm border border-slate-100 dark:border-slate-700">
            <ArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Writing Checker</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Clear, professional writing via AI</p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="flex-1 md:flex-none p-2 md:p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl md:rounded-2xl transition-colors shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2 font-bold text-xs md:text-sm"
          >
            <History size={18} />
            <span>Drafts</span>
          </button>

          <button
            onClick={() => {
               if (errors.length > 0) {
                   setShowFixAllConfirm(true);
               }
            }}
            disabled={errors.length === 0}
            className="flex-1 md:flex-none p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 font-bold text-xs md:text-sm disabled:opacity-50"
          >
            <Sparkles size={18} />
            <span>Fix All</span>
          </button>

          <button
            onClick={handleCheck}
            disabled={isChecking || !text.trim()}
            className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {isChecking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {isChecking ? 'Checking' : 'Check'}
          </button>
        </div>
      </div>

       {/* Fix All Confirmation Modal */}
       {showFixAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-100 dark:border-slate-700"
          >
            <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={32} className="text-emerald-500" />
               </div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                 Auto-Fix {errors.length} Issues?
               </h3>
               <p className="text-slate-500 font-medium mb-6">
                 This will apply the top suggestion for all detected issues.
               </p>
               
               <div className="flex gap-3 w-full">
                 <button
                   onClick={() => setShowFixAllConfirm(false)}
                   className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => {
                       let currentText = text;
                       [...errors].sort((a, b) => b.offset - a.offset).forEach(error => {
                            if (error.replacements && error.replacements.length > 0) {
                                const replacement = error.replacements[0];
                                const before = currentText.substring(0, error.offset);
                                const after = currentText.substring(error.offset + error.length);
                                currentText = before + replacement + after;
                            }
                       });
                       setText(currentText);
                       setErrors([]);
                       setShowFixAllConfirm(false);
                   }}
                   className="flex-1 p-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                 >
                   Apply Fixes
                 </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Cards - Compact for Mobile */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 px-1">
        {[
          { icon: FileText, label: 'Words', value: statistics.words, color: 'text-indigo-500' },
          { icon: Zap, label: 'Chars', value: statistics.characters, color: 'text-yellow-500' },
          { icon: BookOpen, label: 'Sent', value: statistics.sentences, color: 'text-purple-500' },
          { icon: TrendingUp, label: 'Readability', value: readabilityInfo.level, color: readabilityInfo.color, isStatus: true },
          { icon: Sparkles, label: 'Tone', value: statistics.tone && statistics.tone.length > 0 ? statistics.tone[0] : '-', color: 'text-pink-500' },
        ].map((stat, i) => (
          <div key={i} className={clsx(
            "bg-white dark:bg-slate-800 p-2 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm",
            (stat.label === 'Tone' || stat.label === 'Readability') ? 'hidden md:block' : ''
          )}>
            <div className="flex items-center gap-1.5 mb-1 md:mb-2">
              <stat.icon size={12} className={clsx(stat.color, "md:w-3.5 md:h-3.5")} />
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
            </div>
            <p className={clsx(
              "font-black text-slate-800 dark:text-white truncate",
              stat.isStatus ? clsx(stat.color, "text-[9px] md:text-sm") : "text-sm md:text-2xl"
            )}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Mobile Tab View Controls */}
      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sticky top-2 z-30 shadow-md">
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-black text-[11px] transition-all ${activeTab === 'write' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <PenTool size={14} /> Write
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-black text-[11px] transition-all ${activeTab === 'analyze' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <TrendingUp size={14} /> Analyze
          {errors.length > 0 && (
            <span className="bg-rose-500 text-white min-w-[16px] h-4 px-1 rounded-full text-[8px] flex items-center justify-center animate-pulse">
              {errors.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className={`lg:col-span-2 ${activeTab !== 'write' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                Editor
              </h2>
              <div className="flex gap-1 md:gap-2">
                {[
                  { icon: Copy, title: 'Copy', onClick: handleCopyText, active: copied },
                  { icon: Save, title: 'Save', onClick: handleSaveDraft, disabled: !text.trim() },
                  { icon: Download, title: 'Export', onClick: () => exportText(text, 'txt'), disabled: !text.trim() },
                  { icon: Trash2, title: 'Clear', onClick: handleClearText, disabled: !text.trim() }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    title={action.title}
                  >
                    {action.active && action.icon === Copy ? <Check size={16} className="text-green-500" /> : <action.icon size={16} className="text-slate-500" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[400px] md:h-[600px] overflow-hidden">
              <WritingEditor
                text={text}
                setText={setText}
                errors={errors}
                onDoubleClick={async (e) => {
                  const target = e.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const word = text.substring(start, end).trim();
                  
                  if (word && /^[a-zA-Z]+$/.test(word)) {
                    setSelectedWord({ 
                      word, 
                      start,
                      end,
                      x: e.nativeEvent.offsetX, 
                      y: e.nativeEvent.offsetY 
                    });
                    
                    setSynonyms([]);
                    const syns = await getSynonyms(word);
                    setSynonyms(syns);
                  } else {
                    setSelectedWord(null);
                  }
                }}
              />
              
              {/* Synonym Popover */}
              {selectedWord && (
                 <div 
                   className="absolute z-50 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 min-w-[150px]"
                   style={{ left: Math.min(selectedWord.x, window.innerWidth - 170), top: selectedWord.y + 24 }}
                 >
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synonyms</span>
                        <button onClick={() => setSelectedWord(null)}><X size={12} className="text-slate-400" /></button>
                    </div>
                    {synonyms.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                            {synonyms.map(syn => (
                                <button
                                   key={syn}
                                   onClick={() => {
                                       const before = text.substring(0, selectedWord.start);
                                       const after = text.substring(selectedWord.end);
                                       const newText = before + syn + after;
                                       setText(newText);
                                       setSelectedWord(null);
                                   }}
                                   className="text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                                >
                                   {syn}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="px-2 text-xs text-slate-500 italic">No synonyms</p>
                    )}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className={`lg:col-span-1 ${activeTab !== 'analyze' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-full max-h-[675px] md:max-h-none">
            {/* Health Score Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
               <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-white">Health Score</h2>
                    <p className={`text-xs md:text-sm font-bold ${healthScore >= 90 ? 'text-emerald-500' : healthScore >= 70 ? 'text-yellow-500' : 'text-rose-500'}`}>
                      {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Work'}
                    </p>
                  </div>
                  <CircularProgress score={healthScore} size={50} strokeWidth={5} />
               </div>
               
               {/* Issues Summary */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <AlertCircle size={16} className="text-rose-500" />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{errors.length} Issues</span>
                 </div>
               </div>
            </div>

            {/* Detailed Categories (Mini) */}
            {errors.length > 0 && (
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto custom-scrollbar">
                {Object.entries(errorsByCategory).map(([category, count]) => (
                  <span key={category} className={`text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0 ${getCategoryColor(category as any).replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${getCategoryColor(category as any)} bg-opacity-10`}>
                    {category} {count}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
              {errors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <CheckCircle size={40} className="text-emerald-500 mb-2 opacity-20" />
                  <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">
                    {text.trim() ? 'Looking Good!' : 'Ready to Analyze'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    No issues found.
                  </p>
                </div>
              ) : (
                errors.map((error) => (
                  <motion.div
                    key={error.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-all shadow-sm"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-sm">{getSeverityIcon(error.severity)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(error.category)}`}>
                          {error.category}
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">
                          {error.message}
                        </p>
                      </div>
                    </div>

                    <div className="pl-6 space-y-2">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-[10px] text-slate-500">
                          {error.context.text.substring(0, error.context.offset)}
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold underline decoration-wavy">
                            {error.context.text.substring(error.context.offset, error.context.offset + error.context.length)}
                          </span>
                          {error.context.text.substring(error.context.offset + error.context.length)}
                      </div>

                      {error.replacements.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {error.replacements.slice(0, 3).map((replacement, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleApplySuggestion(error, replacement)}
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md font-black text-[10px] hover:bg-indigo-100"
                            >
                              {replacement}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics - Only on Desktop or when Analyzing on mobile */}
      {(text.trim() && (activeTab === 'analyze' || window.innerWidth > 1024)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8"
        >
          <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Detailed Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Readability', items: [
                { name: 'Reading Ease', value: statistics.fleschReadingEase, color: readabilityInfo.color },
                { name: 'Grade Level', value: statistics.fleschKincaidGrade },
                { name: 'Target', value: readabilityInfo.description }
              ]},
              { label: 'Structure', items: [
                { name: 'Paragraphs', value: statistics.paragraphs },
                { name: 'Avg Words/Sent', value: statistics.averageWordsPerSentence },
                { name: 'Passive Voice', value: statistics.passiveVoiceCount }
              ]},
              { label: 'Vocabulary', items: [
                { name: 'Unique Words', value: statistics.uniqueWords },
                { name: 'Diversity', value: `${statistics.words > 0 ? Math.round((statistics.uniqueWords / statistics.words) * 100) : 0}%` },
                { name: 'Weak Words', value: statistics.cliches ? statistics.cliches.length : 0 }
              ]}
            ].map((group, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</h3>
                <div className="space-y-2">
                  {group.items.map((item, j) => (
                    <div key={j} className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                      <span className={`font-black ${item.color || 'text-slate-800 dark:text-white'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <HistoryPanel 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        onSelectDraft={handleSelectDraft} 
      />
    </div>
  );
};
