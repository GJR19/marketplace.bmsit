import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFBF5] text-[#1C1C1C] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center text-3xl mx-auto shadow-[3px_3px_0px_#1C1C1C]">
              ⚠️
            </div>
            <h2 className="font-head text-2xl font-extrabold text-[#1C1C1C]">
              Something went wrong
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              An unexpected error occurred while loading this view. You can reload or reset stored data to continue.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-[#FFF9E6] rounded-xl border border-[#1C1C1C]/20 text-[11px] font-mono text-neutral-700 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs shadow-[2.5px_2.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition cursor-pointer"
              >
                Reload Marketplace
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch {}
                  window.location.href = '/';
                }}
                className="w-full py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white text-xs font-semibold hover:bg-neutral-100 transition cursor-pointer"
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
