import React, { useState, useEffect } from 'react';
import { Search, Volume2, CheckCircle, ArrowLeft, Loader2, BookOpen, Heart, Sparkles, Book } from 'lucide-react';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { fetchWordDefinition } from '../../services/dictionaryService';
import type { DictionaryEntry } from '../../types/english';
import axios from 'axios';

export const Dictionary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  
  // State for the currently displayed word
  const [currentWord, setCurrentWord] = useState<DictionaryEntry | null>(null);
  
  const { wordsLearned, favoriteWords, markWordAsLearned, toggleFavoriteWord } = useEnglishStore();

  // Fetch suggestions from Datamuse API with debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 1) {
      setApiSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const response = await axios.get(`https://api.datamuse.com/sug?s=${searchTerm}&max=10`);
        const suggestions = response.data.map((item: any) => item.word);
        setApiSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Search
  const handleSearch = async (word?: string, e?: React.FormEvent) => {
      e?.preventDefault();
      const searchWord = word || searchTerm;
      if (!searchWord.trim()) return;

      setIsLoading(true);
      setError(null);
      setCurrentWord(null);
      setShowSuggestions(false);

      try {
          const result = await fetchWordDefinition(searchWord);
          if (result) {
              setCurrentWord(result);
              setSearchTerm(searchWord);
          } else {
              setError(`Definition for "${searchWord}" not found.`);
          }
      } catch (err) {
          setError("An error occurred while fetching the definition.");
      } finally {
          setIsLoading(false);
      }
  };

  const handlePlayAudio = (url?: string) => {
    if (url) {
        new Audio(url).play();
    } else {
        // Fallback to browser synthesis
        const utterance = new SpeechSynthesisUtterance(currentWord?.word || '');
        window.speechSynthesis.speak(utterance);
    }
  };

  const isFavorite = currentWord && favoriteWords.includes(currentWord.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/english" className="p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 group">
          <ArrowLeft className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
        </Link>
        <div>
           <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 tracking-tight">
             Dictionary
           </h1>
           <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Power up your vocabulary instantly.</p>
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <form onSubmit={(e) => handleSearch(undefined, e)} className="relative group z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-2 flex items-center shadow-2xl shadow-indigo-900/5 dark:shadow-none border border-slate-100 dark:border-slate-700">
             <Search className="ml-4 text-slate-400" size={24} />
             <input
               type="text"
               placeholder="Type a word..."
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setShowSuggestions(true);
               }}
               onFocus={() => setShowSuggestions(true)}
               onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
               className="w-full px-4 py-3 sm:py-4 bg-transparent focus:outline-none text-lg sm:text-xl font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
             />
             {isFetchingSuggestions && (
               <div className="mr-4">
                 <Loader2 className="animate-spin text-indigo-400" size={20} />
               </div>
             )}
             <button 
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-[1rem] sm:rounded-[1.5rem] font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 text-sm sm:text-base"
             >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
             </button>
        </div>
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && searchTerm.length >= 1 && apiSuggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
            {apiSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={() => handleSearch(suggestion)}
                className="w-full text-left px-6 py-3 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 last:border-0"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <Book size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{suggestion}</span>
                <Sparkles size={14} className="ml-auto text-indigo-300 dark:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Content Area */}
      <div className="min-h-[400px]">
         {error ? (
             <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/20">
                 <p className="text-red-500 font-bold text-lg">{error}</p>
             </div>
         ) : currentWord ? (
             <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
                  {/* Decorative Gradient Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="p-6 sm:p-8 md:p-12 relative z-10">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                         <div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3 sm:mb-2">
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter capitalize leading-tight">
                                    {currentWord.word}
                                </h2>
                                <span className="text-lg sm:text-2xl text-slate-400 font-serif italic">{currentWord.phonetic}</span>
                            </div>
                            <button 
                              onClick={() => handlePlayAudio(currentWord.audioUrl)}
                              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors mt-1 sm:mt-2 text-sm sm:text-base"
                            >
                                <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                   <Volume2 size={16} className="sm:w-5 sm:h-5" />
                                </div>
                                Listen to pronunciation
                            </button>
                         </div>

                         <div className="flex gap-2 sm:gap-3 mt-4 md:mt-0">
                            <button
                              onClick={() => toggleFavoriteWord(currentWord.id)}
                              className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                                  isFavorite
                                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-yellow-50'
                              }`}
                            >
                              {isFavorite ? <Heart className="fill-current w-4 h-4 sm:w-5 sm:h-5" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>

                            <button
                              onClick={() => markWordAsLearned(currentWord.id)}
                              disabled={wordsLearned.includes(currentWord.id)}
                              className={`flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base ${
                                  wordsLearned.includes(currentWord.id)
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              {wordsLearned.includes(currentWord.id) ? 'Mastered' : 'Mark Mastered'}
                            </button>
                         </div>
                      </div>

                      <div className="space-y-8">
                         {currentWord.meanings.map((meaning, idx) => (
                             <div key={idx} className="group">
                                 <div className="flex items-center gap-4 mb-4">
                                     <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-black uppercase tracking-wider">
                                         {meaning.partOfSpeech}
                                     </span>
                                     <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors"></div>
                                 </div>
                                 
                                 <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-4">
                                     {meaning.definition}
                                 </p>
                                 
                                 {meaning.example && (
                                     <div className="pl-6 border-l-4 border-indigo-200 dark:border-indigo-800 my-4">
                                         <p className="text-lg text-slate-500 dark:text-slate-400 italic font-serif">
                                             "{meaning.example}"
                                         </p>
                                     </div>
                                 )}

                                 {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                                     <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                         {meaning.synonyms.length > 0 && (
                                             <div className="flex flex-wrap items-center gap-2">
                                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Synonyms</span>
                                                 {meaning.synonyms.slice(0, 3).map(syn => (
                                                     <span key={syn} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                                                         {syn}
                                                     </span>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         ))}
                      </div>
                  </div>
             </div>
         ) : (
             // Empty State / Suggestions
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <div className="md:col-span-2 text-center py-8">
                   <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="text-slate-500 font-medium">Try searching for these common words:</p>
                </div>
                {['Serendipity', 'Resilience', 'Ephemeral', 'Cognizant'].map(word => (
                    <button 
                       key={word}
                       onClick={() => handleSearch(word)}
                       className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-left group"
                    >
                        <span className="text-lg font-bold text-slate-700 dark:text-white group-hover:text-indigo-600 transition-colors">{word}</span>
                    </button>
                ))}
            </div>
         )}
      </div>
    </div>
  );
};
