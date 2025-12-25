import React from 'react';
import { Lightbulb, Info, BookOpen } from 'lucide-react';
import type { StudyMaterial } from '../../data/pastPapers';

interface StudyMaterialListProps {
    materials: StudyMaterial[];
}

export const StudyMaterialList: React.FC<StudyMaterialListProps> = ({ materials }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in p-1">
            {materials.map((tip) => (
                <div 
                    key={tip.id}
                    className={`
                        p-6 rounded-2xl glass-card border-none relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300
                        ${tip.type === 'tip' ? 'bg-amber-50 dark:bg-amber-900/10' : ''}
                        ${tip.type === 'note' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                        ${tip.type === 'formula' ? 'bg-purple-50 dark:bg-purple-900/10' : ''}
                    `}
                >
                    {/* Icon */}
                    <div className={`
                        absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-xl opacity-20
                        ${tip.type === 'tip' ? 'bg-amber-500 text-amber-500' : ''}
                        ${tip.type === 'note' ? 'bg-blue-500 text-blue-500' : ''}
                        ${tip.type === 'formula' ? 'bg-purple-500 text-purple-500' : ''}
                    `}>
                        {tip.type === 'tip' && <Lightbulb />}
                        {tip.type === 'note' && <Info />}
                        {tip.type === 'formula' && <BookOpen />}
                    </div>

                    <div className="relative z-10">
                        <span className={`
                            inline-block px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3
                            ${tip.type === 'tip' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                            ${tip.type === 'note' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                            ${tip.type === 'formula' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                        `}>
                            {tip.category}
                        </span>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {tip.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {tip.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
