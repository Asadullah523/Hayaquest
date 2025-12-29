import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout'; // Layout is kept eager for perceived performance
import { GlobalLoader } from './components/layout/GlobalLoader';
import { BackButtonHandler } from './components/navigation/BackButtonHandler';
import { Suspense, useState, useEffect } from 'react';
import { initializePresetSubjects } from './utils/initializePresetSubjects';
import { useSubjectStore } from './store/useSubjectStore';
import { syncService } from './services/syncService';
import { useAuthStore } from './store/useAuthStore';

import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy load pages for better performance
const Dashboard = lazyWithRetry(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const SubjectList = lazyWithRetry(() => import('./components/subjects/SubjectList').then(module => ({ default: module.SubjectList })));
const SubjectDetail = lazyWithRetry(() => import('./components/subjects/SubjectDetail').then(module => ({ default: module.SubjectDetail })));
const Timetable = lazyWithRetry(() => import('./components/timetable/Timetable').then(module => ({ default: module.Timetable })));
const ImatDashboard = lazyWithRetry(() => import('./components/imat/ImatDashboard').then(module => ({ default: module.ImatDashboard })));
const MdcatDashboard = lazyWithRetry(() => import('./components/mdcat/MdcatDashboard').then(module => ({ default: module.MdcatDashboard })));
const Achievements = lazyWithRetry(() => import('./components/achievements/Achievements').then(module => ({ default: module.Achievements })));
const Analytics = lazyWithRetry(() => import('./components/analytics/Analytics').then(module => ({ default: module.Analytics })));
const EnglishDashboard = lazyWithRetry(() => import('./components/english/EnglishDashboard').then(module => ({ default: module.EnglishDashboard })));
const Dictionary = lazyWithRetry(() => import('./components/english/Dictionary').then(module => ({ default: module.Dictionary })));
const VocabularyBuilder = lazyWithRetry(() => import('./components/english/VocabularyBuilder').then(module => ({ default: module.VocabularyBuilder })));
const Stories = lazyWithRetry(() => import('./components/english/Stories').then(module => ({ default: module.Stories })));
const Grammar = lazyWithRetry(() => import('./components/english/Grammar').then(module => ({ default: module.Grammar })));
const MyCollection = lazyWithRetry(() => import('./components/english/MyCollection').then(module => ({ default: module.MyCollection })));
const WritingChecker = lazyWithRetry(() => import('./components/english/WritingChecker').then(module => ({ default: module.WritingChecker })));
const Settings = lazyWithRetry(() => import('./components/settings/Settings').then(module => ({ default: module.Settings })));

// Simple loading spinner for Suspense fallback (internal navigations)
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const { loadSubjects, loadAllTopics } = useSubjectStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Global recovery for dynamic import failures (Deployment issues)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && (
        error.name === 'ChunkLoadError' || 
        (error.message && error.message.includes('Failed to fetch dynamically imported module'))
      )) {
        console.warn('Recovering from module load error - Reloading...', error);
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  useEffect(() => {
    let focusListener: (() => void) | null = null;
    
    const bootstrap = async () => {
      setIsReady(false);
      try {
        // 1. Initialize DB structure for the current bucket (guest or user)
        await initializePresetSubjects();
        
        // 2. Load data from local DB for the current bucket
        await Promise.all([
          loadSubjects(),
          loadAllTopics()
        ]);

        // 3. Initialize Auto-sync (every 15 seconds) if not already done
        syncService.initAutoSync(15);

        // 4. Cloud Restore on Login
        if (isAuthenticated) {
          try {
            await syncService.restore(true);
          } catch (err) {
            console.error('Initial restore failed:', err);
          }
          
          // 5. Add focus and visibility listeners for active users
          const handleFocus = async () => {
             if (useAuthStore.getState().isAuthenticated) {
               syncService.restore().catch(err => console.error('Focus sync failed', err));
             }
          };
          window.addEventListener('focus', handleFocus);
          window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') handleFocus();
          });
          focusListener = handleFocus;
        }
      } catch (error) {
        console.error("Failed to bootstrap application:", error);
      } finally {
        // 6. Mark sync service as initialized (Backups now allowed)
        syncService.markInitialized();
        setIsReady(true);
      }
    };

    bootstrap();

    return () => {
      if (focusListener) window.removeEventListener('focus', focusListener);
    };
  }, [loadSubjects, loadAllTopics, isAuthenticated, user?.email]);


  if (!isReady) {
    return <GlobalLoader />;
  }

  return (
    <BrowserRouter>
      <BackButtonHandler>
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
      </BackButtonHandler>
    </BrowserRouter>
  );
}

export default App;