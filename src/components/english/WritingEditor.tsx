import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { WritingError } from '../../types/writingChecker';

interface WritingEditorProps {
  text: string;
  setText: (text: string) => void;
  errors: WritingError[];
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
}

export const WritingEditor: React.FC<WritingEditorProps> = ({ text, setText, errors, onScroll, onDoubleClick }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between textarea and backdrop
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (onScroll) onScroll(e);
  };

  // Ensure heights match
  useEffect(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.style.height = `${textareaRef.current.offsetHeight}px`;
    }
  }, [text]);

  const renderHighlights = () => {
    if (!text) return null;

    // Sort errors by offset to process them sequentially
    const sortedErrors = [...errors].sort((a, b) => a.offset - b.offset);
    
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    sortedErrors.forEach((error, idx) => {
      // Add text before the error
      if (error.offset > lastIndex) {
        parts.push(text.substring(lastIndex, error.offset));
      }

      // Add the highlighted part
      const errorText = text.substring(error.offset, error.offset + error.length);
      const categoryColor = getUnderlineColor(error.category);
      
      parts.push(
        <span
          key={`${error.id}-${idx}`}
          className={`relative border-b-2 border-dashed transition-colors duration-200 ${categoryColor}`}
          title={error.message}
        >
          {errorText}
        </span>
      );

      lastIndex = error.offset + error.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {parts}
        {/* Invisible character to ensure the height matches when text ends with a newline */}
        <span className="invisible text-transparent">.</span>
      </div>
    );
  };

  const getUnderlineColor = (category: WritingError['category']) => {
    switch (category) {
      case 'SPELLING': return 'border-rose-500 bg-rose-500/10';
      case 'GRAMMAR': return 'border-blue-500 bg-blue-500/10';
      case 'STYLE': return 'border-emerald-500 bg-emerald-500/10';
      case 'PUNCTUATION': return 'border-purple-500 bg-purple-500/10';
      case 'TYPO': return 'border-orange-500 bg-orange-500/10';
      default: return 'border-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="relative w-full h-full font-medium text-lg leading-[1.8] antialiased">
      {/* Background layer with highlights */}
      <div
        ref={backdropRef}
        className="absolute inset-0 p-8 pointer-events-none overflow-hidden text-transparent selection:bg-indigo-500/20"
        aria-hidden="true"
        style={{ 
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit'
        }}
      >
        {renderHighlights()}
      </div>

      {/* Interactive textarea layer */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onScroll={handleScroll}
        onDoubleClick={onDoubleClick}
        placeholder="Start writing or paste your text here..."
        className="relative w-full h-[600px] p-8 bg-transparent text-slate-800 dark:text-white resize-none focus:outline-none z-10 whitespace-pre-wrap break-words border-none focus:ring-0 overflow-y-auto"
        style={{ 
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export const CircularProgress: React.FC<{ score: number; size?: number; strokeWidth?: number }> = ({ 
  score, 
  size = 60, 
  strokeWidth = 6 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 90) return '#10b981'; // emerald-500
    if (score >= 70) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100 dark:text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-black text-slate-800 dark:text-white">
        {score}%
      </span>
    </div>
  );
};
