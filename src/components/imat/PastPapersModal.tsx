import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, GraduationCap } from 'lucide-react';
import { PastPapersList } from './PastPapersList';
import { type PastPaper } from '../../data/pastPapers';

interface PastPapersModalProps {
    papers: PastPaper[];
    onClose: () => void;
    onSelectPaper?: (paper: PastPaper) => void;
    title?: string;
}

export const PastPapersModal: React.FC<PastPapersModalProps> = ({ papers, onClose, onSelectPaper, title = "Exam Simulator" }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-scale-in"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Access official exams and practice questions</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <PastPapersList papers={papers} onSelectPaper={onSelectPaper} />
                </div>
            </div>
        </div>,
        document.body
    );
};
