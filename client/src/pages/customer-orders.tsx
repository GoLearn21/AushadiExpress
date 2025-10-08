import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CredibilityRibbon } from '@/components/credibility-ribbon';

export default function CustomerOrdersPage() {
  // TODO: Fetch orders from API
  const orders: any[] = [];

  return (
    <>
      <CredibilityRibbon />
      <OfflineIndicator />
      
      <div className="container mx-auto p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <span className="material-icons text-6xl mb-4">shopping_bag</span>
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-sm">Your orders will appear here once you place them</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <CardDescription>{order.pharmacy}</CardDescription>
                    </div>
                    <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{order.items} items</p>
                    <p className="text-lg font-semibold">₹{order.total}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
