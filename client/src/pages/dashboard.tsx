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

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [trialBadgeHidden, setTrialBadgeHidden] = useState(false);
  const [fabTipShown, setFabTipShown] = useState(false);
  const [showFabTip, setShowFabTip] = useState(false);

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
            <button className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <span className="material-icons text-lg">refresh</span>
            </button>
          </div>
        </div>
      </header>

      <CredibilityRibbon />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto space-y-6 p-4">
        
        {/* Hero Action */}
        <section>
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-xl elevation-2 hover:elevation-3 transition-all duration-200 cursor-pointer relative" 
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
              {!trialBadgeHidden && (
                <button 
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-orange-500/90 text-white text-[10px] leading-none flex items-center gap-1"
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
              <div className="flex items-center space-x-4">
                <div className="text-4xl">📷</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Bill Fast</h2>
                  <p className="text-primary-foreground/90 text-sm">Offline in 15 s – No Internet, No Hassle</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="material-icons text-2xl opacity-75">arrow_forward</span>
                  <span className="text-xs opacity-60 mt-1">swipe →</span>
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
