import React, { useEffect, useState } from 'react';

const MOTIVATIONAL_QUOTES = [
    "Every session brings you closer to your dream.",
    "Consistency is the key to mastery.",
    "Focus on the process, the results will follow.",
    "Your potential is limitless.",
    "Small steps every day lead to big results.",
    "Believe in yourself and your ability to learn.",
    "Excellence is not an act, but a habit.",
    "The expert in anything was once a beginner."
];

export const GlobalLoader: React.FC = () => {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-500">
            <div className="relative mb-12">
                {/* Pulse Rings */}
                <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl animate-pulse-subtle"></div>
                
                {/* Logo Container */}
                <div className="relative w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 animate-float">
                    <img 
                        src="/hayaquest-logo.svg" 
                        alt="HayaQuest" 
                        className="w-16 h-16 animate-premium-fade-in" 
                    />
                </div>
            </div>

            {/* Brand Name */}
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight animate-slide-up">
                HayaQuest
            </h1>
            
            {/* Tagline / Quote */}
            <div className="h-8 flex items-center justify-center overflow-hidden">
                <p className="text-slate-500 dark:text-slate-400 font-medium italic animate-premium-fade-in text-center px-4">
                    {quote}
                </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-progress-indeterminate"></div>
            </div>

            <style>{`
                @keyframes progress-indeterminate {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 70%; margin-left: 30%; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
