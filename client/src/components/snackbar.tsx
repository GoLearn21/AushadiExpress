import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface SnackbarProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
  duration?: number;
}

export function Snackbar({ message, action, onDismiss, duration = 5000 }: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className="bg-card border border-border rounded-lg p-4 elevation-3 flex items-center justify-between max-w-md mx-auto">
        <span className="text-sm flex-1 mr-3" data-testid="snackbar-message">
          {message}
        </span>
        <div className="flex items-center space-x-2">
          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
              data-testid="snackbar-action"
            >
              {action.label}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            data-testid="snackbar-dismiss"
          >
            <span className="material-icons text-sm">close</span>
          </Button>
        </div>
      </div>
    </div>
  );
}