import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AppHeader } from '@/components/app-header';
import {
  Truck, MapPin, Clock, User, Phone, Plus, Edit2, Trash2,
  Package, Calendar, Route, CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  pincodes?: string;
  deliveryDays?: string;
  deliveryTime?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  isActive: boolean;
}

interface PendingOrder {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    deliveryAddress?: string;
  };
  retailer: {
    id: string;
    username: string;
    pharmacyName?: string;
    pincode?: string;
  };
}

export default function DeliveryRoutesPage() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<Record<string, PendingOrder[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    pincodes: '',
    deliveryDays: '',
    deliveryTime: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
  });
  const [scheduleForm, setScheduleForm] = useState({
    routeId: '',
    scheduledDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchRoutes();
    fetchPendingOrders();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/wholesaler/delivery-routes', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/wholesaler/delivery-routes/pending-orders', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPendingOrders(data.orders || []);
        setGroupedOrders(data.groupedByPincode || {});
      }
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  };

  const handleSaveRoute = async () => {
    try {
      const url = editingRoute
        ? `/api/wholesaler/delivery-routes/${editingRoute.id}`
        : '/api/wholesaler/delivery-routes';
      const method = editingRoute ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(routeForm),
      });

      if (res.ok) {
        fetchRoutes();
        setIsRouteDialogOpen(false);
        resetRouteForm();
      }
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Delete this delivery route?')) return;

    try {
      const res = await fetch(`/api/wholesaler/delivery-routes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchRoutes();
      }
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  const handleCreateSchedule = async () => {
    if (selectedOrders.length === 0 || !scheduleForm.scheduledDate) {
      alert('Please select orders and a delivery date');
      return;
    }

    try {
      const res = await fetch('/api/wholesaler/delivery-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          routeId: scheduleForm.routeId || undefined,
          scheduledDate: scheduleForm.scheduledDate,
          orderIds: selectedOrders,
          notes: scheduleForm.notes,
        }),
      });

      if (res.ok) {
        alert('Delivery schedule created! Orders marked as shipped.');
        fetchPendingOrders();
        setSelectedOrders([]);
        setIsScheduleDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const resetRouteForm = () => {
    setRouteForm({
      name: '',
      description: '',
      pincodes: '',
      deliveryDays: '',
      deliveryTime: '',
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
    });
    setEditingRoute(null);
  };

  const openEditRoute = (route: DeliveryRoute) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      description: route.description || '',
      pincodes: route.pincodes || '',
      deliveryDays: route.deliveryDays || '',
      deliveryTime: route.deliveryTime || '',
      driverName: route.driverName || '',
      driverPhone: route.driverPhone || '',
      vehicleNumber: route.vehicleNumber || '',
    });
    setIsRouteDialogOpen(true);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectPincodeOrders = (pincode: string) => {
    const orders = groupedOrders[pincode] || [];
    const orderIds = orders.map(o => o.order.id);
    const allSelected = orderIds.every(id => selectedOrders.includes(id));

    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !orderIds.includes(id)));
    } else {
      setSelectedOrders(prev => [...new Set([...prev, ...orderIds])]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-6 flex-1 overflow-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Routes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage delivery routes and schedule deliveries
          </p>
        </div>

        <Tabs defaultValue="routes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routes">
              <Route className="h-4 w-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Delivery
            </TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { resetRouteForm(); setIsRouteDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>

            {routes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Delivery Routes</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create routes to organize deliveries by area
                  </p>
                  <Button onClick={() => setIsRouteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Route
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => (
                  <Card key={route.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{route.name}</h3>
                            <Badge variant={route.isActive ? 'default' : 'secondary'}>
                              {route.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {route.description && (
                            <p className="text-sm text-gray-500 mt-1">{route.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            {route.pincodes && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {route.pincodes}
                              </span>
                            )}
                            {route.deliveryDays && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {route.deliveryDays}
                              </span>
                            )}
                            {route.deliveryTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {route.deliveryTime}
                              </span>
                            )}
                          </div>
                          {route.driverName && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <User className="h-3 w-3" />
                              {route.driverName}
                              {route.driverPhone && (
                                <span className="text-gray-500">({route.driverPhone})</span>
                              )}
                              {route.vehicleNumber && (
                                <Badge variant="outline" className="ml-2">{route.vehicleNumber}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditRoute(route)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRoute(route.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schedule Delivery Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Orders</h3>
                  <p className="text-sm text-gray-500">
                    All orders have been scheduled for delivery
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedOrders.length} orders selected
                  </p>
                  {selectedOrders.length > 0 && (
                    <Button onClick={() => setIsScheduleDialogOpen(true)}>
                      <Truck className="h-4 w-4 mr-2" />
                      Schedule Delivery
                    </Button>
                  )}
                </div>

                {/* Orders grouped by pincode */}
                {Object.entries(groupedOrders).map(([pincode, orders]) => (
                  <Card key={pincode}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <CardTitle className="text-base">Pincode: {pincode}</CardTitle>
                          <Badge variant="secondary">{orders.length} orders</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectPincodeOrders(pincode)}
                        >
                          {orders.every(o => selectedOrders.includes(o.order.id))
                            ? 'Deselect All'
                            : 'Select All'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {orders.map(({ order, retailer }) => (
                          <div
                            key={order.id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${
                              selectedOrders.includes(order.id)
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {retailer?.pharmacyName || retailer?.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                Order #{order.orderNumber} • ₹{order.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Route Dialog */}
        <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Create Route'}</DialogTitle>
              <DialogDescription>
                Define a delivery route with pincodes and schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., North Zone"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincodes">Pincodes (comma-separated)</Label>
                <Input
                  id="pincodes"
                  placeholder="e.g., 560001, 560002, 560003"
                  value={routeForm.pincodes}
                  onChange={(e) => setRouteForm({ ...routeForm, pincodes: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">Delivery Days</Label>
                  <Input
                    id="deliveryDays"
                    placeholder="e.g., Mon, Wed, Fri"
                    value={routeForm.deliveryDays}
                    onChange={(e) => setRouteForm({ ...routeForm, deliveryDays: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    placeholder="e.g., 9 AM - 1 PM"
                    value={routeForm.deliveryTime}
                    onChange={(e) => setRouteForm({ ...routeForm, deliveryTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  placeholder="Driver's name"
                  value={routeForm.driverName}
                  onChange={(e) => setRouteForm({ ...routeForm, driverName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input
                    id="driverPhone"
                    placeholder="Phone number"
                    value={routeForm.driverPhone}
                    onChange={(e) => setRouteForm({ ...routeForm, driverPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g., KA01AB1234"
                    value={routeForm.vehicleNumber}
                    onChange={(e) => setRouteForm({ ...routeForm, vehicleNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRouteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRoute}>{editingRoute ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Delivery</DialogTitle>
              <DialogDescription>
                Schedule delivery for {selectedOrders.length} selected orders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="route">Assign to Route (Optional)</Label>
                <select
                  id="route"
                  className="w-full p-2 border rounded-md"
                  value={scheduleForm.routeId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, routeId: e.target.value })}
                >
                  <option value="">No specific route</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>{route.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Delivery Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateSchedule}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
