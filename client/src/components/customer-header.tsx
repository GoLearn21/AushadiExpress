import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { tw } from '@/lib/theme';
import { useCart, CartItem } from '@/hooks/use-cart';

export function CustomerHeader() {
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  return (
    <>
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-xl">medication</span>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>AushadiExpress</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setCartOpen(true)}
          >
            <span className="material-icons">shopping_cart</span>
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-2xl font-medium tracking-tight">Shopping Cart</SheetTitle>
            <SheetDescription>
              {cartItemCount > 0 
                ? `${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'} in your cart` 
                : 'Your cart is empty'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 px-6">
                <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <span className="material-icons text-6xl text-blue-300">shopping_cart</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">
                  Browse nearby pharmacies and add medicines to your cart
                </p>
                <Button 
                  onClick={() => {
                    setCartOpen(false);
                    setLocation('/customer-search');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-full"
                >
                  <span className="material-icons text-sm mr-2">search</span>
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                  {cartItems.map((item: CartItem) => (
                    <div key={`${item.productId}-${item.storeId}`} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="flex gap-3">
                        {/* Product Icon/Image */}
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-icons text-blue-600 text-2xl">medication</span>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">
                            {item.productName}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="material-icons text-xs text-gray-400">store</span>
                            <p className="text-xs text-gray-500 truncate">{item.storeName}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-1 bg-gray-50 rounded-full px-1.5 py-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.storeId, Math.max(1, item.quantity - 1))}
                                className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                              >
                                <span className="material-icons text-base text-gray-600">remove</span>
                              </button>
                              <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.storeId, item.quantity + 1)}
                                className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                              >
                                <span className="material-icons text-base text-blue-600">add</span>
                              </button>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-400">₹{item.price.toFixed(2)} each</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.storeId)}
                          className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors self-start rounded-full hover:bg-red-50"
                        >
                          <span className="material-icons text-base">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Sticky Bottom Summary */}
                <div className="border-t bg-white px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Subtotal ({cartItemCount} items)</span>
                    <span className="text-2xl font-bold text-gray-900">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/30"
                    onClick={() => {
                      setCartOpen(false);
                      setLocation('/cart');
                    }}
                  >
                    Proceed to Checkout
                    <span className="material-icons ml-2">arrow_forward</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
