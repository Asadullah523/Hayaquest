import React, { useState } from 'react';
import { imatResources, type Resource } from '../../data/imatResources';
import { ResourceCard } from './ResourceCard';
import { Search, Upload, Plus, Loader2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

interface LibraryProps {
  context?: string;
  initialResources?: Resource[];
}

export const Library: React.FC<LibraryProps> = ({ context = "IMAT", initialResources = imatResources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categories = ['All', 'Biology', 'Chemistry', 'Physics', 'Math', 'Logic', 'General', 'Past Papers', 'My Uploads'];

  // Load dynamic resources from DB
  const userResources = useLiveQuery(() => db.resources.toArray()) || [];

  // Combine static and dynamic resources
  const allResources = [...initialResources, ...userResources.map(r => ({
      ...r,
      // Create a blob URL for the file content if present
      url: r.fileBlob ? URL.createObjectURL(r.fileBlob) : undefined,
      isUserUpload: true
  }))];

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (resource.author && resource.author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Default "All" category includes everything except user uploads which have their own category unless 'All' is selected
    // But 'All' usually should include everything. Let's make "My Uploads" a filter.
    
    let matchesCategory = false;
    if (selectedCategory === 'All') matchesCategory = true;
    else if (selectedCategory === 'My Uploads') matchesCategory = resource.isUserUpload === true;
    else matchesCategory = resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      
      setUploading(true);
      try {
          for (const file of files) {
              if (file.type !== 'application/pdf') {
                  alert(`Skipped ${file.name}: Only PDF files are allowed.`);
                  continue;
              }

              await db.resources.add({
                  title: file.name.replace('.pdf', ''),
                  category: 'General', // Default category, user can edit later if we add edit feature
                  type: 'PDF',
                  dateAdded: new Date(),
                  fileBlob: file, // Store the file directly
                  description: 'Uploaded by you'
              } as any); // Type cast as we are extending the interface dynamically here or in DB
          }
      } catch (error) {
          console.error("Upload failed", error);
          alert("Failed to upload file. Storage might be full.");
      } finally {
          setUploading(false);
      }
  };



  const handleDelete = async (id: string) => {
      try {
          await db.resources.delete(Number(id));
      } catch (error) {
          console.error("Failed to delete resource", error);
      }
  };

  return (
    <div 
        className="space-y-8 animate-in fade-in duration-500 min-h-screen"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
          <div className="fixed inset-0 z-50 bg-purple-600/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
              <div className="text-white text-center">
                  <Upload size={64} className="mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold">Drop PDF to Upload</h2>
                  <p className="text-purple-200 mt-2">Add to your personal library</p>
              </div>
          </div>
      )}
      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/40 border border-white/10 p-8 md:p-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 group">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="relative z-10 max-w-xl">
             <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Library</span>
             </h1>
             <p className="text-lg text-gray-300 leading-relaxed">
                Access a curated collection of textbooks, notes, and past papers designed to master the {context}.
             </p>
         </div>

         {/* Search Box - Big & Prominent */}
         <div className="relative z-10 w-full md:w-auto min-w-[320px]">
            <div className="relative group/search">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover/search:opacity-100 transition duration-300 blur-sm" />
                <div className="relative flex items-center bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-2 transition-all group-focus-within/search:bg-black/80">
                    <Search className="ml-3 text-gray-400 group-focus-within/search:text-purple-400 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search books, topics..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-3 py-2 text-base"
                    />
                </div>
            </div>
         </div>
      </div>

       {/* Category Navigation */}
       <div className="sticky top-2 z-20 mx-[-1rem] px-[1rem] md:mx-0 md:px-0">
         <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar py-2 mask-linear">
            {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    group relative px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border
                    ${selectedCategory === cat 
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/25 scale-105' 
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'}
                  `}
                >
                  {cat}
                  {/* Active Indicator Dot */}
                  {selectedCategory === cat && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_10px_currentColor]" />
                  )}
                </button>
            ))}
         </div>
       </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredResources.map(resource => (
          <ResourceCard 
              key={resource.id} 
              resource={resource} 
              onDelete={resource.isUserUpload ? () => handleDelete(resource.id) : undefined}
          />
        ))}
        
        {/* Add Resource Card - Drop Zone */}
        <div 
            className={`
                group relative h-full min-h-[350px] border-2 border-dashed rounded-[1.2rem] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 text-center p-6
                ${uploading ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5'}
            `}
            // Trigger file input click if strictly needed, but drag & drop is primary as requested
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input 
                id="file-upload" 
                type="file" 
                accept=".pdf" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                    const event = {
                        preventDefault: () => {},
                        dataTransfer: { files: e.target.files }
                    } as any;
                    handleDrop(event);
                }}
            />
            
            {uploading ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 size={40} className="text-purple-500 animate-spin" />
                    <p className="text-purple-400 font-medium">Uploading...</p>
                 </div>
            ) : (
                <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                        <Plus size={30} className="text-gray-500 group-hover:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-300 group-hover:text-white transition-colors">Add PDF</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-[200px] mx-auto">
                            Drag & Drop PDF here or click to browse
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>

    </div>
  );
};
