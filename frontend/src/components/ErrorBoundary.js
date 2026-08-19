import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-200 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="font-serif text-3xl mb-4 text-zinc-100">Something went wrong</h1>
          <p className="font-mono text-xs text-zinc-500 mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred while loading the portfolio."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="border border-white/20 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-zinc-200 hover:bg-white hover:text-black transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
