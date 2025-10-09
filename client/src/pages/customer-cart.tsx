import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CustomerHeader } from '@/components/customer-header';
import { useToast } from '@/hooks/use-toast';

export default function CustomerCartPage() {
  const [, setLocation] = useLocation();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getItemsByStore,
    getCartItemCount
  } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsByStore = getItemsByStore();
  const storeIds = Object.keys(itemsByStore);
  const cartItemCount = getCartItemCount();

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
          storeTenantId: storeId, // Seller's tenant ID
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
    <div className="flex flex-col h-screen bg-gray-50">
      <OfflineIndicator />
      <CustomerHeader />

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
            <span className="material-icons text-7xl text-blue-400">shopping_cart</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-8 max-w-sm">
            Browse nearby pharmacies and add medicines to your cart
          </p>
          <Button 
            onClick={() => setLocation('/nearby-stores')}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full text-base font-semibold"
          >
            <span className="material-icons mr-2">storefront</span>
            Browse Stores
          </Button>
        </div>
      ) : (
        <>
          {/* Scrollable Cart Content */}
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="p-4 space-y-4">
              {/* Cart Items Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Cart Items ({cartItemCount})
                </h2>
                <button
                  onClick={() => {
                    if (confirm('Clear all items from cart?')) {
                      clearCart();
                    }
                  }}
                  className="h-11 px-4 text-sm text-red-600 font-semibold rounded-full hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Items Grouped by Store */}
              {storeIds.map((storeId) => {
                const storeItems = itemsByStore[storeId];
                const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                return (
                  <div key={storeId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Store Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-600 text-xl">store</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {storeItems[0].storeName}
                          </h3>
                          {storeItems[0].storeAddress && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {storeItems[0].storeAddress}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Store Total</p>
                          <p className="font-bold text-gray-900">₹{storeTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Store Items */}
                    <div className="divide-y divide-gray-100">
                      {storeItems.map((item) => (
                        <div key={`${item.storeId}-${item.productId}`} className="p-4">
                          <div className="flex gap-3">
                            {/* Product Icon */}
                            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="material-icons text-gray-600 text-3xl">medication</span>
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.productName}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1.5">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.storeId, Math.max(1, item.quantity - 1))}
                                    className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                                  >
                                    <span className="material-icons text-base text-gray-600">remove</span>
                                  </button>
                                  <span className="w-10 text-center text-sm font-bold text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.storeId, item.quantity + 1)}
                                    className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                                  >
                                    <span className="material-icons text-base text-gray-600">add</span>
                                  </button>
                                </div>
                                
                                {/* Price & Remove */}
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-400">
                                      ₹{item.price.toFixed(2)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.productId, item.storeId)}
                                className="mt-2 h-11 px-3 text-xs text-red-600 font-medium flex items-center gap-1 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <span className="material-icons text-base">delete</span>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Checkout Section */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl pb-safe">
            <div className="p-4 space-y-3">
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                  <span className="font-semibold text-gray-900">₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">shopping_bag</span>
                    Place Order • ₹{getCartTotal().toFixed(2)}
                    <span className="material-icons ml-2">arrow_forward</span>
                  </>
                )}
              </Button>

              {/* Secure Payment Info */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="material-icons text-sm text-green-600">verified_user</span>
                <span>Secure Checkout • 100% Safe</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
