import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Package, FileText, Truck, TrendingUp, Users, Clock, AlertTriangle, Calendar, Upload, Percent, CreditCard, Route } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface LowStockItem {
  id: string;
  name: string;
  manufacturer: string | null;
  stockQuantity: number;
  reorderLevel: number | null;
}

interface ExpiringItem {
  id: string;
  name: string;
  manufacturer: string | null;
  batchNumber: string | null;
  expiryDate: string;
  stockQuantity: number;
}

interface DashboardStats {
  totalProducts: number;
  pendingQuotes: number;
  activeOrders: number;
  totalRevenue: number;
  totalRetailers: number;
  quotesThisWeek: number;
  lowStockItems: LowStockItem[];
  expiringItems: ExpiringItem[];
  lowStockCount: number;
  expiringCount: number;
}

export default function WholesalerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalRetailers: 0,
    quotesThisWeek: 0,
    lowStockItems: [],
    expiringItems: [],
    lowStockCount: 0,
    expiringCount: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Load user info
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/wholesaler/stats', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401 || res.status === 403) {
        // Session expired or not authorized
        setAuthError(true);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/wholesaler/products',
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/wholesaler/quotes',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/wholesaler/orders',
    },
    {
      title: 'This Month Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/wholesaler/analytics',
    },
  ];

  // Show login prompt if not authenticated
  if (authError) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader />
        <div className="p-4 flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-4">
                Please log in again to access wholesaler features.
              </p>
              <Button onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                window.location.href = '/';
              }}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-6 flex-1 overflow-auto">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your wholesale business
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks for your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/wholesaler/products/new">
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
          <Link href="/wholesaler/quotes">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View Quote Requests
            </Button>
          </Link>
          <Link href="/wholesaler/orders">
            <Button variant="outline" className="w-full justify-start">
              <Truck className="h-4 w-4 mr-2" />
              Manage Orders
            </Button>
          </Link>
          <Link href="/wholesaler/bulk-import">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import Products
            </Button>
          </Link>
          <Link href="/wholesaler/price-tiers">
            <Button variant="outline" className="w-full justify-start">
              <Percent className="h-4 w-4 mr-2" />
              Price Tiers
            </Button>
          </Link>
          <Link href="/wholesaler/credit-management">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Credit Management
            </Button>
          </Link>
          <Link href="/wholesaler/delivery-routes">
            <Button variant="outline" className="w-full justify-start">
              <Route className="h-4 w-4 mr-2" />
              Delivery Routes
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {(stats.lowStockCount > 0 || stats.expiringCount > 0) && (
        <div className="space-y-3">
          {/* Low Stock Alert */}
          {stats.lowStockCount > 0 && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-base text-red-700 dark:text-red-400">Low Stock Alert</CardTitle>
                  </div>
                  <Badge variant="destructive">{stats.lowStockCount} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {stats.lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-red-100 dark:border-red-800 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.manufacturer || 'Unknown manufacturer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{item.stockQuantity} left</p>
                        <p className="text-xs text-gray-500">Reorder at {item.reorderLevel || 10}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {stats.lowStockCount > 5 && (
                  <Link href="/wholesaler/products">
                    <Button variant="link" className="p-0 h-auto text-red-600 mt-2">
                      View all {stats.lowStockCount} low stock items →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Expiring Items Alert */}
          {stats.expiringCount > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-base text-yellow-700 dark:text-yellow-400">Expiring Soon</CardTitle>
                  </div>
                  <Badge className="bg-yellow-500">{stats.expiringCount} items</Badge>
                </div>
                <CardDescription className="text-yellow-600">Items expiring within 90 days</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {stats.expiringItems.slice(0, 5).map((item) => {
                    const expiryDate = new Date(item.expiryDate);
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpired = daysUntilExpiry < 0;
                    const isCritical = daysUntilExpiry <= 30;

                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-yellow-100 dark:border-yellow-800 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.manufacturer || 'Unknown'} {item.batchNumber && `• Batch: ${item.batchNumber}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isExpired ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-yellow-600'}`}>
                            {isExpired ? 'EXPIRED' : `${daysUntilExpiry} days`}
                          </p>
                          <p className="text-xs text-gray-500">{expiryDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {stats.expiringCount > 5 && (
                  <Link href="/wholesaler/products">
                    <Button variant="link" className="p-0 h-auto text-yellow-600 mt-2">
                      View all {stats.expiringCount} expiring items →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest updates from your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingQuotes > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Pending Quote Requests</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You have {stats.pendingQuotes} quote request{stats.pendingQuotes > 1 ? 's' : ''} waiting for your response
                  </p>
                </div>
              </div>
            )}
            {stats.activeOrders > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Active Orders</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.activeOrders} order{stats.activeOrders > 1 ? 's' : ''} in progress
                  </p>
                </div>
              </div>
            )}
            {stats.pendingQuotes === 0 && stats.activeOrders === 0 && stats.lowStockCount === 0 && stats.expiringCount === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity. Start by adding products to your catalog.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      {user?.gstNumber && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">GST Number</span>
              <span className="text-sm font-medium">{user.gstNumber}</span>
            </div>
            {user.businessAddress && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Address</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{user.businessAddress}</span>
              </div>
            )}
            {user.contactPhone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contact</span>
                <span className="text-sm font-medium">{user.contactPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
