import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  totalQuantity: number;
}

interface Stock {
  id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string | null;
}

export default function CustomerStoreProductsPage() {
  const [, params] = useRoute('/store/:tenantId/:storeName');
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState<string | null>(null);
  const [storePhone, setStorePhone] = useState<string | null>(null);
  const { toast } = useToast();
  const { addToCart, getCartItemCount } = useCart();
  const tenantId = params?.tenantId;
  const storeNameFromUrl = params?.storeName ? decodeURIComponent(params.storeName) : '';

  useEffect(() => {
    if (tenantId && storeNameFromUrl) {
      fetchStoreInfo();
      fetchStoreProducts();
    }
  }, [tenantId, storeNameFromUrl]);

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch('/api/retail-stores', { credentials: 'include' });
      if (response.ok) {
        const stores = await response.json();
        const store = stores.find((s: any) => 
          s.tenantId === tenantId && s.buyerName === storeNameFromUrl
        );
        if (store) {
          setStoreName(store.buyerName);
          setStoreAddress(store.buyerAddress);
          setStorePhone(store.buyerPhone);
        } else {
          // Fallback: use the name from URL
          setStoreName(storeNameFromUrl);
        }
      } else {
        // Fallback: use the name from URL
        setStoreName(storeNameFromUrl);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
      // Fallback: use the name from URL
      setStoreName(storeNameFromUrl);
    }
  };

  const fetchStoreProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, stockRes] = await Promise.all([
        fetch(`/api/products?tenantId=${tenantId}`, { credentials: 'include' }),
        fetch(`/api/stock?tenantId=${tenantId}`, { credentials: 'include' })
      ]);
      
      if (productsRes.ok && stockRes.ok) {
        const productsData = await productsRes.json();
        const stockData = await stockRes.json();
        setProducts(productsData);
        setStock(stockData);
      } else {
        toast({ 
          title: "Unable to fetch products", 
          description: "Please try again later",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
      toast({ 
        title: "Network error", 
        description: "Please check your connection",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!tenantId) return;
    
    addToCart({
      productId: product.id,
      productName: product.name,
      description: product.description,
      price: product.price,
      quantity: 1,
      storeName: storeName || 'Unknown Store',
      storeId: tenantId,
      storeAddress,
      storePhone,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductStock = (productId: string) => {
    return stock.filter(s => s.productName === products.find(p => p.id === productId)?.name);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setLocation('/nearby-stores')} className="material-icons text-xl">
              arrow_back
            </button>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>{storeName || 'Available Medicines'}</h1>
          </div>
          <button
            onClick={() => setLocation('/cart')}
            className="relative p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <span className="material-icons text-xl">shopping_cart</span>
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto">
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <span className="material-icons absolute left-3 top-3 text-gray-400">search</span>
                <Input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Info Header */}
            <div className="mb-6">
              <p className="text-gray-600">
                {loading 
                  ? 'Loading products...' 
                  : filteredProducts.length > 0 
                    ? `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}` 
                    : 'No products found'}
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-icons text-6xl text-blue-500 animate-spin mb-4">refresh</span>
                <p className="text-gray-600">Loading medicines...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4">medical_services</span>
                <p className="text-lg font-medium text-gray-900 mb-2">No medicines available</p>
                <p className="text-sm text-gray-600 mb-6">This store has no products in stock</p>
                <Button onClick={() => setLocation('/nearby-stores')} variant="outline">
                  View Other Stores
                </Button>
              </div>
            ) : (
              /* Product List */
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const productStock = getProductStock(product.id);
                  const totalStock = productStock.reduce((sum, s) => sum + s.quantity, 0);
                  
                  return (
                    <Card key={product.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center">
                                <span className="material-icons text-sm mr-1 text-green-600">inventory_2</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="material-icons text-sm mr-1 text-blue-600">currency_rupee</span>
                                <span className="text-lg font-semibold text-gray-900">{product.price}</span>
                              </div>
                            </div>
                            {productStock.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Available batches:</p>
                                <div className="space-y-1">
                                  {productStock.slice(0, 2).map((s) => (
                                    <div key={s.id} className="text-xs text-gray-600 flex items-center space-x-2">
                                      <span className="bg-gray-100 px-2 py-0.5 rounded">{s.batchNumber}</span>
                                      <span>Qty: {s.quantity}</span>
                                      {s.expiryDate && (
                                        <span className="text-gray-400">
                                          Exp: {new Date(s.expiryDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  {productStock.length > 2 && (
                                    <p className="text-xs text-blue-600">+{productStock.length - 2} more batches</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex flex-col items-center space-y-2">
                            {totalStock > 0 ? (
                              <>
                                <span className="material-icons text-green-500 text-2xl">check_circle</span>
                                <Button 
                                  onClick={() => handleAddToCart(product)}
                                  size="sm"
                                  className="w-full"
                                >
                                  <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                                  Add
                                </Button>
                              </>
                            ) : (
                              <span className="material-icons text-gray-300 text-3xl">cancel</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
