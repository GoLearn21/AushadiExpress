// Simple test page for offline document capture functionality
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { CategorySelector } from '../components/category-selector';
import { captureDocument, getCapturesByCategory, getCaptureStats } from '../services/offline-capture';
import { useToast } from '../hooks/use-toast';

export default function OfflineTestPage() {
  const [category, setCategory] = useState<'invoice' | 'prescription' | 'bill'>('invoice');
  const [isProcessing, setIsProcessing] = useState(false);
  const [captures, setCaptures] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Create object URL for the file
      const imageUri = URL.createObjectURL(file);
      
      console.log('[OFFLINE-TEST] Processing file:', file.name);
      
      // Use offline capture service
      const result = await captureDocument(imageUri, category);
      
      toast({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Processed ✅`,
        description: `Document saved offline with ID: ${result.captureId.slice(0, 8)}...`,
      });
      
      // Refresh captures list
      await loadCaptures();
      await loadStats();
      
    } catch (error) {
      console.error('[OFFLINE-TEST] Processing failed:', error);
      toast({
        title: 'Processing Failed',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadCaptures = async () => {
    try {
      const captures = await getCapturesByCategory(category);
      setCaptures(captures);
    } catch (error) {
      console.error('Failed to load captures:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await getCaptureStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  React.useEffect(() => {
    loadCaptures();
    loadStats();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Offline Document Capture Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test offline image-to-text processing with IndexedDB storage
          </p>
        </div>

        {/* Category Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <CategorySelector
            selected={category}
            onSelect={setCategory}
          />
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Processing with OCR...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Storage Stats</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.invoice}</div>
                <div className="text-sm text-gray-500">Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.prescription}</div>
                <div className="text-sm text-gray-500">Prescriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.bill}</div>
                <div className="text-sm text-gray-500">Bills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Captures List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent {category.charAt(0).toUpperCase() + category.slice(1)} Captures
          </h2>
          
          {captures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No {category} captures found. Upload a document to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {captures.slice(0, 5).map((capture) => (
                <div
                  key={capture.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {capture.id.slice(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(capture.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Text: {capture.text.substring(0, 100)}...
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {capture.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {captures.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadCaptures}
              className="w-full mt-4"
            >
              Load More
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}