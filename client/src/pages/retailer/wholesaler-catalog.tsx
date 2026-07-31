import { useEffect, useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, ArrowLeft, Phone, MapPin, Package,
  ShoppingCart, Plus, Minus, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

interface Wholesaler {
  id: string;
  tenantId: string;
  name: string;
  businessAddress: string;
  contactPhone: string;
  gstNumber: string;
  products: WholesalerProduct[];
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function WholesalerCatalogPage() {
  const [, params] = useRoute('/retailer/wholesaler/:tenantId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params?.tenantId) {
      fetchWholesaler(params.tenantId);
    }
  }, [params?.tenantId]);

  const fetchWholesaler = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/retailer/wholesalers/${tenantId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setWholesaler(data);
      }
    } catch (error) {
      console.error('Failed to fetch wholesaler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = wholesaler?.products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const addToCart = (product: WholesalerProduct) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + product.minOrderQuantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: product.minOrderQuantity,
        unitPrice: product.basePrice,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const product = wholesaler?.products.find(p => p.id === productId);
        const minQty = product?.minOrderQuantity || 1;
        const newQty = Math.max(minQty, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const submitQuoteRequest = async () => {
    if (!wholesaler || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/retailer/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wholesalerTenantId: wholesaler.tenantId,
          items: cart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            requestedQuantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        toast({
          title: 'Quote Request Sent',
          description: `Your quote request has been sent to ${wholesaler.name}`,
        });
        setCart([]);
        setLocation('/retailer/my-quotes');
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to send quote request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send quote request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!wholesaler) {
    return (
      <div className="p-4 text-center">
        <p>Wholesaler not found</p>
        <Link href="/retailer/wholesalers">
          <Button variant="link">Go back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/retailer/wholesalers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{wholesaler.name}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {wholesaler.contactPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {wholesaler.contactPhone}
                </span>
              )}
              {wholesaler.businessAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {wholesaler.businessAddress.slice(0, 30)}...
                </span>
              )}
            </div>
          </div>
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
      </div>

      {/* Products */}
      <div className="p-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No products found</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.productId === product.id);

            return (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.manufacturer} • {product.packSize}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span>
                          PTR: <span className="font-medium">₹{product.basePrice}</span>
                        </span>
                        <span>
                          MRP: <span className="text-gray-500">₹{product.mrp}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Min order: {product.minOrderQuantity} units •
                        Stock: {product.stockQuantity > 0 ? (
                          <span className="text-green-600">{product.stockQuantity} available</span>
                        ) : (
                          <span className="text-red-600">Out of stock</span>
                        )}
                      </p>
                    </div>

                    <div className="ml-4">
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (cartItem.quantity <= product.minOrderQuantity) {
                                removeFromCart(product.id);
                              } else {
                                updateQuantity(product.id, -product.minOrderQuantity);
                              }
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(product.id, product.minOrderQuantity)}
                            disabled={product.stockQuantity <= 0}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity <= 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium">{cart.length} item{cart.length > 1 ? 's' : ''} selected</p>
              <p className="text-sm text-gray-500">Est. Total: ₹{getCartTotal().toLocaleString()}</p>
            </div>
            <Button onClick={submitQuoteRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Request Quote
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
