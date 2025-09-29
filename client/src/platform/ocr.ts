// On-device OCR using Tesseract.js
import { createWorker } from 'tesseract.js';

let worker: any = null;

async function initWorker() {
  if (worker) return worker;
  
  console.log('[OCR] Initializing Tesseract worker...');
  worker = await createWorker('eng');
  console.log('[OCR] Tesseract worker ready');
  return worker;
}

export async function ocrImage(imageUri: string): Promise<string> {
  console.log('[OCR] Starting OCR processing for:', imageUri);
  
  try {
    const ocrWorker = await initWorker();
    
    // For IndexedDB URIs, we need to load the blob first
    let imageSource = imageUri;
    if (imageUri.startsWith('idb://')) {
      const { loadImageLocal } = await import('./file-storage');
      imageSource = await loadImageLocal(imageUri);
    }
    
    console.log('[OCR] Processing image with Tesseract...');
    const { data: { text } } = await ocrWorker.recognize(imageSource);
    
    console.log('[OCR] Text extracted, length:', text.length);
    console.log('[OCR] Preview:', text.substring(0, 100) + '...');
    
    return text;
    
  } catch (error) {
    console.error('[OCR] Processing failed:', error);
    throw new Error(`OCR processing failed: ${error}`);
  }
}

export async function terminateWorker() {
  if (worker) {
    console.log('[OCR] Terminating Tesseract worker');
    await worker.terminate();
    worker = null;
  }
}