import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { AppHeader } from '@/components/app-header';

export default function WholesalerProductNewPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);

  // Check if user is authenticated as wholesaler
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          setAuthError(true);
          // Clear stale localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
        } else {
          const user = await res.json();
          if (user.role !== 'wholesaler') {
            setAuthError(true);
          }
        }
      } catch {
        setAuthError(true);
      }
    };
    checkAuth();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    category: '',
    packSize: '',
    basePrice: '',
    mrp: '',
    stockQuantity: '',
    minOrderQuantity: '1',
    isActive: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/wholesaler/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          manufacturer: formData.manufacturer,
          category: formData.category,
          packSize: formData.packSize,
          basePrice: parseFloat(formData.basePrice),
          mrp: parseFloat(formData.mrp),
          stockQuantity: parseInt(formData.stockQuantity),
          minOrderQuantity: parseInt(formData.minOrderQuantity),
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        setLocation('/wholesaler/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (authError) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader />
        <div className="p-4 flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-4">
                Please log in again to access wholesaler features.
              </p>
              <Button onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                window.location.href = '/';
              }}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/wholesaler/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Add Product</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new product to your catalog
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Paracetamol 500mg"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., Cipla"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Analgesic"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size *</Label>
                <Input
                  id="packSize"
                  placeholder="e.g., 10 tablets"
                  value={formData.packSize}
                  onChange={(e) => handleChange('packSize', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">PTR (₹) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.basePrice}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Price to Retailer</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp">MRP (₹) *</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.mrp}
                  onChange={(e) => handleChange('mrp', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Maximum Retail Price</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => handleChange('stockQuantity', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Min Order Qty</Label>
                <Input
                  id="minOrderQuantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minOrderQuantity}
                  onChange={(e) => handleChange('minOrderQuantity', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label htmlFor="isActive" className="font-medium">Active Status</Label>
                <p className="text-xs text-gray-500">Product visible to retailers</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Product
        </Button>
      </form>
      </div>
    </div>
  );
}
