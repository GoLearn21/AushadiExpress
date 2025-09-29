import { useSyncStatus } from '@/hooks/use-sync-status';
import { CapabilityBadge } from '@/components/capability-badge';

export function SyncStatus() {
  const { isOnline, pendingItems, forceSync } = useSyncStatus();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'status-online' : 'status-offline'
          }`} 
          data-testid="connection-status-indicator"
        />
        <span className="text-xs" data-testid="connection-status-text">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      {pendingItems > 0 && (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded" data-testid="pending-items">
          {pendingItems} pending
        </span>
      )}
      <button 
        className="p-1 rounded-full hover:bg-white/10 transition-colors" 
        onClick={forceSync}
        data-testid="button-sync"
      >
        <span className="material-icons text-sm">sync</span>
      </button>
      <CapabilityBadge />
    </div>
  );
}
