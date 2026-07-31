import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Truck, Clock, CheckCircle, Package, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

interface B2BOrder {
  id: string;
  orderNumber: string;
  wholesalerTenantId: string;
  wholesalerName: string;
  wholesalerPhone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  totalAmount: number;
  createdAt: string;
  expectedDeliveryDate: string;
  trackingNumber: string;
}

export default function MyB2BOrdersPage() {
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/retailer/my-orders', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: B2BOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const activeCount = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/ops">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">My B2B Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Orders from wholesalers
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'confirmed').length}</p>
            <p className="text-xs text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === 'shipped').length}</p>
            <p className="text-xs text-gray-600">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-xs text-gray-600">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active
            {activeCount > 0 && (
              <span className="ml-1.5 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                {activeCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'active'
                    ? 'No active orders'
                    : activeTab === 'delivered'
                    ? 'No delivered orders yet'
                    : 'No cancelled orders'}
                </p>
                <Link href="/retailer/wholesalers">
                  <Button>Browse Wholesalers</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Link key={order.id} href={`/retailer/order/${order.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.orderNumber}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{order.wholesalerName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.totalAmount.toLocaleString()}</p>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs mt-1">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        {order.status === 'shipped' && order.trackingNumber && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Package className="h-3 w-3" />
                            <span>Tracking: {order.trackingNumber}</span>
                          </div>
                        )}

                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
