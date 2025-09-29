import { apiRequest } from "./queryClient";
import { localStorage } from "./storage";

export class SyncWorker {
  private isOnline: boolean = navigator.onLine;
  private syncInterval: number = 30000; // 30 seconds
  private intervalId: number | null = null;

  constructor() {
    this.setupEventListeners();
    this.startSyncWorker();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Back online - resuming sync');
      this.startSyncWorker();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Gone offline - pausing sync');
      this.stopSyncWorker();
    });
  }

  private startSyncWorker(): void {
    if (this.intervalId || !this.isOnline) return;

    this.intervalId = window.setInterval(() => {
      this.performSync();
    }, this.syncInterval);

    // Perform initial sync
    this.performSync();
  }

  private stopSyncWorker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async performSync(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const unsyncedItems = localStorage.getUnsyncedItems();
      
      if (unsyncedItems.length === 0) {
        console.log('No items to sync');
        return;
      }

      console.log(`Syncing ${unsyncedItems.length} items...`);

      // Send batch sync request
      const response = await apiRequest('POST', '/api/sync/batch', {
        items: unsyncedItems
      });

      if (response.ok) {
        // Mark items as synced
        unsyncedItems.forEach(item => {
          localStorage.markItemSynced(item.id);
        });
        
        console.log(`Successfully synced ${unsyncedItems.length} items`);
        
        // Clean up synced items after successful sync
        setTimeout(() => {
          localStorage.clearSyncedItems();
        }, 5000);
      } else {
        console.error('Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  public forcSync(): Promise<void> {
    return this.performSync();
  }

  public isWorkerRunning(): boolean {
    return this.intervalId !== null;
  }

  public getSyncStatus() {
    const unsyncedItems = localStorage.getUnsyncedItems();
    return {
      isOnline: this.isOnline,
      pendingItems: unsyncedItems.length,
      isWorkerRunning: this.isWorkerRunning(),
      lastSync: new Date().toISOString()
    };
  }
}

export const syncWorker = new SyncWorker();
