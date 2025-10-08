import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { Link, useLocation } from "wouter";
import { SyncStatus } from "../components/sync-status";
import { OfflineIndicator } from "../components/offline-indicator";
import { CredibilityRibbon } from "../components/credibility-ribbon";
import { tw } from "../lib/theme";
import { SmartActionFAB } from "../components/smart-action-fab";
import { useAuth } from "../hooks/use-auth";
import { Alert, AlertDescription } from "../components/ui/alert";

// Customer Dashboard Component
function CustomerDashboard() {
  const [, setLocation] = useLocation();

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
        <div className="p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground mb-6">Find medicines from nearby pharmacies</p>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <button
              onClick={() => setLocation('/search')}
              className="w-full p-4 bg-primary text-primary-foreground rounded-lg flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <span className="material-icons">search</span>
              <span className="text-lg font-medium">Search for Medicines</span>
            </button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation('/orders')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="material-icons text-blue-600">shopping_bag</span>
                </div>
                <div>
                  <h3 className="font-semibold">My Orders</h3>
                  <p className="text-sm text-muted-foreground">Track your medicine orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation('/settings')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="material-icons text-green-600">person</span>
                </div>
                <div>
                  <h3 className="font-semibold">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">Update your information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  </div>
  );
}

// Business Dashboard Component (Retailer, Wholesaler, Distributor)
function BusinessDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [trialBadgeHidden, setTrialBadgeHidden] = useState(false);
  const [fabTipShown, setFabTipShown] = useState(false);
  const [showFabTip, setShowFabTip] = useState(false);
  const { needsSetup } = useAuth();
  const [setupAlertDismissed, setSetupAlertDismissed] = useState(false);

  // Check localStorage for persistent flags
  useEffect(() => {
    const hiddenFlag = localStorage.getItem('trialBadgeHidden');
    const tipFlag = localStorage.getItem('fabTipShown');
    setTrialBadgeHidden(hiddenFlag === 'true');
    setFabTipShown(tipFlag === 'true');
    
    // Show FAB tip if not shown before
    if (tipFlag !== 'true') {
      const showTimer = setTimeout(() => setShowFabTip(true), 1000);
      const hideTimer = setTimeout(() => {
        setShowFabTip(false);
        setFabTipShown(true);
        localStorage.setItem('fabTipShown', 'true');
      }, 4000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const hideTrialBadge = () => {
    setTrialBadgeHidden(true);
    localStorage.setItem('trialBadgeHidden', 'true');
  };

  const hideFabTip = () => {
    setShowFabTip(false);
    setFabTipShown(true);
    localStorage.setItem('fabTipShown', 'true');
  };

  const showCaptureActionSheet = () => {
    // Get user role to determine default capture mode
    const userRole = localStorage.getItem('userRole') || 'retailer';
    
    // For web, use a simple custom modal
    const options = [
      { label: 'Barcode (Quick Bill)', mode: 'barcode', icon: 'qr_code_scanner' },
      { label: 'Invoice (Receive Stock)', mode: 'invoice', icon: 'receipt' },
      { label: 'Prescription (Rx)', mode: 'prescription', icon: 'local_pharmacy' }
    ];
    
    // Create action sheet overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
    `;
    
    const sheet = document.createElement('div');
    sheet.style.cssText = `
      background: white;
      border-radius: 16px 16px 0 0;
      width: 100%;
      max-width: 400px;
      padding: 20px;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'What would you like to capture?';
    title.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;';
    sheet.appendChild(title);
    
    options.forEach(option => {
      const button = document.createElement('button');
      button.style.cssText = `
        width: 100%;
        padding: 16px;
        margin-bottom: 8px;
        border: none;
        border-radius: 12px;
        background: #f8f9fa;
        color: #333;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: background-color 0.2s;
      `;
      
      button.innerHTML = `
        <span class="material-icons" style="font-size: 24px; color: #007bff;">${option.icon}</span>
        ${option.label}
      `;
      
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#e9ecef';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#f8f9fa';
      });
      
      button.addEventListener('click', () => {
        setLocation(`/capture?mode=${option.mode}`);
        document.body.removeChild(overlay);
      });
      
      sheet.appendChild(button);
    });
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      width: 100%;
      padding: 16px;
      margin-top: 8px;
      border: none;
      border-radius: 12px;
      background: #dc3545;
      color: white;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    `;
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    sheet.appendChild(cancelButton);
    overlay.appendChild(sheet);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
    
    document.body.appendChild(overlay);
  };

  // Fetch data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['/api/stock'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: todaysSales } = useQuery({
    queryKey: ['/api/sales/today'],
  });

  const { data: pendingInvoices = [] } = useQuery({
    queryKey: ['/api/pending-invoices'],
  });

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotificationDropdown && !target.closest('.notification-dropdown-container')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationDropdown]);

  // Calculate stats
  const lowStockCount = Array.isArray(stock) ? stock.filter((s: any) => s.quantity < 10).length : 0;
  const recentSales = Array.isArray(sales) ? sales.slice(0, 3) : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-xl">medication</span>
            <h1 className={`${tw.headingLg} text-primary-foreground`} data-testid="app-title">AushadiExpress</h1>
          </div>
          
          <div className="flex items-center space-x-2" data-testid="headerOnline">
            <div className={tw.statusOnline}></div>
            <span className={`${tw.bodySm} text-primary-foreground/80`}>Online</span>
            
            {/* Notification Bell */}
            <div className="relative notification-dropdown-container">
              <button 
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors relative"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                <span className="material-icons text-lg">notifications</span>
                {Array.isArray(pendingInvoices) && pendingInvoices.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingInvoices.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      {Array.isArray(pendingInvoices) && pendingInvoices.length > 0 
                        ? 'Pending Invoices' 
                        : 'Notifications'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {Array.isArray(pendingInvoices) && pendingInvoices.length > 0
                        ? `${pendingInvoices.length} invoices not submitted`
                        : 'No pending items'}
                    </p>
                  </div>
                  
                  {Array.isArray(pendingInvoices) && pendingInvoices.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {pendingInvoices.map((invoice: any) => (
                        <div 
                          key={invoice.messageId} 
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            setLocation('/ai-assistant');
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {invoice.imageData && (
                              <img 
                                src={invoice.imageData} 
                                alt="Invoice" 
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {invoice.summaryText || 'Invoice'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                State: <span className={`font-medium ${
                                  invoice.submissionState === 'idle' ? 'text-gray-600' :
                                  invoice.submissionState === 'pending' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>{invoice.submissionState}</span>
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this pending invoice?')) {
                                  try {
                                    await fetch(`/api/pending-invoices/${invoice.messageId}`, {
                                      method: 'DELETE',
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['/api/pending-invoices'] });
                                    toast({
                                      title: "Deleted",
                                      description: "Pending invoice removed",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete invoice",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      You're all caught up
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <span className="material-icons text-lg">refresh</span>
            </button>
          </div>
        </div>
      </header>

      <CredibilityRibbon />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto space-y-6 p-4">
        
        {/* Setup Alert */}
        {needsSetup && !setupAlertDismissed && (
          <Alert className="bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="material-icons text-orange-600">info</span>
                <AlertDescription className="text-orange-900">
                  <strong>Complete your setup</strong> to get started. Go to <Link href="/settings" className="underline font-semibold">Settings</Link> to finish.
                </AlertDescription>
              </div>
              <button
                onClick={() => setSetupAlertDismissed(true)}
                className="text-orange-600 hover:text-orange-800 ml-2"
              >
                <span className="material-icons text-lg">close</span>
              </button>
            </div>
          </Alert>
        )}
        
        {/* Hero Action */}
        <section>
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl elevation-2 hover:elevation-3 transition-all duration-200 cursor-pointer relative overflow-hidden" 
            data-testid="button-bill-fast"
            onClick={() => setLocation('/pos')}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startX = touch.clientX;
              const startY = touch.clientY;
              const startTime = Date.now();
              
              const handleTouchMove = (moveEvent: TouchEvent) => {
                moveEvent.preventDefault();
              };
              
              const handleTouchEnd = (endEvent: TouchEvent) => {
                const endX = endEvent.changedTouches[0].clientX;
                const endY = endEvent.changedTouches[0].clientY;
                const endTime = Date.now();
                
                const deltaX = endX - startX;
                const deltaY = Math.abs(endY - startY);
                const deltaTime = endTime - startTime;
                
                // Swipe right detection
                if (deltaX > 100 && deltaY < 50 && deltaTime < 300) {
                  setLocation('/pos');
                }
                
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
              };
              
              document.addEventListener('touchmove', handleTouchMove, { passive: false });
              document.addEventListener('touchend', handleTouchEnd);
            }}
          >
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-black/20" />
              
              {!trialBadgeHidden && (
                <button 
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] leading-none flex items-center gap-1 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    hideTrialBadge();
                  }}
                  data-testid="trial-badge"
                >
                  <span>Free 14-day trial</span>
                  <span className="text-[8px]">✕</span>
                </button>
              )}
              <div className="flex items-center space-x-4 relative z-10">
                <div className="text-4xl">⚡</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Bill Fast</h2>
                  <p className="text-white/95 text-sm">Offline in 15 s – No Internet, No Hassle</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="material-icons text-2xl opacity-90">arrow_forward</span>
                  <span className="text-xs opacity-75 mt-1">swipe →</span>
                </div>
              </div>
            </div>
        </section>
        
        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="elevation-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`${tw.body} text-muted-foreground`}>Today's Sales</p>
                  <p className={`${tw.headingLg} font-bold text-foreground`} data-testid="todays-sales">
                    ₹{(todaysSales as any)?.total?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <span className="material-icons text-primary">trending_up</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="elevation-1">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`${tw.body} text-muted-foreground`}>Low Stock Items</p>
                    <p className="text-4xl font-bold text-destructive" data-testid="low-stock-count">
                      {lowStockCount}
                    </p>
                  </div>
                  <span className="material-icons text-destructive text-3xl">warning</span>
                </div>
                <Link href="/products?filter=lowStock">
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-destructive text-destructive-foreground py-2 text-sm font-semibold shadow-sm active:scale-[.98]"
                    data-testid="button-reorder-now"
                  >
                    <span className="material-icons text-base">shopping_cart_checkout</span>
                    <span>{lowStockCount > 0 ? 'Reorder Now' : 'Browse Products'}</span>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Recent Transactions */}
        <Card className="elevation-1">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className={`${tw.headingMd}`}>Recent Transactions</h2>
              <Link href="/sales">
                <div className="text-primary text-sm font-medium cursor-pointer hover:underline" data-testid="link-view-all">
                  View All
                </div>
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {recentSales.length > 0 ? (
              recentSales.map((sale: any) => (
                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors" data-testid={`transaction-${sale.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary text-lg">receipt</span>
                    </div>
                    <div>
                      <p className="font-medium">{sale.id.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{sale.total.toFixed(2)}</p>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${sale.synced ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-muted-foreground">
                        {sale.synced ? 'Synced' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No recent transactions
              </div>
            )}
          </div>
        </Card>
        
        
        {/* Bottom spacing for FAB */}
        <div className="h-20"></div>
      </main>

      {/* Smart Action FAB */}
      <SmartActionFAB 
        onAssistantOpen={() => toast({ title: "AI Assistant", description: "Opening full-screen AI assistant..." })}
      />
    </div>
  );
}

// Main Dashboard Component - Renders based on user role
export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>('retailer');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  // Render appropriate dashboard based on user role
  if (userRole === 'customer') {
    return <CustomerDashboard />;
  }

  return <BusinessDashboard />;
}
