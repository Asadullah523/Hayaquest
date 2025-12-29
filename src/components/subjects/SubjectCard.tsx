import React, { useState, useRef } from 'react';
import type { Subject } from '../../types';
import { BookOpen, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface SubjectCardProps {
  subject: Subject;
  onClick?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isOpening, setIsOpening] = useState(false); // State for opening animation
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteSubject } = useSubjectStore();
  const navigate = useNavigate();

  // Close menu if clicked outside
  // This useEffect is still needed for the menu dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to burn this tome forever?')) {
      if (subject.id) {
        await deleteSubject(subject.id);
        // Navigate back to subjects list to avoid white screen
        navigate('/subjects');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Edit logic... (usually passed via prop or handled differently, but omitting for brevity in this visual update)
    // If an onEdit prop was passed, it would be called here: onEdit(subject);
    setShowMenu(false); // Close menu after action
  };

  const handleBookClick = (e: React.MouseEvent) => {
     // Don't open if clicking menu or any interactive element inside
     if ((e.target as Element).closest('button')) {
        return;
     }

     setIsOpening(true);

     // Wait for animation to finish before action
     setTimeout(() => {
         if (onClick) {
            onClick();
            // Reset after a delay if it's just opening a modal
            setTimeout(() => setIsOpening(false), 500);
         } else {
             navigate(`/subjects/${subject.id}`);
         }
     }, 900); // Wait for the book to fully open (matches transition duration approx)
  };

  // Map priority to color/label
  const getPriorityInfo = () => {
      switch(subject.priority) {
          case 'high': return { color: 'bg-red-800', label: 'High Priority', ribbon: 'from-red-700 to-red-900' };
          case 'medium': return { color: 'bg-blue-800', label: 'Normal', ribbon: 'from-blue-700 to-blue-900' };
          case 'low': return { color: 'bg-emerald-800', label: 'Low', ribbon: 'from-emerald-700 to-emerald-900' };
          default: return { color: 'bg-stone-700', label: 'Standard', ribbon: 'from-stone-600 to-stone-800' };
      }
  };
  
  const priorityInfo = getPriorityInfo();
  
  return (
    <div 
        onClick={handleBookClick}
        className={clsx(
            "relative cursor-pointer group select-none animate-premium-fade-in",
            isOpening ? 'z-50' : 'z-0 hover:z-40',
            // Responsive sizing
            "h-[170px] w-[110px] sm:h-72 sm:w-52 md:h-80 md:w-60"
        )} 
        style={{ 
            perspective: '2000px',
            transition: 'z-index 0s linear 0.1s'
        }}
    >
      <div className={`relative w-full h-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isOpening || onClick ? '' : 'group-hover:-rotate-y-12 group-hover:translate-x-3'}`}
           style={{ transformStyle: 'preserve-3d' }}>
         
         {/* --- INTERIOR CONTENT (Revealed after open) --- */}
         <div className="absolute inset-0 bg-[#f4e4bc] rounded-r-lg shadow-xl flex flex-col p-3 sm:p-5 border-l-[2px] sm:border-l-[3px] border-[#8b5a2b]" 
              style={{ transform: 'translateZ(-2px)', zIndex: 10 }}>
             
             {/* Text Content */}
             <div className="flex-1 opacity-90 flex flex-col gap-1.5 sm:gap-3 pt-1 sm:pt-2 font-serif text-[#4a3b2a] overflow-hidden">
                 <h4 className="font-bold text-[10px] sm:text-xl leading-tight border-b-2 border-[#8b5a2b]/20 pb-1 sm:pb-2 mb-1 drop-shadow-sm truncate">{subject.name}</h4>
                 <div className="space-y-1.5 sm:space-y-3 mt-1 sm:mt-2">
                     <p className="text-[8px] sm:text-xs uppercase tracking-widest font-bold text-[#8b5a2b]/60">Contents</p>
                     <div className="h-[1px] w-full bg-[#8b5a2b]/20" />
                     <div className="flex justify-between text-[9px] sm:text-xs font-bold">
                         <span>Target</span>
                         <span>{subject.targetHoursPerWeek || 0}h</span>
                     </div>
                     <div className="flex justify-between text-[9px] sm:text-xs font-bold">
                         <span>Level</span>
                         <span className="uppercase text-[8px] sm:text-[10px]">{subject.priority}</span>
                     </div>
                 </div>
                 
                 <div className="mt-auto pt-2 sm:pt-4 border-t border-[#8b5a2b]/10 flex items-center justify-center">
                    <span className="text-[8px] sm:text-xs uppercase tracking-[0.15em] text-[#8b5a2b] font-black animate-pulse flex items-center gap-1.5">
                         {isOpening ? 'Opening...' : 'Read'} <BookOpen size={10} className="sm:w-3.5 sm:h-3.5" />
                    </span>
                 </div>
             </div>
         </div>

         {/* --- REALISTIC TURNING PAGES (Physical Layers) --- */}
         {/* Page 1 */}
         <div 
             className="absolute inset-0 rounded-r-lg border-l border-[#d4c5a9]/50 origin-left transform-style-3d transition-transform duration-[1400ms] ease-in-out z-40"
             style={{ 
                 transform: isOpening ? 'rotateY(-160deg)' : 'rotateY(0deg)',
                 background: '#f4e4bc',
                 backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")',
                 boxShadow: isOpening ? '5px 0 15px rgba(0,0,0,0.1)' : 'inset 2px 0 5px rgba(0,0,0,0.05)'
             }}
         />

         {/* Page 2 */}
         <div 
             className="absolute inset-0 rounded-r-lg border-l border-[#d4c5a9]/50 origin-left transform-style-3d transition-transform duration-[1600ms] ease-in-out z-30"
             style={{ 
                 transform: isOpening ? 'rotateY(-155deg)' : 'rotateY(0deg)',
                 background: '#efe0b9'
             }}
         />
         
         {/* Page 3 */}
         <div 
             className="absolute inset-0 rounded-r-lg border-l border-[#d4c5a9]/50 origin-left transform-style-3d transition-transform duration-[1800ms] ease-in-out z-20"
             style={{ 
                 transform: isOpening ? 'rotateY(-150deg)' : 'rotateY(0deg)',
                 background: '#eaddb5'
             }}
         />

         {/* --- FRONT COVER --- */}
         <div 
            className={`absolute inset-0 origin-left transform-style-3d transition-transform duration-[1200ms] cubic-bezier(0.25,1,0.5,1) z-50`}
            style={{ 
                transform: isOpening ? 'rotateY(-170deg)' : 'rotateY(0deg)',
                transformOrigin: '0% 50%'
            }}
         >
             {/* FRONT FACE (Design) */}
             <div 
                className="absolute inset-0 rounded-r-lg rounded-l-[2px] overflow-hidden backface-hidden"
                style={{ 
                    backgroundColor: '#5d4037',
                    boxShadow: isOpening ? 'none' : 'inset 2px 0 8px rgba(0,0,0,0.6), 5px 5px 20px rgba(0,0,0,0.5)',
                    border: '1px solid #3e2723'
                }}
             >
                 {/* Rich Leather Texture */}
                 <div className="absolute inset-0 opacity-70" style={{ 
                     backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
                     mixBlendMode: 'multiply',
                     filter: 'contrast(1.4) brightness(0.9)'
                 }} />
                 
                 {/* Rich Brown Gradient - Medium-dark tones */}
                 <div className="absolute inset-0 opacity-75 mix-blend-multiply" 
                      style={{ 
                          background: 'linear-gradient(135deg, #6d4c41 0%, #5d4037 40%, #4e342e 100%)'
                      }} />
                 
                 {/* Aged/Worn Overlay */}
                 <div className="absolute inset-0 opacity-25" style={{
                     backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.3) 0%, transparent 40%)',
                 }} />

                 {/* Victorian Ornate Corners - Antique gold embossed style */}
                 {/* Top Left Ornament */}
                 <svg className="absolute top-0.5 sm:top-2 left-1 sm:left-3 w-6 h-6 sm:w-16 sm:h-16 opacity-90" viewBox="0 0 100 100">
                     <path d="M5,5 L5,40 M5,5 L40,5" stroke="#d4af37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                     <path d="M5,5 Q15,5 25,15 T35,35" stroke="#d4af37" strokeWidth="2" fill="none"/>
                     <circle cx="8" cy="8" r="2.5" fill="#d4af37"/>
                     <path d="M10,10 Q20,12 25,20 Q30,25 35,30" stroke="#d4af37" strokeWidth="1.5" fill="none" opacity="0.8"/>
                     {/* Decorative leaves/flourishes */}
                     <path d="M15,8 Q18,10 20,15 Q18,12 15,8 M8,15 Q10,18 15,20 Q12,18 8,15" fill="#d4af37" opacity="0.7"/>
                 </svg>
                 
                 {/* Top Right Ornament */}
                 <svg className="absolute top-0.5 sm:top-2 right-0.5 sm:right-2 w-6 h-6 sm:w-16 sm:h-16 opacity-90" viewBox="0 0 100 100" style={{ transform: 'scaleX(-1)' }}>
                     <path d="M5,5 L5,40 M5,5 L40,5" stroke="#d4af37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                     <path d="M5,5 Q15,5 25,15 T35,35" stroke="#d4af37" strokeWidth="2" fill="none"/>
                     <circle cx="8" cy="8" r="2.5" fill="#d4af37"/>
                     <path d="M10,10 Q20,12 25,20 Q30,25 35,30" stroke="#d4af37" strokeWidth="1.5" fill="none" opacity="0.8"/>
                     <path d="M15,8 Q18,10 20,15 Q18,12 15,8 M8,15 Q10,18 15,20 Q12,18 8,15" fill="#d4af37" opacity="0.7"/>
                 </svg>
                 
                 {/* Bottom Left Ornament */}
                 <svg className="absolute bottom-0.5 sm:bottom-2 left-1 sm:left-3 w-6 h-6 sm:w-16 sm:h-16 opacity-90" viewBox="0 0 100 100" style={{ transform: 'scaleY(-1)' }}>
                     <path d="M5,5 L5,40 M5,5 L40,5" stroke="#d4af37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                     <path d="M5,5 Q15,5 25,15 T35,35" stroke="#d4af37" strokeWidth="2" fill="none"/>
                     <circle cx="8" cy="8" r="2.5" fill="#d4af37"/>
                     <path d="M10,10 Q20,12 25,20 Q30,25 35,30" stroke="#d4af37" strokeWidth="1.5" fill="none" opacity="0.8"/>
                     <path d="M15,8 Q18,10 20,15 Q18,12 15,8 M8,15 Q10,18 15,20 Q12,18 8,15" fill="#d4af37" opacity="0.7"/>
                 </svg>
                 
                 {/* Bottom Right Ornament */}
                 <svg className="absolute bottom-0.5 sm:bottom-2 right-0.5 sm:right-2 w-6 h-6 sm:w-16 sm:h-16 opacity-90" viewBox="0 0 100 100" style={{ transform: 'scale(-1, -1)' }}>
                     <path d="M5,5 L5,40 M5,5 L40,5" stroke="#d4af37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                     <path d="M5,5 Q15,5 25,15 T35,35" stroke="#d4af37" strokeWidth="2" fill="none"/>
                     <circle cx="8" cy="8" r="2.5" fill="#d4af37"/>
                     <path d="M10,10 Q20,12 25,20 Q30,25 35,30" stroke="#d4af37" strokeWidth="1.5" fill="none" opacity="0.8"/>
                     <path d="M15,8 Q18,10 20,15 Q18,12 15,8 M8,15 Q10,18 15,20 Q12,18 8,15" fill="#d4af37" opacity="0.7"/>
                 </svg>

                 {/* Gold Border Frame - Classic antique look */}
                 <div className="absolute inset-2 sm:inset-3 border-2 border-[#d4af37]/55 rounded-[2px] pointer-events-none" />
                 <div className="absolute" style={{
                     top: '10px',
                     left: '12px',
                     right: '10px',
                     bottom: '10px',
                     border: '1px solid #d4af37',
                     borderRadius: '1px',
                     opacity: 0.8
                 }} />

                 {/* Spine Groove (Hinge) - Deeper shadow for 3D effect */}
                 <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-[4px] bg-black/70 blur-[2px] z-10" />
                 
                 {/* Priority Ribbon */}
                 <div className={`absolute -top-1 right-4 sm:right-6 w-5 sm:w-8 h-8 sm:h-12 bg-gradient-to-b ${priorityInfo.ribbon} shadow-lg z-20 flex flex-col items-center`}>
                     <div className="absolute bottom-0 w-0 h-0 border-l-[10px] sm:border-l-[16px] border-r-[10px] sm:border-r-[16px] border-t-[6px] sm:border-t-[10px] border-l-transparent border-r-transparent border-t-[#00000030] translate-y-full inverted-triangle" />
                     <div className="absolute bottom-0 w-full h-2 sm:h-4 bg-[#5d4037] clip-path-ribbon translate-y-full" style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div> 
                 </div>

                 {/* Content */}
                 <div className="relative h-full p-2 sm:p-6 flex flex-col z-10 pt-8 sm:pt-16">
                    {/* Menu Button */}
                    <div className="absolute top-2 sm:top-4 right-1 sm:right-2 z-50" ref={menuRef}>
                       <button 
                           onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                           className="text-[#8b6f47]/70 hover:text-[#8b6f47] p-1.5 sm:p-2 hover:bg-black/10 rounded-full transition-colors"
                       >
                           <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                       </button>
                       {showMenu && (
                           <div className="absolute right-0 mt-2 w-32 sm:w-36 bg-[#f4e4bc] text-[#5d4a35] rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-[#8b5a2b]/30 py-1 z-50 text-[10px] sm:text-xs font-serif">
                               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-50 pointer-events-none" />
                               <button onClick={handleEdit} className="relative z-10 w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#e3d09f] flex items-center gap-2 border-b border-[#8b5a2b]/10">
                                   <Edit2 size={10} className="sm:w-3 sm:h-3" /> Edit
                               </button>
                               {!subject.isPreset && (
                                   <button onClick={handleDelete} className="relative z-10 w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#e3d09f] flex items-center gap-2 text-red-800">
                                       <Trash2 size={10} className="sm:w-3 sm:h-3" /> Burn
                                   </button>
                               )}
                           </div>
                       )}
                   </div>

                    <div className="mt-2 sm:mt-4 text-center flex-1 flex flex-col items-center justify-center">
                        {/* Decorative top line */}
                        <div className="w-12 sm:w-20 h-[1.5px] sm:h-[2px] mb-4 sm:mb-6 opacity-75" style={{
                            background: 'linear-gradient(to right, transparent, #d4af37, transparent)'
                        }} />
                        
                        {/* Title with Classic Vintage Embossing */}
                        <h3 className="font-serif font-black text-[10px] sm:text-2xl leading-tight uppercase tracking-wider sm:tracking-widest px-1 sm:px-2"
                            style={{ 
                                color: '#d4af37',
                                textShadow: '0 1px 0 rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7), 0 0 12px rgba(212,175,55,0.4)',
                                fontVariant: 'small-caps',
                                letterSpacing: '0.15em'
                            }}>
                            {subject.name}
                        </h3>
                        
                        {/* Priority Stars */}
                        <div className="w-full flex justify-center mt-3 sm:mt-6 gap-1.5 sm:gap-2 opacity-80">
                            {subject.priority === 'high' && <div className="text-[#d4af37] text-[8px] sm:text-xs">★ ★ ★</div>}
                            {subject.priority === 'medium' && <div className="text-[#d4af37] text-[8px] sm:text-xs">★ ★</div>}
                            {subject.priority === 'low' && <div className="text-[#d4af37] text-[8px] sm:text-xs">★</div>}
                        </div>

                        {/* Decorative bottom line */}
                        <div className="w-12 sm:w-20 h-[1.5px] sm:h-[2px] mt-4 sm:mt-6 opacity-75" style={{
                            background: 'linear-gradient(to right, transparent, #d4af37, transparent)'
                        }} />
                    </div>
                    
                    <div className="text-center pb-2">
                        <span className="text-[9px] text-[#d4af37]/60 font-serif uppercase tracking-[0.3em]">Vol. {subject.id}</span>
                    </div>
                 </div>
             </div>

             {/* INNER COVER (Inside) */}
             <div 
                className="absolute inset-0 rounded-l-sm rounded-r-lg bg-[#f4e4bc] overflow-hidden"
                style={{ 
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden', 
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                }} 
             >
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
                 <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/30 to-transparent" />
                 <div className="flex flex-col items-center justify-center h-full opacity-60">
                     <div className="w-16 h-16 border-2 border-[#8b5a2b]/20 rounded-full flex items-center justify-center mb-2">
                         <span className="font-serif font-bold text-[#8b5a2b] text-2xl">{subject.name.charAt(0)}</span>
                     </div>
                     <span className="font-serif italic text-[#8b5a2b] text-xs">Ex Libris</span>
                 </div>
             </div>
         </div>

         {/* --- 3D SPINE --- */}
         <div 
             className="absolute top-0 bottom-0 left-0 w-8 z-10 rounded-l-md overflow-hidden"
             style={{ 
                 transform: 'rotateY(-90deg) translateZ(4px)', 
                 background: 'linear-gradient(90deg, #3e2723 0%, #5d4037 30%, #6d4c41 50%, #5d4037 70%, #3e2723 100%)',
                 boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
             }}
         >
             {/* Rich leather texture */}
             <div className="absolute inset-0 opacity-50" style={{ 
                 backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
                 mixBlendMode: 'multiply',
             }} />
             
             {/* Spine Ridges - Classic gold accents */}
             <div className="absolute top-10 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-70" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />
             <div className="absolute top-[52px] left-0 right-0 h-[1px] bg-black/60" />
             
             <div className="absolute bottom-10 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-70" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />
             <div className="absolute bottom-[52px] left-0 right-0 h-[1px] bg-black/60" />
             
             {/* Title on spine */}
             <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center -rotate-90">
                 <span className="text-[9px] text-[#d4af37] font-serif font-bold uppercase tracking-[0.15em] whitespace-nowrap opacity-90" 
                       style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                     {subject.name.length > 15 ? subject.name.substring(0, 12) + '...' : subject.name}
                 </span>
             </div>
         </div>

         {/* --- THICKNESS (Pages Side) --- */}
         <div 
            className="absolute top-[3px] bottom-[3px] right-0 w-10 z-10"
            style={{ 
                transform: 'rotateY(90deg) translateZ(-20px)', 
                background: `repeating-linear-gradient(90deg, #f4e4bc 0px, #e3d5b8 1px, #f4e4bc 2px)`,
                boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.1)' 
            }}
        />

      </div>
    </div>
  );
};