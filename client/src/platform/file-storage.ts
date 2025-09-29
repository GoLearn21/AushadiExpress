// Cross-platform file storage abstraction
import { db } from '@/lib/db';

export async function saveImageLocal(
  srcUri: string,
  category: 'invoice' | 'prescription' | 'bill'
): Promise<string> {
  const id = crypto.randomUUID();
  const filename = `${category}-${id}.jpg`;

  console.log(`[FILE-STORAGE] Saving image for category: ${category}`);

  if (typeof window !== 'undefined') {
    // WEB: Use IndexedDB for blob storage
    try {
      console.log('[FILE-STORAGE] Web platform - using IndexedDB');
      
      let blob: Blob;
      
      // Handle different URI types
      if (srcUri.startsWith('blob:')) {
        // Direct blob URL from file picker
        const response = await fetch(srcUri);
        blob = await response.blob();
      } else if (srcUri.startsWith('data:')) {
        // Data URL from canvas
        const response = await fetch(srcUri);
        blob = await response.blob();
      } else {
        // File or other URL
        const response = await fetch(srcUri);
        blob = await response.blob();
      }

      // Store in appropriate image table
      const imageTable = db.getImageTable(category);
      await imageTable.put({ id: filename, blob });
      
      const uri = `idb://${category}Images/${filename}`;
      console.log('[FILE-STORAGE] Image saved to IndexedDB:', uri);
      return uri;
      
    } catch (error) {
      console.error('[FILE-STORAGE] Failed to save image:', error);
      throw new Error(`Failed to save ${category} image: ${error}`);
    }
  } else {
    // REACT NATIVE: Use file system (not implemented in web environment)
    console.log('[FILE-STORAGE] React Native platform - using file system');
    throw new Error('React Native file system not available in web environment');
  }
}

export async function loadImageLocal(uri: string): Promise<string> {
  console.log('[FILE-STORAGE] Loading image from:', uri);
  
  if (uri.startsWith('idb://')) {
    // IndexedDB blob storage
    const [, tableAndPath] = uri.split('idb://');
    const [tableName, filename] = tableAndPath.split('/');
    
    const imageTable = db.getImageTable(tableName.replace('Images', ''));
    const record = await imageTable.get(filename);
    
    if (!record) {
      throw new Error(`Image not found: ${uri}`);
    }
    
    // Convert blob to object URL
    const objectUrl = URL.createObjectURL(record.blob);
    console.log('[FILE-STORAGE] Image loaded from IndexedDB');
    return objectUrl;
    
  } else if (uri.startsWith('file://')) {
    // File system (React Native)
    console.log('[FILE-STORAGE] Loading from file system');
    return uri;
    
  } else {
    // Direct URL
    return uri;
  }
}