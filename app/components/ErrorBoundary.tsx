import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree.
 * It prevents the entire app from crashing and allows graceful handling of errors.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div style={{ padding: '1rem', margin: '1rem 0', backgroundColor: '#fff8f8', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
          <h4 style={{ color: '#d32f2f', margin: '0 0 0.5rem' }}>Something went wrong</h4>
          <p style={{ margin: '0 0 0.5rem' }}>The component couldn't be displayed.</p>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
            <summary>Show error details</summary>
            <p>{this.state.error?.toString()}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
} 