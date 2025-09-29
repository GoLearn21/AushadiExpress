import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { useLocation } from "wouter";
import { tw } from "../lib/theme";

export default function SalesLedgerScreen() {
  const [, navigate] = useLocation();
  
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/sales'],
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
    <div className="h-screen overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/ops')}
              className="text-muted-foreground hover:text-foreground"
              data-testid="back-to-ops"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className={`${tw.headingXl}`} data-testid="sales-ledger-title">Sales Ledger</h1>
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {(sales as any[]).length > 0 ? (
            (sales as any[]).map((sale: any) => (
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
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="material-icons text-4xl mb-2">receipt_long</span>
              <p>No sales recorded yet</p>
            </div>
          )}
        </div>
        
        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}