import { useOffline } from '../hooks/use-offline';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const { isOffline } = useOffline();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
      // Hide after 3 seconds
      const timeout = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timeout);
    } else {
      setShow(false);
    }
  }, [isOffline]);

  if (!show) return null;

  return (
    <div 
      className="fixed top-16 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg elevation-2 z-50"
      data-testid="offline-indicator"
    >
      <div className="flex items-center space-x-2">
        <span className="material-icons">cloud_off</span>
        <span className="text-sm font-medium">
          You're offline. Changes will sync when connected.
        </span>
      </div>
    </div>
  );
}
