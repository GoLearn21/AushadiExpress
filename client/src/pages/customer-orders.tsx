import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CustomerHeader } from '@/components/customer-header';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[] | string;
  total: number;
  date: string;
  status: string;
  storeName?: string;
  storeAddress?: string;
  tenantId?: string;
}

export default function CustomerOrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  const { toast } = useToast();

  const handleSaveOrder = (order: Order) => {
    try {
      // Parse items
      let items: OrderItem[] = [];
      if (typeof order.items === 'string') {
        items = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }

      // Get existing saved orders
      const stored = localStorage.getItem('savedOrders');
      const savedOrders = stored ? JSON.parse(stored) : [];

      // Check if already saved
      const alreadySaved = savedOrders.some((saved: any) => saved.orderId === order.id);
      if (alreadySaved) {
        toast({
          title: "Already saved",
          description: "This order is already in your saved orders",
        });
        return;
      }

      // Create saved order
      const savedOrder = {
        id: `saved-${Date.now()}`,
        orderId: order.id,
        storeTenantId: order.tenantId || '',
        storeName: order.storeName || 'Unknown Store',
        storeAddress: order.storeAddress,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.total,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const updated = [savedOrder, ...savedOrders];
      localStorage.setItem('savedOrders', JSON.stringify(updated));

      toast({
        title: "Order saved",
        description: "You can reorder this anytime from Saved Orders",
      });
    } catch (error) {
      console.error('Failed to save order:', error);
      toast({
        title: "Save failed",
        description: "Unable to save order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <OfflineIndicator />
      
      <CustomerHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-6 tracking-tight">My Orders</h1>
            
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-lg font-medium">Loading orders...</p>
                  </div>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <span className="material-icons text-6xl mb-4">shopping_bag</span>
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-sm">Your orders will appear here once you place them</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  let items: OrderItem[] = [];
                  
                  try {
                    if (typeof order.items === 'string') {
                      const parsed = JSON.parse(order.items);
                      items = Array.isArray(parsed) ? parsed : [];
                    } else if (Array.isArray(order.items)) {
                      items = order.items;
                    }
                  } catch (error) {
                    console.error('Failed to parse order items:', error);
                    items = [];
                  }
                  
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 border-b">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              Order #{order.id.slice(0, 8)}
                            </CardTitle>
                            <CardDescription>
                              {order.date && format(new Date(order.date), 'PPp')}
                            </CardDescription>
                          </div>
                          <Badge variant={order.status === 'ready' ? 'default' : 'secondary'} className="ml-2">
                            {order.status}
                          </Badge>
                        </div>

                        {/* Store Information */}
                        {order.storeName && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-start gap-2">
                              <span className="material-icons text-blue-600 text-lg mt-0.5">storefront</span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{order.storeName}</h4>
                                {order.storeAddress && (
                                  <p className="text-xs text-gray-600 mt-1">{order.storeAddress}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items</h4>
                            <div className="space-y-1">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.productName} x {item.quantity}
                                  </span>
                                  <span className="font-medium">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between mb-4">
                              <span className="text-lg font-semibold">Total</span>
                              <span className="text-lg font-semibold text-blue-600">₹{order.total}</span>
                            </div>

                            {/* Save Order Button */}
                            <Button
                              onClick={() => handleSaveOrder(order)}
                              variant="outline"
                              className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                            >
                              <span className="material-icons text-sm mr-2">favorite_border</span>
                              Save for Reorder
                            </Button>
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
