import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  PlusCircle,
  Settings,
  BarChart3,
  FileText,
  Truck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Stock {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

interface Sale {
  id: string;
  total: number;
  date: string;
  items: string;
}

interface Document {
  id: string;
  confirmedType: string;
  createdAt: string;
  totals?: {
    net?: string;
  };
  lineItems?: Array<{ name: string; }>;
  businessIntelligence?: any;
}

interface InventoryItem {
  product: Product;
  stock: Stock[];
  totalQuantity: number;
  nearExpiry: number;
  lowStock: boolean;
}

export default function OpsScreen() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('inventory');
  const [userRole, setUserRole] = useState('retailer');
  const { toast } = useToast();

  useEffect(() => {
    // Load user role from localStorage
    const roleSettings = localStorage.getItem('userRole');
    setUserRole(roleSettings || 'retailer');
  }, []);

  // Fetch data
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: stock = [] } = useQuery<Stock[]>({
    queryKey: ['/api/stock'],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales'],
  });

  const { data: todaysSales } = useQuery({
    queryKey: ['/api/sales/today'],
  });
  
  // Fetch scanned documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  
  console.log('[OPS-DEBUG] Documents loaded:', documents.length);
  if (documents.length > 0) {
    console.log('[OPS-DEBUG] Sample document:', {
      id: documents[0]?.id,
      confirmedType: documents[0]?.confirmedType,
      lineItemsCount: documents[0]?.lineItems?.length || 0,
      hasBusinessIntelligence: !!documents[0]?.businessIntelligence
    });
  }

  // Process inventory data
  const inventoryItems: InventoryItem[] = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    
    // Check for near expiry (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const nearExpiry = productStock.filter(s => 
      new Date(s.expiryDate) <= thirtyDaysFromNow
    ).reduce((sum, s) => sum + s.quantity, 0);

    const lowStock = totalQuantity < 20; // Low stock threshold

    return {
      product,
      stock: productStock,
      totalQuantity,
      nearExpiry,
      lowStock
    };
  });

  // Filter inventory based on search
  const filteredInventory = inventoryItems.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get alerts
  const lowStockItems = inventoryItems.filter(item => item.lowStock);
  const nearExpiryItems = inventoryItems.filter(item => item.nearExpiry > 0);

  // Calculate metrics
  const totalProducts = products.length;
  
  // Calculate stock value based on actual invoice data (purchase cost)
  const totalStockValue = documents
    .filter((doc: any) => doc.confirmedType === 'invoice')
    .reduce((totalValue: number, invoice: any) => {
      if (!invoice.lineItems) return totalValue;
      
      return totalValue + invoice.lineItems.reduce((invoiceValue: number, item: any) => {
        const qty = parseFloat(item.qty || '0');
        const rate = parseFloat(item.rate || item.mrp || '0');
        return invoiceValue + (qty * rate);
      }, 0);
    }, 0);
  const todaysSalesAmount = (todaysSales as any)?.total || 0;
  
  // Document insights
  const totalDocuments = documents.length;
  const documentsToday = documents.filter((doc: any) => {
    const docDate = new Date(doc.createdAt);
    const today = new Date();
    return docDate.toDateString() === today.toDateString();
  }).length;
  
  const documentsByType = documents.reduce((acc: any, doc: any) => {
    const type = doc.confirmedType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate total value from invoices
  const invoiceValue = documents
    .filter((doc: any) => doc.confirmedType === 'invoice')
    .reduce((sum: number, doc: any) => {
      const total = parseFloat(doc.totals?.net || '0');
      return sum + total;
    }, 0);

  // ROLE-BASED ANALYTICS CALCULATIONS
  const getRoleBasedInsights = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate goods in/out based on role
    const goodsIn = inventoryItems.reduce((sum, item) => sum + item.totalQuantity, 0);
    const goodsOut = sales.length; // Simplified - should be actual quantities sold
    
    // Top/Bottom movers (by stock quantity - proxy for movement)
    const sortedByMovement = [...inventoryItems].sort((a, b) => b.totalQuantity - a.totalQuantity);
    const topMovers = sortedByMovement.slice(0, 10);
    const bottomMovers = sortedByMovement.slice(-10).reverse();
    
    // Category analysis (basic grouping by medicine type)
    const categoryStats: Record<string, { count: number; value: number }> = {};
    inventoryItems.forEach(item => {
      const category = item.product.name.includes('Tab') ? 'Tablets' : 
                      item.product.name.includes('Syrup') ? 'Syrups' : 
                      item.product.name.includes('Capsule') ? 'Capsules' : 'Others';
      
      if (!categoryStats[category]) categoryStats[category] = { count: 0, value: 0 };
      categoryStats[category].count += item.totalQuantity;
      categoryStats[category].value += item.totalQuantity * item.product.price;
    });
    
    return {
      goodsIn,
      goodsOut,
      topMovers,
      bottomMovers,
      categoryStats,
      turnoverRatio: goodsOut > 0 ? (goodsIn / goodsOut).toFixed(2) : 'N/A'
    };
  };

  const insights = getRoleBasedInsights();

  const handleRefresh = () => {
    window.location.reload();
    toast({
      title: 'Data Refreshed',
      description: 'All data has been updated successfully',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your data export is being prepared',
    });
  };

  // Quick action widgets
  const quickActions = [
    {
      id: 'sales-ledger',
      title: 'Sales Ledger',
      icon: <FileText className="w-6 h-6" />,
      description: 'View all sales transactions',
      action: () => setLocation('/sales-ledger')
    },
    {
      id: 'receive-stock',
      title: 'Receive Stock',
      icon: <Truck className="w-6 h-6" />,
      description: 'Process incoming inventory',
      action: () => setLocation('/receive-stock')
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Generate business reports',
      action: () => setLocation('/reports')
    },
    {
      id: 'pos',
      title: 'Point of Sale',
      icon: <Package className="w-6 h-6" />,
      description: 'Process customer transactions',
      action: () => setLocation('/pos')
    }
  ];

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="ops-title">
            Operations Dashboard
          </h1>
          <p className="text-muted-foreground">Comprehensive pharmacy management center</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value (Purchase Cost)</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Based on invoice purchase rates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goods In ({userRole === 'wholesaler' ? 'Purchased' : 'Received'})</CardTitle>
            <Truck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{insights.goodsIn}</div>
            <p className="text-xs text-muted-foreground">
              Items added to inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goods Out ({userRole === 'wholesaler' ? 'Distributed' : 'Sold'})</CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{insights.goodsOut}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'wholesaler' ? 'Orders fulfilled' : 'Items sold'}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="todays-total">
              ₹{todaysSalesAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockItems.length + nearExpiryItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Scanned</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Total processed ({documentsToday} today)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{invoiceValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From scanned invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROLE-BASED BUSINESS INSIGHTS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Business Intelligence - {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View</h2>
          <Badge variant="outline">{userRole.toUpperCase()}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top 10 Product Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Top 10 Product Movers</span>
              </CardTitle>
              <CardDescription>Products with highest stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.topMovers.slice(0, 10).map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{index + 1}. {item.product.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold">{item.totalQuantity}</span>
                      <span className="text-muted-foreground">units</span>
                    </div>
                  </div>
                ))}
                {insights.topMovers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No movement data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bottom 10 Product Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Bottom 10 Product Movers</span>
              </CardTitle>
              <CardDescription>Products with lowest stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.bottomMovers.slice(0, 10).map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{index + 1}. {item.product.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${item.totalQuantity < 10 ? 'text-red-600' : 'text-orange-600'}`}>{item.totalQuantity}</span>
                      <span className="text-muted-foreground">units</span>
                    </div>
                  </div>
                ))}
                {insights.bottomMovers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No movement data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Category Analytics</span>
              </CardTitle>
              <CardDescription>Stock distribution by product type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(insights.categoryStats).map(([category, stats]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{category}</span>
                      <span className="text-sm text-muted-foreground">{stats.count} units</span>
                    </div>
                    <div className="bg-muted rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((stats.value / totalStockValue) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">₹{stats.value.toFixed(0)} value</div>
                  </div>
                ))}
                {Object.keys(insights.categoryStats).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ROLE-SPECIFIC PERFORMANCE METRICS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>{userRole === 'wholesaler' ? 'Distribution' : userRole === 'distributor' ? 'Supply Chain' : 'Retail'} Performance</span>
          </CardTitle>
          <CardDescription>
            Key metrics for {userRole} operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights.turnoverRatio}</div>
              <div className="text-xs text-muted-foreground">Turnover Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lowStockItems.length}</div>
              <div className="text-xs text-muted-foreground">Low Stock Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{nearExpiryItems.length}</div>
              <div className="text-xs text-muted-foreground">Near Expiry</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Object.keys(insights.categoryStats).length}</div>
              <div className="text-xs text-muted-foreground">Active Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access key pharmacy operations and management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={action.action}
                data-testid={`widget-${action.id}`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Inventory Management */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Manage your pharmacy stock levels and product information
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setLocation('/inventory')}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Inventory List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredInventory.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{item.product.name}</h3>
                        {item.lowStock && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                        {item.nearExpiry > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Near Expiry
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.product.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm">
                          Qty: <strong>{item.totalQuantity}</strong>
                        </span>
                        <span className="text-sm">
                          Price: <strong>₹{item.product.price}</strong>
                        </span>
                        <span className="text-sm">
                          Batches: <strong>{item.stock.length}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Low Stock Alerts ({lowStockItems.length})
                </CardTitle>
                <CardDescription>
                  Products with quantity below threshold (20 units)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No low stock alerts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Current stock: {item.totalQuantity} units
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setLocation('/receive-stock')}
                        >
                          Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Near Expiry Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
                  Near Expiry Alerts ({nearExpiryItems.length})
                </CardTitle>
                <CardDescription>
                  Products expiring within 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nearExpiryItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No near expiry alerts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {nearExpiryItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.nearExpiry} units expiring soon
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Discount
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
              <CardDescription>
                Key performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Sales Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Today's Sales</span>
                      <span className="font-medium">₹{todaysSalesAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Week (Est.)</span>
                      <span className="font-medium">₹{(todaysSalesAmount * 7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Month (Est.)</span>
                      <span className="font-medium">₹{(todaysSalesAmount * 30).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Inventory Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Products</span>
                      <span className="font-medium">{totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Low Stock Items</span>
                      <span className="font-medium text-red-600">{lowStockItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Near Expiry</span>
                      <span className="font-medium text-yellow-600">{nearExpiryItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Stock Value</span>
                      <span className="font-medium">₹{totalStockValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
