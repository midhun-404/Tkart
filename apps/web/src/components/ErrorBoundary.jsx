import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border-l-4 border-red-500">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">We're sorry, but an unexpected error occurred.</p>
                        {this.state.error && (
                            <details className="bg-gray-100 p-4 rounded text-xs overflow-auto mb-4">
                                <summary className="font-bold cursor-pointer mb-2">Error Details</summary>
                                <div className="whitespace-pre-wrap">{this.state.error.toString()}</div>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-slate-800 transition-colors"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="ml-3 text-primary hover:underline"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
