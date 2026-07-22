'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class WorldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('World error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-[#8B5CF6] mb-3">Campus hit a snag</h1>
            <p className="text-gray-700 mb-2">
              The game world could not load. You can try again or browse adventures in the catalog.
            </p>
            {this.state.message && (
              <p className="text-xs text-gray-500 mb-6 font-mono">{this.state.message}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] font-semibold"
              >
                Reload campus
              </button>
              <a
                href="/catalog"
                className="px-6 py-3 bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#8B5CF6]/10 font-semibold"
              >
                Browse catalog
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

