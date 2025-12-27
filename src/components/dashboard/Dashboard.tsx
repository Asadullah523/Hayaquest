import React, { useEffect, useState, useMemo } from 'react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { 
  ArrowRight,
  Book,
  Clock,
  Trophy,
  Calendar,
  Sparkles,
  Flame,
  Brain,
  Target
} from 'lucide-react';
import { TimerWidget } from '../timer/TimerWidget';
import { DailyTasksWidget } from './DailyTasksWidget';
import { SessionStats } from '../timer/SessionStats';
import { DailyProgressLights } from './DailyProgressLights';
import { useLogStore } from '../../store/useLogStore';
import { RecentActivity } from './RecentActivity';
import { useUserStore } from '../../store/useUserStore';
import { getHourlyQuote } from '../../data/heroQuotes';
import { useTimetableStore } from '../../store/useTimetableStore';
import { SessionsModal } from './SessionsModal';
import { AchievementsModal } from './AchievementsModal';
import { DailyPlanModal } from './DailyPlanModal';
import { useGamificationStore } from '../../store/useGamificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { GoalProgressWidget } from './GoalProgressWidget';
import { StudyTracksWidget } from './StudyTracksWidget';

export const Dashboard: React.FC = () => {
  const { subjects, topics, loadSubjects, loadAllTopics, getDailyTasks } = useSubjectStore();
  const { streak, loadAllLogs, calculateStreak, logs } = useLogStore();
  const { slots, loadTimetable } = useTimetableStore();
  const { name: localName, avatar } = useUserStore();
  const { user, isAuthenticated } = useAuthStore();
  const displayName = isAuthenticated ? user?.name : localName;
  const { unlockBadge } = useGamificationStore();
  const [quote, setQuote] = useState(getHourlyQuote());
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDailyPlanModal, setShowDailyPlanModal] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      await loadSubjects();
      await loadAllTopics();
      await loadAllLogs();
      await calculateStreak();
      await loadTimetable();
    };
    bootstrap();

    const interval = setInterval(() => {
        setQuote(getHourlyQuote());
    }, 60000 * 60);
    return () => clearInterval(interval);
  }, [loadSubjects, loadAllTopics, loadAllLogs, calculateStreak, loadTimetable]);

  const imatParent = subjects.find(s => s.name === 'IMAT Prep');
  
  const calculateProgress = (parentId?: number) => {
    const childSubjects = subjects.filter(s => s.parentId === parentId);
    if (childSubjects.length === 0) return 0;
    const childIds = childSubjects.map(s => s.id).filter(Boolean);
    const chapters = subjects.filter(s => s.parentId && childIds.includes(s.parentId));
    const chapterIds = chapters.map(c => c.id).filter(Boolean);
    const allRelevantIds = [...childIds, ...chapterIds];
    const subjectTopics = topics.filter(t => t.subjectId && allRelevantIds.includes(t.subjectId));
    if (subjectTopics.length === 0) return 0;
    const completed = subjectTopics.filter(t => t.isCompleted).length;
    return Math.round((completed / subjectTopics.length) * 100);
  };

  const imatProgress = calculateProgress(imatParent?.id);
  const today = new Date().getDay();
  const todaySlots = slots.filter(s => s.dayOfWeek === today);
  
  const dailyTasks = useMemo(() => getDailyTasks(), [getDailyTasks, topics]);
  const todaysPlanCount = dailyTasks.length + todaySlots.length;

  const todaysSessionsCount = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return logs.filter((log: any) => log.timestamp >= startOfToday.getTime()).length;
  }, [logs]);

  useEffect(() => {
    if (streak >= 7) unlockBadge('streak_7');
  }, [streak, unlockBadge]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

    return (
      <div className="page-transition space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8">
      {showAchievementsModal && <AchievementsModal onClose={() => setShowAchievementsModal(false)} />}
      {showSessionsModal && <SessionsModal onClose={() => setShowSessionsModal(false)} />}
      {showDailyPlanModal && <DailyPlanModal onClose={() => setShowDailyPlanModal(false)} />}

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="flex-1 glass-card rounded-xl sm:rounded-2xl md:rounded-[2.5rem] px-3 py-2 sm:px-4 sm:py-3 md:p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-4 md:gap-8">
              <div className="space-y-1 sm:space-y-2 md:space-y-3 w-full">
                 <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px] bg-white/50 dark:bg-slate-900/50 w-fit px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    <Sparkles size={12} className="text-primary sm:w-3.5 sm:h-3.5" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                 </div>
                 <div className="flex flex-row items-center gap-1.5 sm:gap-2 md:gap-4 lg:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 sm:border-3 md:border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden shrink-0 animate-float">
                      <img 
                        key={avatar}
                        src={avatar === 'neutral' ? 'https://api.dicebear.com/7.x/bottts/svg?seed=neutral' : 
                             avatar === 'owl' ? '/avatars/owl.png' :
                             ['fox', 'cat', 'panda', 'dragon', 'deer', 'unicorn', 'bunny', 'kitten', 'cyber_fox', 'astro_bear', 'scholar_koala'].includes(avatar) ? 
                             `/avatars/${avatar}.${['unicorn', 'bunny', 'kitten', 'fairy', 'cyber_fox', 'astro_bear', 'scholar_koala'].includes(avatar) ? 'jpg' : 'png'}` :
                             `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`}
                        alt="Avatar" 
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-in-out hover:scale-110 animate-in fade-in zoom-in duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=neutral';
                        }}
                      />
                    </div>
                     <div className="flex flex-col flex-1 min-w-0">
                       <div className="flex flex-wrap items-baseline gap-0.5 sm:gap-1 md:gap-2 mb-0.5 sm:mb-1 md:mb-2">
                         <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white tracking-tight leading-none drop-shadow-sm" style={{ fontFamily: "'Amatic SC', cursive" }}>
                           {getGreeting()},
                         </h1>
                         <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white tracking-tight leading-none drop-shadow-sm" style={{ fontFamily: "'Dancing Script', cursive" }}>
                           <span className="relative inline-block text-primary">
                             {displayName}!
                             <span className="absolute bottom-0 left-0 w-3/4 h-1 sm:h-1.5 md:h-2 bg-primary/40 -z-10 rounded-full"></span>
                           </span> 🚀
                         </h1>
                       </div>
                       
                       <div className="max-w-lg mt-0.5">
                         <p className="text-slate-800 dark:text-slate-200 font-medium italic leading-snug text-[10px] sm:text-xs md:text-sm lg:text-base mb-0.5">" {quote.text}"</p>
                         <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-widest opacity-80">— {quote.author}</p>
                       </div>
                     </div>
                 </div>
               </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full">
                  <div className="bg-white/80 dark:bg-slate-950/40 backdrop-blur-md px-1 sm:px-1.5 md:px-4 lg:px-6 py-0.5 sm:py-1 md:py-3 lg:py-5 rounded-md sm:rounded-lg md:rounded-2xl shadow-sm border border-white/20 dark:border-slate-700/50 flex-1">
                     <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3 lg:gap-4 mb-0.5 sm:mb-0">
                        <div className={clsx("w-4 h-4 sm:w-5 sm:h-5 md:w-10 md:h-10 lg:w-14 lg:h-14 flex-shrink-0 rounded-md sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner", streak > 0 ? "bg-orange-50 text-orange-500" : "bg-slate-50 dark:bg-slate-800 text-slate-400")}
                        >
                           <Flame size={8} fill={streak > 0 ? "currentColor" : "none"} className="sm:w-[10px] sm:h-[10px] md:w-5 md:h-5 lg:w-7 lg:h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[4px] sm:text-[5px] md:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest leading-none mb-0.5">Streak</p>
                           <p className="text-[8px] sm:text-[9px] md:text-lg lg:text-2xl font-black text-slate-900 dark:text-white truncate">{streak} Days</p>
                        </div>
                     </div>
                     <DailyProgressLights />
                  </div>

                  <GoalProgressWidget />
                </div>
             </div>
        </div>
      </div>

      {/* Study Tracks - MOBILE ONLY (PRIORITIZED BELOW GREETING) */}
      <div className="xl:hidden mt-4">
        <StudyTracksWidget subjects={subjects} topics={topics} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8 relative z-10">
        
        {/* Sidebar - Timer, SessionStats, RecentActivity on desktop */}
        <aside className="xl:col-span-4 xl:sticky xl:top-4 h-fit space-y-4 sm:space-y-6 md:space-y-8">
          <TimerWidget />
          
          {/* Stats Grid - MOBILE ONLY (shows after timer on small screens) */}
          <div className="xl:hidden">
            <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Target size={16} />
                    </div>
                    Your Study Tracks
                </h2>
                <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent dark:from-indigo-900 dark:via-purple-900 rounded-full max-w-[100px]" />
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
            {[
              { label: 'Subjects', value: subjects.filter(s => !s.parentId).length.toString(), icon: Book, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/50', link: '/subjects' },
              { label: 'Sessions', value: todaysSessionsCount.toString(), icon: Clock, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/50', action: () => setShowSessionsModal(true) },
              { label: 'Today', value: todaysPlanCount.toString(), icon: Trophy, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/50', action: () => setShowDailyPlanModal(true) },
              { label: 'IMAT', value: `${imatProgress}%`, icon: Brain, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/50', link: '/imat' },
            ].map((stat, i) => {
              const Wrapper = stat.link ? NavLink : 'div';
              const props = stat.link ? { to: stat.link } : { onClick: stat.action };
              return (
                <Wrapper key={i} {...props as any} className="glass-card rounded-lg sm:rounded-xl p-1.5 sm:p-4 text-center sm:text-left group transition-all block cursor-pointer relative overflow-hidden w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-6 h-6 sm:w-9 sm:h-9 mx-auto sm:mx-0 ${(stat as any).bg} ${stat.color} rounded-md sm:rounded-lg flex items-center justify-center mb-1 sm:mb-3 transition-transform group-hover:scale-110 shadow-sm relative z-10`}>
                    <stat.icon size={12} className="sm:w-[18px]" />
                  </div>
                  <p className="text-sm sm:text-xl font-black mb-0 relative z-10">{stat.value}</p>
                  <p className="text-[6px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest relative z-10 truncate">{stat.label}</p>
                </Wrapper>
              );
            })}
          </div>
          </div>
          
          {/* Today's Focus - MOBILE ONLY (moved here to be below cards) */}
          <section className="xl:hidden space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1 sm:px-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" /> Today's Focus
              </h2>
              <NavLink to="/timetable" className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1 transition-colors">
                View Schedule <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </NavLink>
            </div>
            <DailyTasksWidget />
          </section>

          <SessionStats />
          <RecentActivity />
        </aside>

        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-4 sm:space-y-6">
          {/* Study Tracks Section - Desktop Only */}
          <section className="hidden xl:block">
            <StudyTracksWidget subjects={subjects} topics={topics} />
          </section>

          {/* Stats Grid - DESKTOP ONLY */}
          <div className="hidden xl:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="col-span-full flex items-center justify-between px-1 mb-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Target size={18} />
                    </div>
                    Your Study Tracks
                </h2>
                <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent dark:from-indigo-900 dark:via-purple-900 rounded-full max-w-[200px]" />
            </div>

            {[
              { label: 'Total Subjects', value: subjects.filter(s => !s.parentId).length.toString(), icon: Book, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/50', shadow: 'shadow-indigo-500/20', link: '/subjects' },
              { label: 'Sessions', value: todaysSessionsCount.toString(), icon: Clock, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/50', shadow: 'shadow-emerald-500/20', action: () => setShowSessionsModal(true) },
              { label: "Today's Plan", value: todaysPlanCount.toString(), icon: Trophy, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/50', shadow: 'shadow-purple-500/20', action: () => setShowDailyPlanModal(true) },
              { label: 'IMAT Ready', value: `${imatProgress}%`, icon: Brain, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/50', shadow: 'shadow-orange-500/20', link: '/imat' },
            ].map((stat, i) => {
              const Wrapper = stat.link ? NavLink : 'div';
              const props = stat.link ? { to: stat.link } : { onClick: stat.action };
              return (
                <Wrapper key={i} {...props as any} className={`glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-left group hover:-translate-y-1 hover:shadow-xl ${(stat as any).shadow} transition-all block cursor-pointer relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${(stat as any).bg} ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg relative z-10`}>
                    <stat.icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-black mb-0.5 sm:mb-1 relative z-10">{stat.value}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
                </Wrapper>
              );
            })}
          </div>

          <section className="hidden xl:block space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1 sm:px-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" /> Today's Focus
              </h2>
              <NavLink to="/timetable" className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1 transition-colors">
                View Schedule <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </NavLink>
            </div>
            <DailyTasksWidget />
          </section>

        </div>
      </div>
    </div>
  );
};
