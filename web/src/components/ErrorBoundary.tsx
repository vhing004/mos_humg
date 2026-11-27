import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-rose-200 shadow-sm max-w-xl mx-auto my-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Đã có lỗi xảy ra khi tải nội dung
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {this.state.error?.message || 'Không thể hiển thị trang này.'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Làm mới trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
