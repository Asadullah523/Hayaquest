import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 text-center">
            
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 transform rotate-12">
              <AlertTriangle size={40} />
            </div>

            <h1 className="text-2xl font-black mb-2 tracking-tight">Oops! Something went wrong.</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-8 text-left overflow-auto max-h-32 custom-scrollbar">
              <p className="font-mono text-xs text-red-600 dark:text-red-400 break-words">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            {this.state.error?.message?.toLowerCase().includes('fetch') && (
              <p className="text-xs text-indigo-500 font-bold mb-4 animate-pulse">
                New version detected! Please reload to continue.
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reload Application
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full py-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Return to Dashboard
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
               <p className="text-xs text-slate-400 font-medium">
                 Error Code: ERR_CLIENT_RENDER_FAIL
               </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
