"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  className?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // Optionally log to an external service here
  }

  reset = () => {
    this.setState({ error: null, retryCount: this.state.retryCount + 1 });
  };

  render() {
    const { error, retryCount } = this.state;
    const { children, fallback, className } = this.props;

    if (error) {
      if (fallback) {
        if (typeof fallback === "function") {
          return <>{(fallback as any)(error, this.reset)}</>;
        }
        return <>{fallback}</>;
      }
      return (
        <div className={"p-6 bg-red-950/40 border border-red-700/40 rounded-xl text-red-200 space-y-4 " + (className || "") }>
          <div className="font-bold font-orbitron text-lg">Component Failure Captured</div>
          <div className="text-sm opacity-80 font-mono whitespace-pre-wrap max-h-48 overflow-auto">
            {error.message}\n\nRetry Count: {retryCount}
          </div>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-white font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return <>{children}</>;
  }
}

export default ErrorBoundary;
