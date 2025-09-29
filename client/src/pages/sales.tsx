import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/segmented-control";

export default function Sales() {
  const [activeTab, setActiveTab] = useState('sales');
  
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: todaysSales } = useQuery({
    queryKey: ['/api/sales/today'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-icons animate-spin text-4xl text-primary">sync</span>
          <p className="mt-2 text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" data-testid="sales-title">Sales & Receiving</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Total</p>
          <p className="text-xl font-bold text-primary" data-testid="todays-total">
            ₹{todaysSales?.total?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Segmented Control */}
      <SegmentedControl
        segments={[
          { value: 'sales', label: 'Sales', icon: 'receipt' },
          { value: 'receiving', label: 'Receiving', icon: 'inbox' }
        ]}
        value={activeTab}
        onChange={setActiveTab}
        className="w-full max-w-sm"
      />

      <div className="space-y-4">
        {sales.length > 0 ? (
          sales.map((sale: any) => (
            <Card key={sale.id} className="elevation-1" data-testid={`sale-${sale.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">receipt</span>
                    </div>
                    <div>
                      <p className="font-semibold" data-testid={`sale-id-${sale.id}`}>
                        {sale.id.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`sale-date-${sale.id}`}>
                        {new Date(sale.date).toLocaleDateString()} at {new Date(sale.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold" data-testid={`sale-total-${sale.id}`}>
                      ₹{sale.total.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-1 justify-end mt-1">
                      <div className={`w-2 h-2 rounded-full ${sale.synced ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-muted-foreground" data-testid={`sale-sync-status-${sale.id}`}>
                        {sale.synced ? 'Synced' : 'Pending Sync'}
                      </span>
                    </div>
                  </div>
                </div>

                {sale.items && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Items</h4>
                    <div className="text-sm text-muted-foreground">
                      {/* Parse and display sale items if needed */}
                      <pre className="whitespace-pre-wrap">{sale.items}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="elevation-1">
            <CardContent className="p-8 text-center">
              <span className="material-icons text-6xl text-muted-foreground mb-4">assessment</span>
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-muted-foreground">
                Start making sales to see them appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
