import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProductRow {
  name: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  packSize?: string;
  minOrderQuantity?: number;
  basePrice: number;
  mrp?: number;
  stockQuantity: number;
  reorderLevel?: number;
  batchNumber?: string;
  expiryDate?: string;
  hsnCode?: string;
  gstPercentage?: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkImportPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedProducts: ProductRow[] = jsonData.map((row: any) => ({
        name: row['Name'] || row['name'] || row['Product Name'] || '',
        description: row['Description'] || row['description'] || '',
        manufacturer: row['Manufacturer'] || row['manufacturer'] || row['Brand'] || '',
        category: row['Category'] || row['category'] || '',
        packSize: row['Pack Size'] || row['packSize'] || row['Pack'] || '',
        minOrderQuantity: parseInt(row['Min Order Qty'] || row['minOrderQuantity'] || '1') || 1,
        basePrice: parseFloat(row['PTR'] || row['Base Price'] || row['basePrice'] || row['Price'] || '0') || 0,
        mrp: parseFloat(row['MRP'] || row['mrp'] || '0') || undefined,
        stockQuantity: parseInt(row['Stock'] || row['stockQuantity'] || row['Quantity'] || '0') || 0,
        reorderLevel: parseInt(row['Reorder Level'] || row['reorderLevel'] || '10') || 10,
        batchNumber: row['Batch'] || row['batchNumber'] || row['Batch Number'] || '',
        expiryDate: row['Expiry'] || row['expiryDate'] || row['Expiry Date'] || '',
        hsnCode: row['HSN'] || row['hsnCode'] || row['HSN Code'] || '',
        gstPercentage: parseFloat(row['GST%'] || row['gstPercentage'] || row['GST'] || '12') || 12,
      }));

      setProducts(parsedProducts.filter(p => p.name));
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    if (products.length === 0) return;

    setIsImporting(true);
    setResult(null);

    try {
      const res = await fetch('/api/wholesaler/products/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success > 0) {
        setProducts([]);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setResult({ success: 0, failed: products.length, errors: ['Network error'] });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Name': 'Paracetamol 500mg',
        'Description': 'Antipyretic tablet',
        'Manufacturer': 'Cipla',
        'Category': 'Antipyretics',
        'Pack Size': '10 tablets',
        'Min Order Qty': 10,
        'PTR': 45.50,
        'MRP': 55.00,
        'Stock': 1000,
        'Reorder Level': 100,
        'Batch': 'BAT2024001',
        'Expiry': '2025-12-31',
        'HSN': '30049099',
        'GST%': 12,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-6 flex-1 overflow-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Product Import</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload Excel or CSV file to import multiple products at once
          </p>
        </div>

        {/* Template Download */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Step 1: Download Template</CardTitle>
            <CardDescription>Use our template to ensure correct data format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Step 2: Upload File</CardTitle>
            <CardDescription>Upload your Excel (.xlsx) or CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isUploading ? 'Processing...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {products.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Step 3: Review & Import</CardTitle>
                  <CardDescription>{products.length} products ready to import</CardDescription>
                </div>
                <Badge variant="secondary">{products.length} products</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Manufacturer</th>
                      <th className="text-right p-2">PTR</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-left p-2">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 20).map((product, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.manufacturer || '-'}</td>
                        <td className="p-2 text-right">{product.basePrice}</td>
                        <td className="p-2 text-right">{product.stockQuantity}</td>
                        <td className="p-2">{product.expiryDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length > 20 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    ... and {products.length - 20} more products
                  </p>
                )}
              </div>
              <Button onClick={handleImport} disabled={isImporting} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : `Import ${products.length} Products`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className={result.failed > 0 ? 'border-yellow-500' : 'border-green-500'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {result.failed === 0 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">
                    {result.success} products imported successfully
                  </p>
                  {result.failed > 0 && (
                    <p className="text-sm text-red-600">{result.failed} failed</p>
                  )}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600">
                  {result.errors.slice(0, 5).map((error, idx) => (
                    <p key={idx}>{error}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
