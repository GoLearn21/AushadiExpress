import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ExcelUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/stock/excel', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);

      // Invalidate stock and products queries to refresh inventory
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });

      toast({
        title: 'Upload Successful!',
        description: `${data.itemsProcessed} items added to inventory`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an Excel file (.xlsx, .xls, .xlsm, or .xlsb)',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadResult(null);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select an Excel file first',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation('/inventory')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Upload Excel Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Bulk import your existing stock from Excel
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="material-icons text-blue-600">info</span>
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">Upload any Excel file with your inventory data!</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>AI automatically detects column names (Product, Batch, Qty, Expiry, Price)</li>
            <li>No need to match a specific format - works with YOUR existing spreadsheet</li>
            <li>Supports .xlsx, .xls, .xlsm, and .xlsb files</li>
            <li>All products and stock will be added to your inventory</li>
          </ul>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Excel File</CardTitle>
          <CardDescription>
            Choose your Excel file containing inventory data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-gray-300 dark:border-gray-700 hover:border-primary'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm,.xlsb"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <span className={`material-icons text-5xl transition-colors ${
                isDragging ? 'text-primary animate-bounce' : 'text-primary'
              }`}>
                upload_file
              </span>
              <div>
                <p className="font-medium">
                  {isDragging ? 'Drop Excel file here' : 'Click to select Excel file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or drag and drop
                </p>
              </div>
              {selectedFile && !isDragging && (
                <div className="mt-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    <span className="material-icons text-sm align-middle mr-1">description</span>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="material-icons animate-spin mr-2">sync</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">cloud_upload</span>
                  Upload & Process
                </>
              )}
            </Button>

            {selectedFile && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={uploadMutation.isPending}
              >
                <span className="material-icons">close</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
              <span className="material-icons">check_circle</span>
              Upload Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Items Processed</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {uploadResult.itemsProcessed}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {(uploadResult.processingTime / 1000).toFixed(2)}s
                </p>
              </div>
            </div>

            {uploadResult.aiMapping && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">AI Detected Columns:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">label</span>
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{uploadResult.aiMapping.productName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">label</span>
                    <span className="text-muted-foreground">Batch:</span>
                    <span className="font-medium">{uploadResult.aiMapping.batch}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">label</span>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{uploadResult.aiMapping.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">label</span>
                    <span className="text-muted-foreground">Expiry:</span>
                    <span className="font-medium">{uploadResult.aiMapping.expiry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">label</span>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{uploadResult.aiMapping.price}</span>
                  </div>
                </div>
              </div>
            )}

            {uploadResult.preview && uploadResult.preview.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Sample Items:</p>
                <div className="space-y-1">
                  {uploadResult.preview.map((item: any, idx: number) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      {item.name} - {item.qty} units @ ₹{item.mrp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <Button
                onClick={() => setLocation('/inventory')}
                className="flex-1"
              >
                <span className="material-icons mr-2">inventory</span>
                View Inventory
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <span className="material-icons mr-2">upload_file</span>
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
