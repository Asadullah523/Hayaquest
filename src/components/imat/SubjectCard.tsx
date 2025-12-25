import React from 'react';
import { useSubjectStore } from '../../store/useSubjectStore';
import type { Subject, Topic } from '../../types';
import { ArrowRight, Trophy } from 'lucide-react';

interface SubjectCardProps {
    subject: Subject;
    onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
    const { topics, subjects } = useSubjectStore();
    
    // Get all child chapters/subjects
    const childSubjects = subjects.filter(s => s.parentId === subject.id);
    
    // Get topics from this subject AND all child subjects (chapters)
    const allRelevantSubjectIds = [subject.id, ...childSubjects.map(s => s.id!)];
    const subjectTopics = topics.filter((t: Topic) => 
        t.subjectId && allRelevantSubjectIds.includes(t.subjectId)
    );
    
    const completedCount = subjectTopics.filter((t: Topic) => t.isCompleted).length;
    const totalCount = subjectTopics.length;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div 
            onClick={onClick}
            className="group relative glass-card p-2 md:p-6 rounded-xl md:rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            {/* Background Decoration */}
            <div 
                className="absolute -right-6 -top-6 md:-right-8 md:-top-8 w-16 md:w-40 h-16 md:h-40 rounded-full opacity-5 blur-xl transition-all group-hover:opacity-10 group-hover:scale-110"
                style={{ backgroundColor: subject.color }}
            />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-1 md:mb-6">
                    <div 
                        className="w-7 h-7 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center text-sm md:text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${subject.color}15`, color: subject.color }} // tinted bg
                    >
                        {subject.icon}
                    </div>
                    
                    {percentage === 100 && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-0.5 md:p-2 rounded-full text-yellow-600 dark:text-yellow-400">
                            <Trophy className="w-2.5 md:w-5 h-2.5 md:h-5 fill-current" />
                        </div>
                    )}
                </div>

                <h3 className="text-[10px] md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-2 truncate">{subject.name}</h3>
                
                <div className="flex items-end justify-between mb-1 md:mb-2 text-gray-500 dark:text-gray-400">
                    <span className="text-sm md:text-3xl font-extrabold" style={{ color: subject.color }}>{percentage}%</span>
                    <span className="text-[7px] md:text-xs font-medium mb-0.5 md:mb-1.5">{completedCount}/{totalCount}</span>
                </div>

                {/* Progress Bar */}
                <div className="h-0.5 md:h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                        style={{ width: `${percentage}%`, backgroundColor: subject.color }}
                    />
                </div>

                {/* Hover Action - Hide on mobile for space */}
                <div className="hidden md:flex mt-3 md:mt-6 items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    View Progress <ArrowRight className="w-3 md:w-4 h-3 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};
