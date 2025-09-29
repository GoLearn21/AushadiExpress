// Local storage wrapper for offline data persistence
export interface LocalStorageData {
  products: any[];
  stock: any[];
  sales: any[];
  outbox: any[];
}

export class LocalStorage {
  private storageKey = 'pharma-empire-data';

  getData(): LocalStorageData {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data || data === 'undefined' || data === 'null') {
        return {
          products: [],
          stock: [],
          sales: [],
          outbox: []
        };
      }
      return JSON.parse(data);
    } catch (error) {
      // Only log actual errors, not empty/null data
      if (error instanceof SyntaxError) {
        console.error('Failed to parse local storage data:', error);
      }
      return {
        products: [],
        stock: [],
        sales: [],
        outbox: []
      };
    }
  }

  setData(data: LocalStorageData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to local storage:', error);
    }
  }

  addToOutbox(tableName: string, rowId: string, operation: string, payload: any): void {
    const data = this.getData();
    const outboxItem = {
      id: `${Date.now()}-${Math.random()}`,
      tableName,
      rowId,
      operation,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    data.outbox.push(outboxItem);
    this.setData(data);
  }

  getUnsyncedItems(): any[] {
    const data = this.getData();
    return data.outbox.filter(item => !item.synced);
  }

  markItemSynced(itemId: string): void {
    const data = this.getData();
    const item = data.outbox.find(item => item.id === itemId);
    if (item) {
      item.synced = true;
      this.setData(data);
    }
  }

  clearSyncedItems(): void {
    const data = this.getData();
    data.outbox = data.outbox.filter(item => !item.synced);
    this.setData(data);
  }
}

export const localStorage = new LocalStorage();
