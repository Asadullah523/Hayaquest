import React from 'react';
import { 
  Brain, 
  Activity, 
  BookOpen
} from 'lucide-react';
import type { Subject } from '../../types';

interface SubjectVisualProps {
  subject: Subject;
  size?: 'sm' | 'md' | 'lg';
  showNewBadge?: boolean;
  className?: string;
}

export const SubjectVisual: React.FC<SubjectVisualProps> = ({ 
  subject, 
  size = 'md', 
  className = ''
}) => {


  const getIcon = () => {
    const iconProps = {
      size: size === 'lg' ? 40 : size === 'md' ? 32 : 20,
      className: "relative z-10 drop-shadow-lg"
    };

    const name = subject.name.toLowerCase();
    


    if (name.includes('physics')) return <span className="text-[32px] sm:text-[40px] leading-none filter drop-shadow-md">⚛️</span>;
    if (name.includes('chemistry')) return <span className="text-[32px] sm:text-[40px] leading-none filter drop-shadow-md">🧪</span>;
    if (name.includes('biology')) return <span className="text-[32px] sm:text-[40px] leading-none filter drop-shadow-md">🧬</span>;
    
    if (name.includes('imat')) return <Brain {...iconProps} />;
    if (name.includes('mdcat')) return <Activity {...iconProps} />;
    
    return <BookOpen {...iconProps} />;
  };

  const getGradient = () => {
    const name = subject.name.toLowerCase();
    if (name.includes('physics')) return 'from-amber-400 to-orange-600';
    if (name.includes('chemistry')) return 'from-blue-400 to-indigo-600';
    if (name.includes('biology')) return 'from-emerald-400 to-teal-600';
    if (name.includes('imat')) return 'from-purple-400 to-indigo-600';
    if (name.includes('mdcat')) return 'from-rose-400 to-red-600';
    return 'from-slate-400 to-slate-600';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-[2rem]'
  };

  return (
    <div className={`relative inline-block transition-transform duration-500 hover:scale-110 active:scale-95 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white shadow-xl relative overflow-hidden group`}>
        {/* Premium Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Decorative Inner Glow */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 blur-3xl rounded-full transform rotate-45 group-hover:scale-150 transition-transform duration-1000" />
        
        {getIcon()}
      </div>

    </div>
  );
};
