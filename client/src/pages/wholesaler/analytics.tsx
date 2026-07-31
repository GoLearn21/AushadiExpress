import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, Users, FileText, Truck, DollarSign, BarChart3 } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalRetailers: number;
  retailersChange: number;
  averageOrderValue: number;
  aovChange: number;
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  topRetailers: {
    name: string;
    orders: number;
    revenue: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

export default function WholesalerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/wholesaler/analytics?period=${period}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const renderChange = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-xs text-green-600">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          +{change}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center text-xs text-red-600">
          <TrendingDown className="h-3 w-3 mr-0.5" />
          {change}%
        </span>
      );
    }
    return <span className="text-xs text-gray-500">No change</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Default data if analytics is null
  const data = analytics || {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalRetailers: 0,
    retailersChange: 0,
    averageOrderValue: 0,
    aovChange: 0,
    topProducts: [],
    topRetailers: [],
    monthlyRevenue: [],
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your business performance
            </p>
          </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(data.totalRevenue)}</p>
                {renderChange(data.revenueChange)}
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
                <p className="text-xl font-bold mt-1">{data.totalOrders}</p>
                {renderChange(data.ordersChange)}
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Retailers</p>
                <p className="text-xl font-bold mt-1">{data.totalRetailers}</p>
                {renderChange(data.retailersChange)}
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Order</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(data.averageOrderValue)}</p>
                {renderChange(data.aovChange)}
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Products</CardTitle>
          <CardDescription>Best selling products this {period}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Retailers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Retailers</CardTitle>
          <CardDescription>Your best customers this {period}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topRetailers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.topRetailers.map((retailer, index) => (
                <div key={retailer.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{retailer.name}</p>
                      <p className="text-xs text-gray-500">{retailer.orders} orders</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(retailer.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
