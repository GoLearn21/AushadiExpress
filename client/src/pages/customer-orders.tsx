import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: string;
  storeName?: string;
}

export default function CustomerOrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-xl">medication</span>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>AushadiExpress</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={tw.statusOnline}></div>
            <span className={`${tw.bodySm} text-primary-foreground/80`}>Online</span>
          </div>
        </div>
      </header>

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
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription>
                            {order.date && format(new Date(order.date), 'PPp')}
                          </CardDescription>
                        </div>
                        <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.productName} x {item.quantity}
                              </span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-lg font-semibold">₹{order.total}</span>
                          </div>
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
