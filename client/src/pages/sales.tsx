import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";

export default function Sales() {
  const [activeTab, setActiveTab] = useState('sales');
  const [, setLocation] = useLocation();
  
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: todaysSales } = useQuery({
    queryKey: ['/api/sales/today'],
  });

  const { data: submittedInvoices = [] } = useQuery({
    queryKey: ['/api/documents'],
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
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setLocation('/pharmacy-orders')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="material-icons text-sm">shopping_bag</span>
            <span className="hidden sm:inline">Manage Orders</span>
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today's Total</p>
            <p className="text-xl font-bold text-primary" data-testid="todays-total">
              ₹{todaysSales?.total?.toFixed(2) || '0.00'}
            </p>
          </div>
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
        {activeTab === 'sales' ? (
          // Sales Tab Content
          sales.length > 0 ? (
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

                        {/* Customer Info */}
                        {(sale.customerName || sale.customerPhone) && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                            <span className="material-icons text-xs">person</span>
                            <span>{sale.customerName || 'Customer'}</span>
                            {sale.customerPhone && (
                              <span className="text-muted-foreground">• {sale.customerPhone}</span>
                            )}
                          </div>
                        )}

                        {/* Sale Mode Badge */}
                        <div className="mt-1">
                          {sale.customerId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              <span className="material-icons text-xs">shopping_bag</span>
                              Online Order
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                              <span className="material-icons text-xs">store</span>
                              POS Sale
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold" data-testid={`sale-total-${sale.id}`}>
                        ₹{sale.total.toFixed(2)}
                      </p>

                      {/* Order Status Badge */}
                      {sale.status && (
                        <div className="mt-1">
                          {sale.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Pending
                            </span>
                          )}
                          {sale.status === 'confirmed' && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              Confirmed
                            </span>
                          )}
                          {sale.status === 'preparing' && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              Preparing
                            </span>
                          )}
                          {sale.status === 'ready' && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Ready
                            </span>
                          )}
                          {sale.status === 'completed' && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              ✓ Completed
                            </span>
                          )}
                          {sale.status === 'rejected' && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                              Rejected
                            </span>
                          )}
                        </div>
                      )}

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
                      <div className="space-y-2">
                        {(() => {
                          try {
                            const items = JSON.parse(sale.items);
                            return items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex-1">
                                  <p className="font-medium">{item.productName || item.name}</p>
                                  {item.batchNumber && (
                                    <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ));
                          } catch (e) {
                            return <p className="text-xs text-muted-foreground">Unable to display items</p>;
                          }
                        })()}
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
          )
        ) : (
          // Receiving Tab Content
          Array.isArray(submittedInvoices) && submittedInvoices.length > 0 ? (
            submittedInvoices.map((doc: any) => {
              const header = doc.header || {};
              const lineItems = doc.lineItems || [];
              const productCount = lineItems.length;
              const totals = doc.totals || {};
              
              const invoiceDate = header.invoiceDate || header.date || doc.createdAt;
              const formattedDate = invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : '';
              
              return (
                <Card key={doc.id} className="elevation-1" data-testid={`invoice-${doc.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {header.supplierName || 'Unknown Supplier'}
                        </p>
                        {header.supplierAddress && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {header.supplierAddress}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          {header.invoiceNumber && (
                            <div className="flex items-center gap-1">
                              <span className="material-icons text-sm text-muted-foreground">receipt</span>
                              <span className="text-sm text-muted-foreground">
                                {header.invoiceNumber}
                              </span>
                            </div>
                          )}
                          {formattedDate && (
                            <div className="flex items-center gap-1">
                              <span className="material-icons text-sm text-muted-foreground">event</span>
                              <span className="text-sm text-muted-foreground">
                                {formattedDate}
                              </span>
                            </div>
                          )}
                          {(totals.net || totals.grandTotal) && (
                            <div className="flex items-center gap-1">
                              <span className="material-icons text-sm text-muted-foreground">currency_rupee</span>
                              <span className="text-sm font-medium text-foreground">
                                {(totals.net || totals.grandTotal).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground">
                          Submitted
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="elevation-1">
              <CardContent className="p-8 text-center">
                <span className="material-icons text-6xl text-muted-foreground mb-4">inbox</span>
                <h3 className="text-lg font-semibold mb-2">No invoices received</h3>
                <p className="text-muted-foreground">
                  Uploaded invoices will appear here
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
