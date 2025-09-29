import { useState, useEffect } from 'react';
import { syncWorker } from '@/lib/sync-worker';

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState(() => syncWorker.getSyncStatus());

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(syncWorker.getSyncStatus());
    };

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const forceSync = async () => {
    await syncWorker.forcSync();
    setSyncStatus(syncWorker.getSyncStatus());
  };

  return {
    ...syncStatus,
    forceSync
  };
}
