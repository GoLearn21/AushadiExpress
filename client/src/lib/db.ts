// Offline-first database with IndexedDB for document capture
import Dexie, { Table } from 'dexie';

export interface Capture {
  id: string;
  fileUri: string;
  text: string;
  category: 'invoice' | 'prescription' | 'bill';
  createdAt: number;
}

export interface Invoice {
  id: string;
  captureId: string;
  invoiceNo: string;
  vendor: string;
  date: string;
  total: number;
  createdAt: number;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Prescription {
  id: string;
  captureId: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: string[];
  createdAt: number;
}

export interface Bill {
  id: string;
  captureId: string;
  billNo: string;
  vendor: string;
  date: string;
  total: number;
  createdAt: number;
}

export class OfflineDatabase extends Dexie {
  captures!: Table<Capture>;
  invoices!: Table<Invoice>;
  invoiceLines!: Table<InvoiceLine>;
  prescriptions!: Table<Prescription>;
  bills!: Table<Bill>;
  
  // Image storage tables (blob storage)
  invoiceImages!: Table<{ id: string; blob: Blob }, string>;
  prescriptionImages!: Table<{ id: string; blob: Blob }, string>;
  billImages!: Table<{ id: string; blob: Blob }, string>;

  constructor() {
    super('AushadiExpressDB');
    
    this.version(4).stores({
      captures: 'id, category, createdAt',
      invoices: 'id, captureId, createdAt',
      invoiceLines: 'id, invoiceId',
      prescriptions: 'id, captureId, createdAt',
      bills: 'id, captureId, createdAt',
      invoiceImages: 'id',
      prescriptionImages: 'id', 
      billImages: 'id'
    });

    console.log('[OFFLINE-DB] Database initialized with IndexedDB');
  }

  // Helper to get image table by category
  getImageTable(category: string) {
    switch (category) {
      case 'invoice': return this.invoiceImages;
      case 'prescription': return this.prescriptionImages;
      case 'bill': return this.billImages;
      default: throw new Error(`Unknown category: ${category}`);
    }
  }
}

export const db = new OfflineDatabase();