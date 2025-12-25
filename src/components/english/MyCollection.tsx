import React, { useState } from 'react';
import { ArrowLeft, Book, Heart, CheckCircle, Bookmark, Trash2, Search, Clock } from 'lucide-react';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { dictionaryData } from '../../data/english/dictionary';
import { storiesData } from '../../data/english/stories';
import { motion, AnimatePresence } from 'framer-motion';

export const MyCollection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'learned' | 'reading-list'>('favorites');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    favoriteWords, 
    wordsLearned, 
    favoriteStories,
    toggleFavoriteWord,
    toggleFavoriteStory,
    markWordAsLearned
  } = useEnglishStore();

  const getWordData = (id: string) => {
    const local = dictionaryData.find(w => w.id === id);
    if (local) return local;
    return {
      id,
      word: id,
      meanings: [{ partOfSpeech: 'External Word', definition: 'Definition available in Dictionary search.' }],
      difficulty: 'intermediate'
    };
  };

  const favoriteWordsData = favoriteWords.map(getWordData);
  const learnedWordsData = wordsLearned.map(getWordData);
  const savedStoriesData = storiesData.filter(s => favoriteStories.includes(s.id));

  const filterItems = (items: any[]) => {
    return items.filter(item => 
      (item.word || item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const tabs = [
    { id: 'favorites', label: 'Favorite Words', icon: <Heart size={18} />, count: favoriteWords.length },
    { id: 'learned', label: 'Mastered Words', icon: <CheckCircle size={18} />, count: wordsLearned.length },
    { id: 'reading-list', label: 'Reading List', icon: <Bookmark size={18} />, count: favoriteStories.length },
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-8">
        <div className="flex items-center gap-4">
          <Link to="/english" className="p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 group">
            <ArrowLeft className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </Link>
          <div>
             <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 tracking-tight">
               My Collection
             </h1>
             <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Your personalized learning vault.</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-max md:w-fit mx-auto md:mx-0">
            {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] md:text-xs ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                {tab.count}
                </span>
            </button>
            ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-4 md:mt-8 px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {activeTab === 'favorites' && filterItems(favoriteWordsData).map(word => (
              <WordCard key={word.id} word={word} onRemove={() => toggleFavoriteWord(word.id)} type="favorite" />
            ))}
            
            {activeTab === 'learned' && filterItems(learnedWordsData).map(word => (
              <WordCard key={word.id} word={word} onRemove={() => markWordAsLearned(word.id)} type="learned" />
            ))}

            {activeTab === 'reading-list' && filterItems(savedStoriesData).map(story => (
              <StoryCard key={story.id} story={story} onRemove={() => toggleFavoriteStory(story.id)} />
            ))}

            {/* Empty State */}
            {((activeTab === 'favorites' && favoriteWords.length === 0) ||
              (activeTab === 'learned' && wordsLearned.length === 0) ||
              (activeTab === 'reading-list' && favoriteStories.length === 0)) && (
              <div className="col-span-full py-12 md:py-20 text-center bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 mx-1">
                <div className="bg-slate-50 dark:bg-slate-700/50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Book className="text-slate-300 dark:text-slate-600" size={32} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2">Your collection is empty</h3>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 px-4">Items you heart or save will appear here.</p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-3 px-6">
                  <Link to="/english/dictionary" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm md:text-base">
                    Explore Dictionary
                  </Link>
                  <Link to="/english/stories" className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-all text-sm md:text-base">
                    Read Stories
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const WordCard = ({ word, onRemove, type }: { word: any, onRemove: () => void, type: 'favorite' | 'learned' }) => (
  <div className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all flex flex-col justify-between h-full relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={onRemove}
        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        title="Remove"
      >
        <Trash2 size={16} />
      </button>
    </div>
    
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          word.difficulty === 'advanced' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
        }`}>
          {word.difficulty}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{word.meanings[0].partOfSpeech}</span>
      </div>
      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 capitalize">{word.word}</h3>
      <p className="text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{word.meanings[0].definition}</p>
    </div>

    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
      <Link to={`/english/dictionary`} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
        View Definition
      </Link>
      {type === 'learned' && <CheckCircle size={16} className="text-green-500" />}
      {type === 'favorite' && <Heart size={16} className="text-rose-500 fill-current" />}
    </div>
  </div>
);

const StoryCard = ({ story, onRemove }: { story: any, onRemove: () => void }) => (
  <div className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={onRemove}
        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        title="Remove from Reading List"
      >
        <Trash2 size={16} />
      </button>
    </div>

    <div className="mb-4 flex items-center justify-between">
      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">
        {story.category}
      </span>
      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase">
        <Clock size={14} /> {story.readingTime}
      </div>
    </div>

    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{story.title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">{story.summary}</p>

    <div className="mt-auto flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase">{story.author}</span>
      <Link 
        to="/english/stories" 
        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md"
      >
        Read Now
      </Link>
    </div>
  </div>
);
