import React from 'react';

interface TrophyDisplayProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const TrophyDisplay: React.FC<TrophyDisplayProps> = ({ tier }) => {
  const getTrophyColor = () => {
    switch (tier) {
      case 'platinum':
        return {
          primary: '#e0e7ff',
          secondary: '#c7d2fe',
          glow: 'rgba(99, 102, 241, 0.4)',
          gradient: 'from-indigo-200 via-purple-200 to-pink-200'
        };
      case 'gold':
        return {
          primary: '#fef3c7',
          secondary: '#fde68a',
          glow: 'rgba(245, 158, 11, 0.4)',
          gradient: 'from-yellow-200 via-amber-300 to-yellow-400'
        };
      case 'silver':
        return {
          primary: '#e5e7eb',
          secondary: '#d1d5db',
          glow: 'rgba(107, 114, 128, 0.4)',
          gradient: 'from-gray-200 via-slate-300 to-gray-300'
        };
      default: // bronze
        return {
          primary: '#fed7aa',
          secondary: '#fdba74',
          glow: 'rgba(234, 88, 12, 0.4)',
          gradient: 'from-orange-200 via-amber-300 to-orange-300'
        };
    }
  };

  const colors = getTrophyColor();

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-50"
        style={{ background: colors.glow }}
      />
      
      {/* Trophy SVG */}
      <svg
        className={`relative w-32 h-32 md:w-80 md:h-80 animate-float drop-shadow-2xl`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base */}
        <ellipse cx="100" cy="180" rx="45" ry="8" fill={colors.secondary} opacity="0.6" />
        <rect x="75" y="170" width="50" height="10" rx="5" fill={colors.primary} />
        <rect x="85" y="165" width="30" height="15" rx="3" fill={colors.secondary} />
        
        {/* Stem */}
        <rect x="92" y="130" width="16" height="35" rx="2" fill={colors.secondary} />
        
        {/* Cup body */}
        <path
          d="M70 130 Q70 90, 100 85 Q130 90, 130 130 L125 130 Q125 95, 100 92 Q75 95, 75 130 Z"
          fill={`url(#trophy-gradient-${tier})`}
          stroke={colors.secondary}
          strokeWidth="2"
        />
        
        {/* Cup top */}
        <ellipse cx="100" cy="85" rx="32" ry="8" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
        
        {/* Left handle */}
        <path
          d="M70 95 Q50 95, 50 110 Q50 120, 65 120"
          fill="none"
          stroke={colors.primary}
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Right handle */}
        <path
          d="M130 95 Q150 95, 150 110 Q150 120, 135 120"
          fill="none"
          stroke={colors.primary}
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Shine effect */}
        <ellipse cx="90" cy="105" rx="8" ry="15" fill="white" opacity="0.3" />
        <ellipse cx="110" cy="95" rx="5" ry="10" fill="white" opacity="0.2" />
        
        {/* Star on cup */}
        <path
          d="M100 110 L102 116 L108 116 L103 120 L105 126 L100 122 L95 126 L97 120 L92 116 L98 116 Z"
          fill={colors.secondary}
          opacity="0.8"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`trophy-gradient-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
