import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, Clock, HelpCircle, Search, Type, ChevronLeft, Moon, Sun, Bookmark, BookmarkCheck } from 'lucide-react';
import { storiesData } from '../../data/english/stories';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dictionaryData } from '../../data/english/dictionary';

export const Stories: React.FC = () => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [clickedWord, setClickedWord] = useState<{ word: string; x: number; y: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  
  // Reader Settings
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isZenMode, setIsZenMode] = useState(false);
  const [sepiaMode, setSepiaMode] = useState(false);

  const { storiesRead, markStoryAsRead, favoriteStories, toggleFavoriteStory } = useEnglishStore();

  const selectedStory = useMemo(() => storiesData.find(s => s.id === selectedStoryId), [selectedStoryId]);

  const categories = ['All', ...Array.from(new Set(storiesData.map(s => s.category)))];

  const filteredStories = useMemo(() => {
      return storiesData.filter(s => {
          const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
          const matchesDifficulty = selectedDifficulty === 'All' || s.difficulty === selectedDifficulty.toLowerCase();
          return matchesSearch && matchesCategory && matchesDifficulty;
      });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getWordDefinition = (word: string) => {
      const entry = dictionaryData.find(d => d.word.toLowerCase() === word.toLowerCase());
      return entry ? entry.meanings[0].definition : 'Definition not found in local dictionary. Try the global dictionary search.';
  };

  const renderContentWithHighlights = (content: string, difficultWords: string[]) => {
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b(${difficultWords.map(escapeRegExp).join('|')})\\b`, 'gi');
    
    return content.split('\n\n').map((paragraph, pIdx) => {
        const parts = paragraph.split(pattern);
        return (
            <p 
                key={pIdx} 
                className={`mb-6 leading-relaxed font-serif transition-all duration-300 relative
                    ${textSize === 'sm' ? 'text-base' : textSize === 'base' ? 'text-lg' : textSize === 'lg' ? 'text-xl' : 'text-2xl'}
                    ${sepiaMode ? 'text-amber-900' : 'text-slate-700 dark:text-slate-300'}
                `}
            >
                {parts.map((part, idx) => {
                    const lowerPart = part.toLowerCase();
                    if (difficultWords.includes(lowerPart)) {
                        return (
                            <span 
                                key={idx} 
                                className={`
                                    cursor-pointer font-extrabold transition-colors underline decoration-2 underline-offset-4
                                    ${sepiaMode 
                                        ? 'text-amber-800 decoration-amber-500/30 hover:text-amber-600 hover:decoration-amber-600' 
                                        : 'text-indigo-600 decoration-indigo-300 dark:text-cyan-300 dark:decoration-cyan-500/50 hover:text-indigo-500 dark:hover:text-cyan-200 hover:decoration-indigo-500 dark:drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]'}
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setClickedWord({ 
                                        word: lowerPart,
                                        x: rect.left + window.scrollX,
                                        y: rect.top + window.scrollY - 10 
                                    });
                                }}
                            >
                                {part}
                            </span>
                        );
                    }
                    return <span key={idx}>{part}</span>;
                })}
            </p>
        );
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${sepiaMode && selectedStory ? 'bg-[#f4ecd8]' : ''}`} onClick={() => setClickedWord(null)}>
      {/* Definition Popup */}
      <AnimatePresence>
        {clickedWord && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-50 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-600 max-w-sm w-72"
                style={{ 
                    left: Math.max(20, Math.min(window.innerWidth - 340, clickedWord.x - 140)),
                    top: clickedWord.y - 120 
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-xl text-slate-800 dark:text-white capitalize">{clickedWord.word}</h4>
                    <Link to="/english/dictionary" className="text-xs text-indigo-500 hover:underline">More details</Link>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-snug">{getWordDefinition(clickedWord.word)}</p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-600 rotate-45 transform"></div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-7xl mx-auto ${selectedStory ? 'px-0 py-2 md:p-8' : 'p-4 md:p-8'} ${isZenMode ? 'max-w-4xl' : ''}`}>
        
        {/* Header - Hidden in Zen Mode unless hovered */}
        {/* Header - Hidden in Zen Mode unless hovered - Also hide title on mobile if reading */}
        <div className={`flex items-center justify-between mb-4 md:mb-8 transition-opacity duration-300 ${isZenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'} ${selectedStory ? 'sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-2 md:py-0 md:bg-transparent' : ''}`}>
            <div className="flex items-center gap-4">
                {selectedStory ? (
                    <button onClick={() => setSelectedStoryId(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className={sepiaMode ? 'text-amber-900' : 'text-slate-500 dark:text-slate-400'} size={24} />
                    </button>
                ) : (
                    <Link to="/english" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft className="text-slate-500 dark:text-slate-400" />
                    </Link>
                )}
                <h1 className={`text-lg md:text-3xl font-black tracking-tight ${sepiaMode ? 'text-amber-900' : 'text-slate-800 dark:text-white'} ${selectedStory ? 'hidden md:block' : 'block'}`}>
                    {selectedStory ? (isZenMode ? '' : selectedStory.title) : 'Story Library'}
                </h1>
                {/* Mobile Title for Reader */}
                {selectedStory && (
                    <span className="md:hidden text-sm font-bold truncate max-w-[150px] opacity-70">
                         {isZenMode ? '' : selectedStory.title}
                    </span>
                )}
            </div>

            {selectedStory && (
                <div className="flex items-center gap-1 md:gap-2">
                    <button 
                        onClick={() => toggleFavoriteStory(selectedStory.id)}
                        className={`p-2 rounded-full transition-colors ${favoriteStories.includes(selectedStory.id) ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        title={favoriteStories.includes(selectedStory.id) ? "Saved for Later" : "Save for Later"}
                    >
                        {favoriteStories.includes(selectedStory.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                    <button 
                        onClick={() => setSepiaMode(!sepiaMode)}
                        className={`p-2 rounded-full transition-colors ${sepiaMode ? 'bg-amber-200 text-amber-900' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        title="Toggle Sepia Mode"
                    >
                        {sepiaMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                        onClick={() => setTextSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : 'sm')}
                        className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${sepiaMode ? 'text-amber-900' : 'text-slate-500'}`}
                        title="Change Font Size"
                    >
                        <Type size={18} />
                    </button>
                    <button 
                        onClick={() => setIsZenMode(!isZenMode)}
                        className={`hidden md:block px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            isZenMode 
                            ? 'bg-slate-800 text-white' 
                            : sepiaMode ? 'bg-amber-900/10 text-amber-900' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        }`}
                    >
                        {isZenMode ? 'Exit Zen' : 'Zen Mode'}
                    </button>
                </div>
            )}
        </div>

        {!selectedStory ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all text-xs sm:text-sm ${
                                    selectedCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>



                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar no-scrollbar">
                        {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all text-sm ${
                                    selectedDifficulty === diff
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Library Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStories.map((story) => (
                        <motion.button
                            layout
                            key={story.id}
                            onClick={() => { setSelectedStoryId(story.id); setIsZenMode(false); }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all text-left group flex flex-col h-full"
                        >
                            <div className="mb-4 flex items-start justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                        storiesRead.includes(story.id) ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {storiesRead.includes(story.id) ? 'Read' : 'New'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                        story.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-600' : 
                                        story.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                        {story.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavoriteStory(story.id);
                                        }}
                                        className={`p-2 rounded-xl transition-all ${
                                            favoriteStories.includes(story.id)
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-slate-50 text-slate-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        {favoriteStories.includes(story.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                    </button>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {story.category}
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                {story.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                                {story.summary}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} /> {story.readingTime}
                                </div>
                                <span>{story.author}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`mx-auto transition-all ${sepiaMode ? 'text-amber-900' : 'text-slate-800 dark:text-white'}`}
            >
                {/* Story Content Card */}
                <div className={`
                    rounded-xl md:rounded-[2rem] p-3 md:p-16 shadow-xl transition-all duration-500 min-h-[80vh]
                    ${sepiaMode 
                        ? 'bg-[#fdf6e3] shadow-amber-900/10' 
                        : 'bg-white dark:bg-slate-800 shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700'}
                `}>
                    <div className="text-center mb-12">
                        <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${sepiaMode ? 'text-amber-700' : 'text-indigo-500'}`}>
                            {selectedStory.category} • {selectedStory.author}
                        </span>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 sm:mb-6 font-serif">
                            {selectedStory.title}
                        </h1>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                            sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                        }`}>
                            <Clock size={16} />
                            {selectedStory.readingTime} Read
                        </div>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none mb-12">
                        {renderContentWithHighlights(selectedStory.content, selectedStory.difficultWords)}
                    </div>

                    {/* Footer Actions */}
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t ${sepiaMode ? 'border-amber-200' : 'border-slate-100 dark:border-slate-700'}`}>
                        <button
                            onClick={() => setShowQuestions(!showQuestions)}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                                sepiaMode 
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                            }`}
                        >
                            <HelpCircle size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">{showQuestions ? 'Hide Questions' : 'Test Comprehension'}</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                markStoryAsRead(selectedStory.id);
                                setSelectedStoryId(null); // Go back to library
                                setShowQuestions(false);
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors"
                        >
                            <BookOpen size={20} />
                            Finish Story
                        </button>
                    </div>

                    {/* Questions Section */}
                    <AnimatePresence>
                        {showQuestions && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-8"
                            >
                                <h3 className={`text-2xl font-bold text-center mb-6 ${sepiaMode ? 'text-amber-900' : 'text-slate-800 dark:text-white'}`}>
                                    Comprehension Check
                                </h3>
                                <div className="space-y-6">
                                    {selectedStory.questions.map((q, idx) => (
                                        <div key={q.id} className={`p-6 rounded-2xl border ${
                                            sepiaMode ? 'bg-[#fdf6e3] border-amber-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <p className={`font-bold text-lg mb-4 ${sepiaMode ? 'text-amber-900' : 'text-slate-800 dark:text-white'}`}>
                                                {idx + 1}. {q.question}
                                            </p>
                                            <div className="space-y-2">
                                                {q.options.map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                                                            sepiaMode 
                                                            ? 'border-amber-200 hover:bg-amber-100 text-amber-900' 
                                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                        }`}
                                                        onClick={(e) => {
                                                            if (optIdx === q.correctAnswer) {
                                                                e.currentTarget.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
                                                            } else {
                                                                e.currentTarget.classList.add('bg-red-50', 'border-red-500', 'text-red-700');
                                                            }
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};
