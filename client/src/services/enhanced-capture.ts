import { createModuleLogger } from '../utils/app-logger';
import { aiVision, type DocumentAnalysis } from './ai-vision';
import { documentStorage, type StoredDocument } from './document-storage';
import { cameraCapture } from './camera-capture';

const log = createModuleLogger('EnhancedCapture');

export interface CaptureResult {
  success: boolean;
  document?: StoredDocument;
  error?: string;
  message?: string;
}

export interface CaptureOptions {
  autoClassify?: boolean;
  skipConfirmation?: boolean;
  category?: 'bill' | 'prescription' | 'invoice';
  tags?: string[];
}

class EnhancedCaptureService {
  private isProcessing = false;

  /**
   * Compress image for optimal OCR performance without losing quality
   */
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions for OCR (max 1920x1080 for good balance)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw with high quality settings for text recognition
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with optimized settings for OCR
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          0.85 // 85% quality - optimal balance for OCR text recognition
        );
      };
      
      img.onerror = () => resolve(file); // Fallback to original on error
      img.src = URL.createObjectURL(file);
    });
  }

  async captureAndAnalyze(
    source: 'camera' | 'file',
    file?: File,
    options: CaptureOptions = {}
  ): Promise<CaptureResult> {
    if (this.isProcessing) {
      return {
        success: false,
        error: 'Another capture is already in progress'
      };
    }

    this.isProcessing = true;

    try {
      log.info('Starting enhanced capture and analysis', { source, options });

      // Step 1: Get the image file
      let imageFile: File;
      
      if (source === 'file' && file) {
        imageFile = file;
        log.debug('Using provided file', { name: file.name, size: file.size });
      } else if (source === 'camera') {
        // Use existing camera capture infrastructure
        const captureResult = await this.captureFromCamera();
        if (!captureResult.success || !captureResult.file) {
          return {
            success: false,
            error: captureResult.error || 'Camera capture failed'
          };
        }
        imageFile = captureResult.file;
        log.debug('Camera capture successful', { size: imageFile.size });
      } else {
        return {
          success: false,
          error: 'Invalid capture source or missing file'
        };
      }

      // Step 1.5: Compress image for better OCR and reduced bandwidth
      log.info('Compressing image for optimal OCR performance');
      const compressedFile = await this.compressImage(imageFile);
      log.debug('Image compression completed', { 
        originalSize: imageFile.size, 
        compressedSize: compressedFile.size,
        compressionRatio: Math.round((1 - compressedFile.size / imageFile.size) * 100)
      });

      // Step 2: Analyze with OpenAI Vision
      log.info('Starting AI vision analysis');
      const analysis = await aiVision.analyzeDocument(compressedFile);
      
      log.info('AI analysis completed', {
        documentType: analysis.documentType,
        confidence: analysis.confidence,
        processingTime: analysis.metadata.processingTime
      });

      // Step 3: User confirmation (if not skipped)
      if (!options.skipConfirmation) {
        const confirmed = await this.confirmDocumentType(analysis);
        if (!confirmed) {
          return {
            success: false,
            message: 'Document analysis cancelled by user'
          };
        }
      }

      // Step 4: Store in document database
      const imageDataUrl = await this.fileToDataUrl(imageFile);
      const storedDocument = await documentStorage.storeDocument(
        imageFile.name || `capture-${Date.now()}.jpg`,
        imageDataUrl,
        analysis
      );

      // Step 5: Extract and update inventory (if applicable)
      if (analysis.documentType === 'invoice' && analysis.extractedData.medicines) {
        await this.updateInventoryFromAnalysis(analysis);
      }

      log.info('Enhanced capture completed successfully', {
        documentId: storedDocument.id,
        type: storedDocument.type
      });

      return {
        success: true,
        document: storedDocument,
        message: `${analysis.documentType} analyzed and stored successfully`
      };

    } catch (error) {
      log.error('Enhanced capture failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private async captureFromCamera(): Promise<{ success: boolean; file?: File; error?: string }> {
    try {
      log.debug('Initiating camera capture');
      
      const result = await cameraCapture.captureImage();
      
      return {
        success: result.success,
        file: result.file,
        error: result.error
      };
      
    } catch (error) {
      log.error('Camera capture failed', error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Camera capture failed' 
      };
    }
  }

  private async confirmDocumentType(analysis: DocumentAnalysis): Promise<boolean> {
    return new Promise((resolve) => {
      log.debug('Requesting user confirmation for document type', {
        type: analysis.documentType,
        confidence: analysis.confidence
      });

      // Create confirmation dialog
      const confirmed = confirm(
        `Document detected as: ${analysis.documentType.toUpperCase()}\n` +
        `Confidence: ${(analysis.confidence * 100).toFixed(1)}%\n\n` +
        `Proceed with analysis?`
      );

      log.debug('User confirmation result', { confirmed });
      resolve(confirmed);
    });
  }

  private async updateInventoryFromAnalysis(analysis: DocumentAnalysis): Promise<void> {
    try {
      log.info('Updating inventory from invoice analysis');
      
      if (!analysis.extractedData.medicines?.length) {
        log.warn('No medicines found in analysis for inventory update');
        return;
      }

      // Extract bill info for duplicate detection
      const billNumber = (analysis.extractedData as any)?.pharmacyInfo?.billNumber || 
                        (analysis.extractedData as any)?.header?.docNo ||
                        'unknown';
      const invoiceDate = analysis.extractedData.date;

      // Check for duplicate invoices before updating stock
      if (billNumber && billNumber !== 'unknown') {
        const existingDocs = await documentStorage.getAllDocuments();
        const duplicateDoc = existingDocs.find((doc: any) => 
          doc.analysis?.extractedData?.header?.docNo === billNumber ||
          doc.fileName?.includes(billNumber)
        );
        
        if (duplicateDoc) {
          log.warn('Duplicate invoice detected, skipping stock update', { billNumber });
          return;
        }
      }

      // Prepare bulk stock update
      const stockUpdates = analysis.extractedData.medicines.map(medicine => ({
        name: medicine.name,
        quantity: medicine.quantity || 0,
        price: medicine.price || 0,
        batch: medicine.batch || '',
        expiry: medicine.expiry || ''
      }));

      log.debug('Prepared stock updates', { count: stockUpdates.length });

      // Call existing bulk stock update API with duplicate detection info
      const response = await fetch('/api/stock/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: stockUpdates,
          billNumber: billNumber,
          date: invoiceDate
        })
      });

      if (response.ok) {
        log.info('Inventory updated successfully', { itemsUpdated: stockUpdates.length });
      } else {
        log.error('Inventory update failed', undefined, { status: response.status });
      }

    } catch (error) {
      log.error('Failed to update inventory from analysis', error as Error);
    }
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async getProcessingStatus(): Promise<{ isProcessing: boolean }> {
    return { isProcessing: this.isProcessing };
  }

  async testAIConnection(): Promise<boolean> {
    try {
      return await aiVision.testConnection();
    } catch (error) {
      log.error('AI connection test failed', error as Error);
      return false;
    }
  }

  async getRecentDocuments(limit: number = 10): Promise<StoredDocument[]> {
    try {
      return await documentStorage.getRecentDocuments(limit);
    } catch (error) {
      log.error('Failed to get recent documents', error as Error);
      return [];
    }
  }

  async searchDocuments(searchText: string, type?: 'bill' | 'prescription' | 'invoice'): Promise<StoredDocument[]> {
    try {
      return await documentStorage.searchDocuments({
        searchText,
        type
      });
    } catch (error) {
      log.error('Document search failed', error as Error);
      return [];
    }
  }

  async getDocumentAnalysis(documentId: string): Promise<DocumentAnalysis | null> {
    try {
      const document = await documentStorage.getDocument(documentId);
      return document?.analysis || null;
    } catch (error) {
      log.error('Failed to get document analysis', error as Error);
      return null;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      return await documentStorage.deleteDocument(documentId);
    } catch (error) {
      log.error('Failed to delete document', error as Error);
      return false;
    }
  }

  async generateDocumentReport(type?: 'bill' | 'prescription' | 'invoice'): Promise<{
    totalDocuments: number;
    recentCount: number;
    topMedicines: string[];
    summary: string;
  }> {
    try {
      log.info('Generating document report', { type });
      
      const documents = type 
        ? await documentStorage.getDocumentsByType(type)
        : await documentStorage.getAllDocuments();

      const recentDocuments = documents.filter(doc => 
        Date.now() - doc.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );

      // Extract top medicines across all documents
      const medicineCount: Record<string, number> = {};
      documents.forEach(doc => {
        doc.analysis.extractedData.medicines?.forEach(medicine => {
          if (medicine.name) {
            medicineCount[medicine.name] = (medicineCount[medicine.name] || 0) + 1;
          }
        });
      });

      const topMedicines = Object.entries(medicineCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name]) => name);

      const summary = `Analyzed ${documents.length} ${type || 'documents'} with ${recentDocuments.length} recent entries. ` +
        `Top medicines: ${topMedicines.slice(0, 3).join(', ')}.`;

      return {
        totalDocuments: documents.length,
        recentCount: recentDocuments.length,
        topMedicines,
        summary
      };

    } catch (error) {
      log.error('Failed to generate document report', error as Error);
      return {
        totalDocuments: 0,
        recentCount: 0,
        topMedicines: [],
        summary: 'Report generation failed'
      };
    }
  }
}

// Export singleton instance
export const enhancedCapture = new EnhancedCaptureService();