import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { AppHeader } from '@/components/app-header';

interface WholesalerProduct {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  packSize: string;
  basePrice: number;
  mrp: number;
  stockQuantity: number;
  minOrderQuantity: number;
  isActive: boolean;
}

export default function WholesalerProductsPage() {
  const [products, setProducts] = useState<WholesalerProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/wholesaler/products', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Product Catalog</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your products for retailers
            </p>
          </div>
        <Link href="/wholesaler/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start by adding products to your catalog
            </p>
            <Link href="/wholesaler/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{product.name}</h3>
                      {!product.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.manufacturer} • {product.packSize}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span>
                        PTR: <span className="font-medium">₹{product.basePrice}</span>
                      </span>
                      <span>
                        MRP: <span className="font-medium">₹{product.mrp}</span>
                      </span>
                      <span>
                        Stock: <span className={`font-medium ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stockQuantity}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
