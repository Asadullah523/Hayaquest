import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout'; // Layout is kept eager for perceived performance
import { GlobalLoader } from './components/layout/GlobalLoader';
import { Suspense, lazy, useState, useEffect } from 'react';
import { initializePresetSubjects } from './utils/initializePresetSubjects';
import { useSubjectStore } from './store/useSubjectStore';
import { syncService } from './services/syncService';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const SubjectList = lazy(() => import('./components/subjects/SubjectList').then(module => ({ default: module.SubjectList })));
const SubjectDetail = lazy(() => import('./components/subjects/SubjectDetail').then(module => ({ default: module.SubjectDetail })));
const Timetable = lazy(() => import('./components/timetable/Timetable').then(module => ({ default: module.Timetable })));
const ImatDashboard = lazy(() => import('./components/imat/ImatDashboard').then(module => ({ default: module.ImatDashboard })));
const MdcatDashboard = lazy(() => import('./components/mdcat/MdcatDashboard').then(module => ({ default: module.MdcatDashboard })));
const Achievements = lazy(() => import('./components/achievements/Achievements').then(module => ({ default: module.Achievements })));
const Analytics = lazy(() => import('./components/analytics/Analytics').then(module => ({ default: module.Analytics })));
const EnglishDashboard = lazy(() => import('./components/english/EnglishDashboard').then(module => ({ default: module.EnglishDashboard })));
const Dictionary = lazy(() => import('./components/english/Dictionary').then(module => ({ default: module.Dictionary })));
const VocabularyBuilder = lazy(() => import('./components/english/VocabularyBuilder').then(module => ({ default: module.VocabularyBuilder })));
const Stories = lazy(() => import('./components/english/Stories').then(module => ({ default: module.Stories })));
const Grammar = lazy(() => import('./components/english/Grammar').then(module => ({ default: module.Grammar })));
const MyCollection = lazy(() => import('./components/english/MyCollection').then(module => ({ default: module.MyCollection })));
const WritingChecker = lazy(() => import('./components/english/WritingChecker').then(module => ({ default: module.WritingChecker })));
const Settings = lazy(() => import('./components/settings/Settings').then(module => ({ default: module.Settings })));

// Simple loading spinner for Suspense fallback (internal navigations)
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { loadSubjects, loadAllTopics } = useSubjectStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {

      
      try {
        // 1. Initialize DB structure (optimized to run only when needed)
        await initializePresetSubjects();
        
        // 2. Load data in parallel
        await Promise.all([
          loadSubjects(),
          loadAllTopics()
        ]);

        // 3. Initialize Auto-sync
        syncService.initAutoSync();
      } catch (error) {
        console.error("Failed to bootstrap application:", error);
      }
      
      setIsReady(true);
    };
    bootstrap();
  }, [loadSubjects, loadAllTopics]);

  if (!isReady) {
    return <GlobalLoader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/imat" element={<ImatDashboard />} />
            <Route path="/mdcat" element={<MdcatDashboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/english" element={<EnglishDashboard />} />
            <Route path="/english/dictionary" element={<Dictionary />} />
            <Route path="/english/vocabulary" element={<VocabularyBuilder />} />
            <Route path="/english/stories" element={<Stories />} />
            <Route path="/english/grammar" element={<Grammar />} />
            <Route path="/english/writing-checker" element={<WritingChecker />} />
            <Route path="/english/collection" element={<MyCollection />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;