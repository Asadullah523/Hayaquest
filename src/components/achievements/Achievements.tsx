import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAchievementsStore, ACHIEVEMENT_DEFINITIONS, type AchievementCategory } from '../../store/useAchievementsStore';
import { useLogStore } from '../../store/useLogStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useTimerStore } from '../../store/useTimerStore';
import { TrophyDisplay } from './TrophyDisplay';
import { AchievementCard } from './AchievementCard';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Flame, 
  Zap, 
  ShieldCheck, 
  BookOpen,
  ChevronRight,
  Medal,
  Filter
} from 'lucide-react';

export const Achievements: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const { 
    unlockedAchievements, 
    updateStats,
    getTrophyTier 
  } = useAchievementsStore();
  
  const { streak, logs } = useLogStore();
  const { subjects, topics } = useSubjectStore();
  const { sessionHistory } = useTimerStore();
  
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Update achievement stats based on current progress
  useEffect(() => {
    const totalTopicsCompleted = topics.filter(t => t.isCompleted).length;
    
    // Count subjects that are fully completed
    const subjectsFullyCompleted = subjects.filter(subject => {
      const subjectTopics = topics.filter(t => t.subjectId === subject.id);
      if (subjectTopics.length === 0) return false;
      return subjectTopics.every(t => t.isCompleted);
    }).length;

    // Calculate long-term study hours
    const totalSecondsFromLogs = logs.reduce((acc, log) => acc + log.durationSeconds, 0);
    const totalStudyHours = Math.round((totalSecondsFromLogs) / 3600);

    // Calculate longest session from history
    const longestSessionSeconds = sessionHistory
      .filter(s => s.type === 'focus')
      .reduce((max, s) => Math.max(max, s.duration), 0);
    const longestSessionMinutes = Math.floor(longestSessionSeconds / 60);

    // High Priority Topics Completed
    const highPriorityCompleted = topics.filter(t => {
      const subject = subjects.find(s => s.id === t.subjectId);
      return t.isCompleted && subject?.priority === 'high';
    }).length;

    // Subjects with High Mastery (>80%)
    const subjectsWithHighMastery = subjects.filter(subject => {
      const subjectTopics = topics.filter(t => t.subjectId === subject.id);
      if (subjectTopics.length === 0) return false;
      const completedCount = subjectTopics.filter(t => t.isCompleted).length;
      return (completedCount / subjectTopics.length) >= 0.8;
    }).length;

    // New metrics
    const totalFocusSessions = sessionHistory.filter(s => s.type === 'focus' && s.completed).length;
    
    const earlyMorningSessions = sessionHistory.filter(s => {
      if (s.type !== 'focus' || !s.completed) return false;
      const hour = new Date(s.startTime).getHours();
      return hour >= 4 && hour < 9;
    }).length;

    const lateNightSessions = sessionHistory.filter(s => {
      if (s.type !== 'focus' || !s.completed) return false;
      const hour = new Date(s.startTime).getHours();
      return hour >= 22 || hour < 2;
    }).length;
    
    updateStats({
      currentStreak: streak,
      totalTopicsCompleted,
      subjectsFullyCompleted,
      totalStudyHours,
      totalSubjects: subjects.length,
      longestSessionMinutes,
      highPriorityCompleted,
      subjectsWithHighMastery,
      totalFocusSessions,
      earlyMorningSessions,
      lateNightSessions
    });
  }, [streak, topics, subjects, logs, sessionHistory, updateStats]);

  const trophyTier = getTrophyTier();
  
  // Categorize
  const categorizedAchievements = useMemo(() => {
    const categories: Record<AchievementCategory, any[]> = {
      'Consistency': [],
      'Productivity': [],
      'Subject Mastery': [],
      'Exam Readiness': []
    };

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      const isUnlocked = unlockedAchievements.some(u => u.achievementId === def.id);
      const unlockedData = unlockedAchievements.find(u => u.achievementId === def.id);
      
      // Filter logic
      if (filterParam === 'earned' && !isUnlocked) return;

      categories[def.category].push({
        ...def,
        unlocked: isUnlocked,
        unlockedAt: unlockedData?.unlockedAt
      });
    });

    return categories;
  }, [unlockedAchievements, filterParam]);

  // Motivational Quotes from definitions
  const motivationalQuotes = useMemo(() => {
    const quotes = ACHIEVEMENT_DEFINITIONS
      .filter(a => a.motivationalQuote)
      .map(a => a.motivationalQuote!);
    return quotes.length > 0 ? quotes : ["Focus on the process, and the results will follow."];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [motivationalQuotes.length]);

  const unlockPercentage = Math.round((unlockedAchievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100);

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'Consistency': return <Flame className="text-orange-500" />;
      case 'Productivity': return <Zap className="text-blue-500" />;
      case 'Subject Mastery': return <BookOpen className="text-purple-500" />;
      case 'Exam Readiness': return <ShieldCheck className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto px-4">
      {/* Header with Glass Hero Section - Reduced Size */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-3 sm:p-6 md:p-10 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-blue-500 blur-3xl animate-pulse" />
          <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-28 sm:w-40 h-28 sm:h-40 rounded-full bg-purple-500 blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-2 sm:mb-4 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 sm:scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <TrophyDisplay tier={trophyTier} />
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight drop-shadow-lg uppercase">
            CHAMPION'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">HALL</span>
          </h1>
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-6">
            <Medal size={12} className="text-yellow-400 sm:w-4 sm:h-4" />
            <span className="text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px]">
              Rank: <span className="text-yellow-400 font-bold">{trophyTier} Class</span>
            </span>
          </div>

          <div className="h-8 sm:h-16 flex items-center justify-center max-w-2xl mx-auto">
             <p className="text-[10px] sm:text-lg md:text-xl font-medium italic text-white/80 leading-snug sm:leading-relaxed transition-all duration-1000 animate-fade-in line-clamp-1 sm:line-clamp-2">
              "{motivationalQuotes[currentQuoteIndex]}"
            </p>
          </div>
        </div>
      </div>

      {/* Premium Stats Ribbon */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-1 sm:px-2">
        {[
          { 
            icon: <Trophy />, 
            label: 'Rewards Earned', 
            value: unlockedAchievements.length, 
            color: 'text-yellow-500', 
            bg: 'bg-yellow-50 dark:bg-yellow-900/10',
            onClick: () => {
              if (filterParam === 'earned') {
                searchParams.delete('filter');
              } else {
                searchParams.set('filter', 'earned');
              }
              setSearchParams(searchParams);
            },
            active: filterParam === 'earned'
          },
          { icon: <TrendingUp />, label: 'Current Progress', value: `${unlockPercentage}%`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { icon: <Flame />, label: 'Daily Streak', value: streak, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
          { icon: <Target />, label: 'Completed Topics', value: topics.filter(t => t.isCompleted).length, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className={`glass-card hover:scale-105 transition-all duration-300 rounded-xl sm:rounded-[2rem] p-1.5 sm:p-6 border-2 flex flex-col items-center text-center group
              ${stat.onClick ? 'cursor-pointer' : ''}
              ${stat.active ? 'border-yellow-400 bg-yellow-400/5 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : 'border-transparent shadow-lg'}`}
          >
            <div className={`w-8 h-8 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-4 transition-all duration-300 shadow-inner
              ${stat.active ? 'bg-yellow-400 text-yellow-900 scale-110 rotate-3' : `${stat.bg} ${stat.color} group-hover:scale-110`}`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 14, className: "sm:w-7 sm:h-7" })}
            </div>
            <div className={`text-xs sm:text-3xl font-black mb-0 sm:mb-1 ${stat.active ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-900 dark:text-white'}`}>
              {stat.value}
            </div>
            <div className={`text-[6px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest ${stat.active ? 'text-yellow-500/80' : 'text-slate-500 dark:text-slate-400'}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Categorized Achievement Sections */}
      <div className="space-y-12">
        {(Object.entries(categorizedAchievements) as [AchievementCategory, any[]][]).map(([category, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={category} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {category}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {list.filter(a => a.unlocked).length} / {list.length} Mastered
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" size={16} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
                {list.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={achievement.unlocked}
                    unlockedAt={achievement.unlockedAt}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(!filterParam && unlockedAchievements.length === 0) && (
        <div className="text-center py-20 glass-card rounded-[2rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Medal size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">No Achievements Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Your journey to greatness begins with your first study session. 
            Complete topics and maintain your streak to unlock rewards!
          </p>
        </div>
      )}

      {(filterParam === 'earned' && unlockedAchievements.length === 0) && (
        <div className="text-center py-20 glass-card rounded-[2rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">No Earned Rewards</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            You haven't unlocked any achievements in this category yet. Keep studying to earn your first medal!
          </p>
          <button 
            onClick={() => { searchParams.delete('filter'); setSearchParams(searchParams); }}
            className="px-6 py-2 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            View All Achievements
          </button>
        </div>
      )}
    </div>
  );
};
