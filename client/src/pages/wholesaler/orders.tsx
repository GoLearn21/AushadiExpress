import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Package, Clock, CheckCircle, MapPin, Phone, ChevronRight } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface WholesalerOrder {
  id: string;
  orderNumber: string;
  retailerName: string;
  retailerPhone: string;
  retailerAddress: string;
  itemCount: number;
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  expectedDelivery?: string;
}

export default function WholesalerOrdersPage() {
  const [orders, setOrders] = useState<WholesalerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/wholesaler/orders', {
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

  const getStatusBadge = (status: WholesalerOrder['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Processing</Badge>;
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

  const getStatusIcon = (status: WholesalerOrder['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-yellow-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return ['confirmed', 'processing', 'shipped'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const activeCount = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and track your orders to retailers
          </p>
        </div>

      {/* Summary Cards */}
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
            <p className="text-xs text-gray-600">Shipped</p>
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
                <p className="text-sm text-gray-500">
                  {activeTab === 'active'
                    ? 'No active orders at the moment'
                    : activeTab === 'delivered'
                    ? 'No delivered orders yet'
                    : 'No cancelled orders'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {order.retailerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{order.itemCount} items</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{order.retailerAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{order.retailerPhone}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>

                      {order.status === 'confirmed' && (
                        <Button size="sm">
                          <Truck className="h-4 w-4 mr-1" />
                          Mark Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
