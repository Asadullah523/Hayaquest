import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { SubjectVisual } from '../subjects/SubjectVisual';

interface StudyTracksWidgetProps {
  subjects: any[];
  topics: any[];
}

export const StudyTracksWidget: React.FC<StudyTracksWidgetProps> = ({ subjects, topics }) => {
  const imatParent = subjects.find(s => s.name === 'IMAT Prep');
  const mdcatParent = subjects.find(s => s.name.includes('MDCAT'));

  const calculateProgress = (parentId?: number) => {
    const childSubjects = subjects.filter(s => s.parentId === parentId);
    if (childSubjects.length === 0) return 0;
    
    // Get all relevant subject IDs (including nested children if any)
    const childIds = childSubjects.map(s => s.id).filter(Boolean);
    const chapters = subjects.filter(s => s.parentId && childIds.includes(s.parentId));
    const chapterIds = chapters.map(c => c.id).filter(Boolean);
    const allRelevantIds = [...childIds, ...chapterIds];
    
    // Get topics for these subjects
    const subjectTopics = topics.filter(t => t.subjectId && allRelevantIds.includes(t.subjectId));
    if (subjectTopics.length === 0) return 0;
    
    const completed = subjectTopics.filter(t => t.isCompleted).length;
    return Math.round((completed / subjectTopics.length) * 100);
  };

  const imatProgress = calculateProgress(imatParent?.id);

  const isSubjectNew = useSubjectStore((state) => state.isSubjectNew);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* MDCAT Card */}
        <NavLink to="/mdcat" className="group relative overflow-hidden bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-rose-950/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-1.5 sm:p-3 md:p-5 lg:p-8 border-2 border-rose-100 dark:border-rose-900/30 shadow-lg shadow-rose-500/10 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-transparent rounded-full blur-xl" />
          {mdcatParent && <SubjectVisual subject={mdcatParent} size="sm" showNewBadge={isSubjectNew(mdcatParent)} className="mb-0.5 sm:mb-1 md:mb-2 lg:mb-6 relative z-10 scale-[0.6] sm:scale-[0.7] md:scale-[0.85] origin-top-left" />}
          <h3 className="text-[9px] sm:text-[10px] md:text-sm lg:text-2xl font-black mb-0.5 bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">MDCAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[6px] sm:text-[7px] md:text-[9px] lg:text-sm mb-0.5 sm:mb-1 md:mb-3 lg:mb-8 leading-tight">Medical & Dental</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-0.5 sm:gap-2">
            <span className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full">1 Subject</span>
            <span className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs font-black text-rose-600 dark:text-rose-400 uppercase flex items-center gap-0.5 group-hover:gap-1 transition-all">Start <ArrowRight size={6} className="sm:w-[7px] sm:h-[7px] md:w-2 md:h-2 group-hover:translate-x-0.5 transition-transform" /></span>
          </div>
        </NavLink>

        {/* IMAT Card */}
        <NavLink to="/imat" className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-1.5 sm:p-3 md:p-5 lg:p-8 border-2 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-xl" />
          {imatParent && <SubjectVisual subject={imatParent} size="sm" showNewBadge={isSubjectNew(imatParent)} className="mb-0.5 sm:mb-1 md:mb-2 lg:mb-6 relative z-10 scale-[0.6] sm:scale-[0.7] md:scale-[0.85] origin-top-left" />}
          <h3 className="text-[9px] sm:text-[10px] md:text-sm lg:text-2xl font-black mb-0.5 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">IMAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[6px] sm:text-[7px] md:text-[9px] lg:text-sm mb-0.5 sm:mb-1 md:mb-3 lg:mb-8 leading-tight">International Med</p>
          
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-0.5 sm:h-1 mb-0.5 sm:mb-1 md:mb-3">
            <div 
              className="bg-emerald-500 h-0.5 sm:h-1 rounded-full transition-all duration-1000" 
              style={{ width: `${imatProgress}%` }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-0.5 sm:gap-2">
            <span className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full truncate">4 Subjects</span>
            <span className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-0.5 whitespace-nowrap group-hover:gap-1 transition-all">Go <ArrowRight size={6} className="sm:w-[7px] sm:h-[7px] md:w-2 md:h-2 group-hover:translate-x-0.5 transition-transform" /></span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
