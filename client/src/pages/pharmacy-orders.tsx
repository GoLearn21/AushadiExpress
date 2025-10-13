import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Package, CheckCircle2, XCircle, User, Phone, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'rejected' | 'cancelled' | 'expired';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: any[];
  estimatedReadyTime?: number;
  rejectionReason?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'New Order', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-purple-500', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-500', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-gray-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-400', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-orange-500', icon: Clock },
};

export default function PharmacyOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/pharmacy/orders', statusFilter],
    queryFn: async () => {
      console.log('[PHARMACY-ORDERS-UI] Fetching orders with filter:', statusFilter);
      const url = statusFilter === 'all'
        ? '/api/pharmacy/orders'
        : `/api/pharmacy/orders?status=${statusFilter}`;
      console.log('[PHARMACY-ORDERS-UI] Fetching from URL:', url);
      const res = await fetch(url, { credentials: 'include' });
      console.log('[PHARMACY-ORDERS-UI] Response status:', res.status);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      console.log('[PHARMACY-ORDERS-UI] Received data:', data);
      return data;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const orders = ordersData?.orders || [];
  const counts = ordersData?.counts || {};

  // Accept order mutation
  const acceptMutation = useMutation({
    mutationFn: async ({ orderId, estimatedTime }: { orderId: string; estimatedTime: number }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimatedTime }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to accept order');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order accepted', description: 'Customer has been notified' });
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to accept order', description: error.message, variant: 'destructive' });
    },
  });

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject order');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order rejected', description: 'Customer has been notified' });
      setShowRejectDialog(false);
      setSelectedOrder(null);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to reject order', description: error.message, variant: 'destructive' });
    },
  });

  // Update status mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, payload }: { orderId: string; status: string; payload?: any }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/${status}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload || {}),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update order');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order updated successfully' });
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update order', description: error.message, variant: 'destructive' });
    },
  });

  const handleAccept = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleReject = (order: Order) => {
    setSelectedOrder(order);
    setShowRejectDialog(true);
  };

  const confirmAccept = () => {
    if (selectedOrder) {
      acceptMutation.mutate({
        orderId: selectedOrder.id,
        estimatedTime: parseInt(estimatedTime),
      });
    }
  };

  const confirmReject = () => {
    if (selectedOrder && rejectionReason.trim()) {
      rejectMutation.mutate({
        orderId: selectedOrder.id,
        reason: rejectionReason,
      });
    }
  };

  const handleMarkPreparing = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'preparing' });
  };

  const handleMarkReady = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'ready' });
  };

  const handleComplete = (order: Order) => {
    setSelectedOrder(order);
  };

  const confirmComplete = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        orderId: selectedOrder.id,
        status: 'complete',
        payload: { paymentMethod },
      });
    }
  };

  const getOrderItems = (items: any) => {
    try {
      return typeof items === 'string' ? JSON.parse(items) : items || [];
    } catch {
      return [];
    }
  };

  if (user?.role !== 'retailer') {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">This page is only accessible to pharmacy retailers.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Incoming Orders</h1>
          <p className="text-sm text-gray-600">Manage customer orders</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="max-w-7xl mx-auto px-4 py-4 w-full flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({orders.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
            className="whitespace-nowrap"
          >
            New ({counts.pending || 0})
          </Button>
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed ({counts.confirmed || 0})
          </Button>
          <Button
            variant={statusFilter === 'preparing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('preparing')}
          >
            Preparing ({counts.preparing || 0})
          </Button>
          <Button
            variant={statusFilter === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ready')}
          >
            Ready ({counts.ready || 0})
          </Button>
        </div>
      </div>

      {/* Orders List - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
              <p className="text-gray-500 mt-1">New orders will appear here</p>
            </Card>
          ) : (
            orders.map((order: Order) => {
              const items = getOrderItems(order.items);
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <Badge className={`${config.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(order.date), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{order.total}</p>
                      <p className="text-xs text-gray-500">{items.length} items</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{order.customerName || 'Customer'}</span>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-3 space-y-1">
                    {items.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-gray-500">+{items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAccept(order)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={acceptMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleReject(order)}
                          variant="destructive"
                          className="flex-1"
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        onClick={() => handleMarkPreparing(order.id)}
                        className="flex-1"
                        disabled={updateStatusMutation.isPending}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => handleMarkReady(order.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        onClick={() => handleComplete(order)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        Complete Order
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Accept Order Dialog */}
      <Dialog open={!!selectedOrder && !showRejectDialog} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Set the estimated preparation time for this order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Estimated Time (minutes)</label>
            <Input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              min="5"
              max="120"
              placeholder="30"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={acceptMutation.isPending}>
              {acceptMutation.isPending ? 'Accepting...' : 'Accept Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Out of stock, Pharmacy closed, etc."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Order Dialog */}
      <Dialog open={!!selectedOrder && selectedOrder.status === 'ready'} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
            <DialogDescription>
              Select the payment method used by the customer
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button onClick={confirmComplete} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? 'Completing...' : 'Complete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
