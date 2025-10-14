import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CustomerHeader } from '@/components/customer-header';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface SavedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface SavedOrder {
  id: string;
  orderId: string;
  storeTenantId: string;
  storeName: string;
  storeAddress?: string;
  items: SavedOrderItem[];
  totalAmount: number;
  savedAt: string;
}

export default function CustomerSavedOrdersPage() {
  const [, setLocation] = useLocation();
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Load saved orders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedOrders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedOrders(parsed);
      } catch (e) {
        console.error('Failed to load saved orders:', e);
      }
    }
  }, []);

  const handleReorder = async (order: SavedOrder) => {
    try {
      console.log('[REORDER] Starting reorder for:', order);

      // Check product availability first
      const response = await fetch(`/api/products?tenantId=${order.storeTenantId}`, {
        credentials: 'include',
      });

      console.log('[REORDER] Products response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const storeProducts = await response.json();
      console.log('[REORDER] Store products:', storeProducts);

      // Check which items are still available
      const availableItems = order.items.filter(item => {
        const product = storeProducts.find((p: any) => p.id === item.productId);
        const isAvailable = product && product.totalQuantity > 0;
        console.log('[REORDER] Item availability check:', {
          itemName: item.productName,
          productId: item.productId,
          found: !!product,
          stock: product?.totalQuantity,
          isAvailable
        });
        return isAvailable;
      });

      console.log('[REORDER] Available items:', availableItems.length, 'of', order.items.length);

      if (availableItems.length === 0) {
        toast({
          title: "Items not available",
          description: "None of the items from this order are currently in stock",
          variant: "destructive",
        });
        return;
      }

      // Add available items to cart
      console.log('[REORDER] Adding items to cart...');
      availableItems.forEach(item => {
        const product = storeProducts.find((p: any) => p.id === item.productId);
        const cartItem = {
          productId: item.productId,
          productName: item.productName,
          description: product?.description || null,
          price: item.price,
          quantity: item.quantity,
          storeId: order.storeTenantId,
          storeName: order.storeName,
          storeAddress: order.storeAddress || null,
          storePhone: null,
        };
        console.log('[REORDER] Adding to cart:', cartItem);
        addToCart(cartItem);
      });

      const unavailableCount = order.items.length - availableItems.length;

      if (unavailableCount > 0) {
        toast({
          title: "Partial reorder",
          description: `${availableItems.length} items added to cart. ${unavailableCount} items are out of stock.`,
        });
      } else {
        toast({
          title: "Added to cart",
          description: `All ${availableItems.length} items added to cart`,
        });
      }

      // Navigate to cart after a brief delay
      console.log('[REORDER] Navigating to cart...');
      setTimeout(() => {
        setLocation('/cart');
      }, 500);
    } catch (error) {
      console.error('[REORDER] Error:', error);
      toast({
        title: "Reorder failed",
        description: error instanceof Error ? error.message : "Unable to reorder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSavedOrder = (orderId: string) => {
    const updated = savedOrders.filter(order => order.id !== orderId);
    setSavedOrders(updated);
    localStorage.setItem('savedOrders', JSON.stringify(updated));
    toast({
      title: "Removed",
      description: "Saved order removed",
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <OfflineIndicator />
      <CustomerHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => setLocation('/search')}
                className="flex items-center text-blue-600 mb-2"
              >
                <span className="material-icons text-sm mr-1">arrow_back</span>
                <span className="text-sm font-medium">Back to Search</span>
              </button>
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Saved Orders</h1>
              <p className="text-sm text-gray-600 mt-1">
                Quickly reorder your favorite items
              </p>
            </div>

            {/* Saved Orders List */}
            {savedOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-5xl text-pink-400">favorite_border</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No saved orders yet</h3>
                  <p className="text-gray-600 mb-6">
                    Save your orders for quick reordering later
                  </p>
                  <Button onClick={() => setLocation('/orders')} className="bg-blue-600 hover:bg-blue-700">
                    <span className="material-icons text-sm mr-2">shopping_bag</span>
                    View My Orders
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Store Header */}
                      <div className="bg-gray-50 border-b p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-icons text-blue-600 text-lg">storefront</span>
                              <h3 className="font-semibold text-gray-900">{order.storeName}</h3>
                            </div>
                            {order.storeAddress && (
                              <p className="text-xs text-gray-500 ml-7">{order.storeAddress}</p>
                            )}
                            <p className="text-xs text-gray-400 ml-7 mt-1">
                              Saved on {new Date(order.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                            <span className="material-icons text-xs mr-1">favorite</span>
                            Saved
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.productName} x {item.quantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-lg font-bold text-blue-600">
                              ₹{order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReorder(order)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <span className="material-icons text-sm mr-2">shopping_cart</span>
                            Reorder
                          </Button>
                          <Button
                            onClick={() => handleRemoveSavedOrder(order.id)}
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <span className="material-icons text-sm">delete</span>
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
      </div>
    </div>
  );
}
