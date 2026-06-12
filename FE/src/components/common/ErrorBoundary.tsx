import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * App-level error boundary. Catches render-time exceptions so a single broken
 * component doesn't take down the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd report to an error tracker.
    console.error("Uncaught error in component tree:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {this.state.error?.message ||
                "An unexpected error occurred while rendering this view."}
            </p>
          </div>
          <Button onClick={this.handleReset} variant="outline">
            <RotateCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
