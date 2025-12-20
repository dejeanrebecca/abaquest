import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
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
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-warm-neutral flex items-center justify-center p-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-abacus-red max-w-2xl w-full text-center">
                        <div className="w-20 h-20 bg-abacus-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-abacus-red" />
                        </div>

                        <h1 className="text-3xl text-deep-blue mb-4">Oops! Something went wrong.</h1>
                        <p className="text-deep-blue/70 mb-8 max-w-md mx-auto">
                            Don't worry, even smart explorers hit a bump in the road sometimes. Let's try reloading the page!
                        </p>

                        <div className="bg-gray-100 p-4 rounded-xl mb-8 text-left overflow-auto max-h-48">
                            <p className="text-sm font-mono text-red-600">
                                {this.state.error?.toString()}
                            </p>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-abacus-red hover:bg-abacus-red/90 text-white py-6 px-12 rounded-2xl shadow-xl text-lg"
                        >
                            Reload AbaQuest 🔄
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
