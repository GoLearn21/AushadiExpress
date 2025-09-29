import Dexie, { type Table } from 'dexie';
import { createModuleLogger } from '../utils/app-logger';
import { type DocumentAnalysis } from './ai-vision';

const log = createModuleLogger('DocumentStorage');

export interface StoredDocument {
  id: string;
  type: 'bill' | 'prescription' | 'invoice' | 'other';
  originalFileName: string;
  imageData: string; // base64 encoded image
  analysis: DocumentAnalysis;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  tags: string[];
  searchableText: string; // For full-text search
}

export interface DocumentSearchFilter {
  type?: StoredDocument['type'];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  searchText?: string;
}

class DocumentDatabase extends Dexie {
  documents!: Table<StoredDocument>;
  searchIndex!: Table<{ id: string; documentId: string; term: string }>;

  constructor() {
    super('AushadiDocuments');
    this.version(1).stores({
      documents: 'id, type, createdAt, synced, searchableText',
      searchIndex: 'id, documentId, term'
    });
  }
}

class DocumentStorageService {
  private db: DocumentDatabase;

  constructor() {
    this.db = new DocumentDatabase();
  }

  async init(): Promise<void> {
    try {
      log.info('Initializing document storage database');
      await this.db.open();
      log.info('Document storage database initialized successfully');
    } catch (error) {
      log.error('Failed to initialize document storage', error as Error);
      throw error;
    }
  }

  async storeDocument(
    fileName: string, 
    imageData: string, 
    analysis: DocumentAnalysis
  ): Promise<StoredDocument> {
    const document: StoredDocument = {
      id: crypto.randomUUID(),
      type: analysis.documentType,
      originalFileName: fileName,
      imageData,
      analysis,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
      tags: this.generateTags(analysis),
      searchableText: this.createSearchableText(analysis)
    };

    try {
      log.info('Storing document', { 
        id: document.id, 
        type: document.type, 
        fileName 
      });

      await this.db.transaction('rw', this.db.documents, this.db.searchIndex, async () => {
        // Store document
        await this.db.documents.add(document);
        
        // Update search index
        await this.updateSearchIndex(document);
      });
      
      log.info('Document stored successfully', { id: document.id });
      
      // Queue for background sync
      this.queueForSync(document);
      
      return document;
      
    } catch (error) {
      log.error('Failed to store document', error as Error, { fileName });
      throw error;
    }
  }

  async getDocument(id: string): Promise<StoredDocument | undefined> {
    try {
      const document = await this.db.documents.get(id);
      log.debug('Retrieved document', { id, found: !!document });
      return document;
    } catch (error) {
      log.error('Failed to get document', error as Error, { id });
      return undefined;
    }
  }

  async getAllDocuments(): Promise<StoredDocument[]> {
    try {
      const documents = await this.db.documents.orderBy('createdAt').reverse().toArray();
      log.debug('Retrieved all documents', { count: documents.length });
      return documents;
    } catch (error) {
      log.error('Failed to get all documents', error as Error);
      return [];
    }
  }

  async searchDocuments(filter: DocumentSearchFilter): Promise<StoredDocument[]> {
    try {
      log.debug('Searching documents', filter);
      
      let query = this.db.documents.orderBy('createdAt').reverse();
      
      // Apply type filter
      if (filter.type) {
        query = this.db.documents.where('type').equals(filter.type).reverse();
      }
      
      let documents = await query.toArray();
      
      // Apply additional filters
      if (filter.dateFrom) {
        documents = documents.filter(doc => doc.createdAt >= filter.dateFrom!);
      }
      
      if (filter.dateTo) {
        documents = documents.filter(doc => doc.createdAt <= filter.dateTo!);
      }
      
      if (filter.tags && filter.tags.length > 0) {
        documents = documents.filter(doc => 
          filter.tags!.some(tag => doc.tags.includes(tag))
        );
      }
      
      if (filter.searchText) {
        const searchTerm = filter.searchText.toLowerCase();
        documents = documents.filter(doc => 
          doc.searchableText.toLowerCase().includes(searchTerm)
        );
      }
      
      log.debug('Search completed', { 
        resultsCount: documents.length,
        filter 
      });
      
      return documents;
      
    } catch (error) {
      log.error('Document search failed', error as Error, filter);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      log.info('Deleting document', { id });
      
      await this.db.transaction('rw', this.db.documents, this.db.searchIndex, async () => {
        await this.db.documents.delete(id);
        // Clean up search index entries for this document
        await this.db.searchIndex.where('documentId').equals(id).delete();
      });
      
      log.info('Document deleted successfully', { id });
      return true;
      
    } catch (error) {
      log.error('Failed to delete document', error as Error, { id });
      return false;
    }
  }

  async getDocumentsByType(type: StoredDocument['type']): Promise<StoredDocument[]> {
    return this.searchDocuments({ type });
  }

  async getRecentDocuments(limit: number = 10): Promise<StoredDocument[]> {
    const documents = await this.getAllDocuments();
    return documents.slice(0, limit);
  }

  async getUnsyncedDocuments(): Promise<StoredDocument[]> {
    const documents = await this.getAllDocuments();
    return documents.filter(doc => !doc.synced);
  }

  async markDocumentSynced(id: string): Promise<void> {
    try {
      await this.db.documents.update(id, { 
        synced: true, 
        updatedAt: new Date() 
      });
      log.debug('Document marked as synced', { id });
    } catch (error) {
      log.error('Failed to mark document as synced', error as Error, { id });
    }
  }

  private generateTags(analysis: DocumentAnalysis): string[] {
    const tags: string[] = [analysis.documentType];
    
    // Add tags based on document content
    if (analysis.extractedData.medicines?.length) {
      tags.push('medicines');
      
      // Add specific medicine names as tags
      analysis.extractedData.medicines.forEach(medicine => {
        if (medicine.name) {
          tags.push(medicine.name.toLowerCase());
        }
      });
    }
    
    if (analysis.extractedData.total) {
      tags.push('with-total');
    }
    
    if (analysis.extractedData.date) {
      tags.push('dated');
    }
    
    if (analysis.extractedData.doctorInfo) {
      tags.push('doctor-prescription');
    }
    
    return Array.from(new Set(tags)); // Remove duplicates
  }

  private createSearchableText(analysis: DocumentAnalysis): string {
    const textParts: string[] = [];
    
    // Include raw OCR text
    if (analysis.rawText) {
      textParts.push(analysis.rawText);
    }
    
    // Include structured data
    if (analysis.extractedData.medicines) {
      analysis.extractedData.medicines.forEach(medicine => {
        if (medicine.name) textParts.push(medicine.name);
        if (medicine.batch) textParts.push(medicine.batch);
      });
    }
    
    if (analysis.extractedData.customerInfo?.name) {
      textParts.push(analysis.extractedData.customerInfo.name);
    }
    
    if (analysis.extractedData.doctorInfo?.name) {
      textParts.push(analysis.extractedData.doctorInfo.name);
    }
    
    if (analysis.extractedData.pharmacyInfo?.name) {
      textParts.push(analysis.extractedData.pharmacyInfo.name);
    }
    
    return textParts.join(' ').toLowerCase();
  }

  private async updateSearchIndex(document: StoredDocument): Promise<void> {
    // Simple search indexing - could be enhanced with better full-text search
    const words = document.searchableText.split(/\s+/).filter(word => word.length > 2);
    
    for (const word of words) {
      try {
        await this.db.searchIndex.put({
          id: `${document.id}-${word}`,
          documentId: document.id,
          term: word
        });
      } catch (error) {
        // Ignore indexing errors for individual terms
        log.warn('Failed to index term', { term: word, documentId: document.id });
      }
    }
  }

  private queueForSync(document: StoredDocument): void {
    // Queue document for background sync to server
    // This would integrate with the existing outbox pattern
    log.debug('Document queued for sync', { id: document.id });
    
    // TODO: Integrate with existing sync infrastructure
    // Could add to outbox for server synchronization
  }

  async getStorageStats(): Promise<{
    totalDocuments: number;
    documentsByType: Record<string, number>;
    unsyncedCount: number;
    totalSize: number;
  }> {
    const documents = await this.getAllDocuments();
    
    const stats = {
      totalDocuments: documents.length,
      documentsByType: {} as Record<string, number>,
      unsyncedCount: documents.filter(doc => !doc.synced).length,
      totalSize: documents.reduce((size, doc) => size + doc.imageData.length, 0)
    };
    
    // Count by type
    documents.forEach(doc => {
      stats.documentsByType[doc.type] = (stats.documentsByType[doc.type] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const documentStorage = new DocumentStorageService();