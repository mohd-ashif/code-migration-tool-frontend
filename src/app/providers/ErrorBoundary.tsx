import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logger.error(`[ErrorBoundary] React component crash: ${error.message}`, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070E] text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-[#0E0F1D]/90 border border-rose-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-rose-500/20 pb-5">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shadow-glow">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-mono">Workspace Application Recovered</h1>
                <p className="text-xs text-rose-300 font-sans mt-0.5">
                  An unhandled rendering error was isolated by the Global Error Boundary.
                </p>
              </div>
            </div>

            {/* Error Log Box */}
            <div className="bg-[#040408] border border-rose-500/20 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{this.state.error?.name || 'Error'}: {this.state.error?.message || 'Component Crash'}</span>
              </div>
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-[10px] text-zinc-500 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed border-t border-zinc-800/60 pt-2">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-mono font-bold py-3 px-4 rounded-xl border border-primary/30 shadow-glow transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload Workspace Page
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold py-3 px-4 rounded-xl border border-zinc-700 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-amber-400" /> Reset Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
