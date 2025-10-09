import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';

export default function CustomerCartPage() {
  const [, setLocation] = useLocation();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getItemsByStore 
  } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsByStore = getItemsByStore();
  const storeIds = Object.keys(itemsByStore);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Group items by store and create orders
      for (const storeId of storeIds) {
        const storeItems = itemsByStore[storeId];
        
        const orderData = {
          items: storeItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: 'pending',
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }
      }

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the store for processing.",
      });
      
      setLocation('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Order failed",
        description: "Unable to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="material-icons text-xl">
              arrow_back
            </button>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>My Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm hover:bg-blue-700 px-3 py-1 rounded transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-32">
          <div className="max-w-2xl mx-auto">
            
            {cartItems.length === 0 ? (
              /* Empty Cart */
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4">shopping_cart</span>
                <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-600 mb-6">Browse nearby stores to add items</p>
                <Button onClick={() => setLocation('/nearby-stores')}>
                  <span className="material-icons text-sm mr-2">storefront</span>
                  Browse Stores
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items by Store */}
                {storeIds.map((storeId) => {
                  const storeItems = itemsByStore[storeId];
                  const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  
                  return (
                    <div key={storeId} className="mb-6">
                      {/* Store Header */}
                      <div className="bg-white rounded-t-lg p-4 border-b">
                        <div className="flex items-center">
                          <span className="material-icons text-blue-600 mr-2">store</span>
                          <h2 className="text-lg font-semibold text-gray-900">{storeItems[0].storeName}</h2>
                        </div>
                        {storeItems[0].storeAddress && (
                          <p className="text-sm text-gray-600 ml-8">{storeItems[0].storeAddress}</p>
                        )}
                      </div>

                      {/* Store Items */}
                      <div className="bg-white rounded-b-lg overflow-hidden mb-4">
                        {storeItems.map((item) => (
                          <div key={`${item.storeId}-${item.productId}`} className="p-4 border-b last:border-b-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{item.productName}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                )}
                                <p className="text-lg font-semibold text-gray-900">
                                  ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                </p>
                              </div>
                              <div className="ml-4 flex flex-col items-end space-y-2">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.storeId, item.quantity - 1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <span className="material-icons text-sm">remove</span>
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.storeId, item.quantity + 1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <span className="material-icons text-sm">add</span>
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.productId, item.storeId)}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                                >
                                  <span className="material-icons text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Store Subtotal */}
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Subtotal</span>
                            <span className="text-lg font-semibold text-gray-900">₹{storeTotal}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Cart Total */}
                <Card className="mb-6 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">₹{getCartTotal()}</p>
                      </div>
                      <span className="material-icons text-4xl text-blue-600">account_balance_wallet</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button 
                  onClick={handleCheckout} 
                  className="w-full h-12 text-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="material-icons animate-spin mr-2">refresh</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-2">shopping_bag</span>
                      Place Order - ₹{getCartTotal()}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
