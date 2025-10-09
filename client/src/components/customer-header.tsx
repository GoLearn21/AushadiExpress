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

          <div className="mt-6 flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-icons text-6xl text-gray-300 mb-4">shopping_cart</span>
                <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Browse pharmacies and add medicines to your cart
                </p>
                <Button 
                  onClick={() => {
                    setCartOpen(false);
                    setLocation('/customer-search');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: CartItem) => (
                  <div key={`${item.productId}-${item.storeId}`} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">{item.storeName}</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => removeFromCart(item.productId, item.storeId)}
                      >
                        <span className="material-icons text-sm">close</span>
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.storeId, Math.max(1, item.quantity - 1))}
                        >
                          <span className="material-icons text-sm">remove</span>
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.storeId, item.quantity + 1)}
                        >
                          <span className="material-icons text-sm">add</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-2xl font-medium text-blue-600">
                      ₹{getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                    onClick={() => {
                      setCartOpen(false);
                      setLocation('/customer-cart');
                    }}
                  >
                    View Cart & Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
