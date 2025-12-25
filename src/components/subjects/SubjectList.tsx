import React, { useEffect, useState } from 'react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { SubjectCard } from './SubjectCard';
import { Plus, Library, ArrowLeft, Search } from 'lucide-react';
import { SubjectFormModal } from './SubjectFormModal';
import { NavLink } from 'react-router-dom';


export const SubjectList: React.FC = () => {
  const { subjects, loadSubjects } = useSubjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Filter for Top-Level subjects (no parentId)
  // We include BOTH preset and custom subjects now, per user request
  const mainSubjects = subjects.filter(s => !s.parentId);
  
  const filteredSubjects = mainSubjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-transition space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <NavLink 
                  to="/" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary mb-2 transition-colors group"
              >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
              </NavLink>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="bg-primary/10 p-2 rounded-xl text-primary"><Library size={32} /></span>
                  My Subjects
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                  Manage your personal study subjects and track your progress.
              </p>
          </div>

          <div className="relative group w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search subjects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          </div>
      </div>

       {/* Subjects Grid */}
      <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">All Subjects</h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
              
              {/* Subject Cards First */}
              {filteredSubjects.map(subject => (
                  <SubjectCard 
                      key={subject.id} 
                      subject={subject} 
                  />
              ))}

              {/* Add New Subject Card - At the End */}
              <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group relative h-[170px] w-full max-w-[110px] sm:max-w-none sm:h-72 md:h-80 mx-auto rounded-3xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-2 group/card overflow-hidden"
              >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-gray-400">
                      <Plus size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <span className="font-bold text-[10px] sm:text-base text-gray-500 group-hover:text-primary transition-colors">Add New</span>
                  
                  {/* Hover Effect Light */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
           </div>
      </div>

      <SubjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
