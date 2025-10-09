import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  description: string | null;
  price: number;
  quantity: number;
  storeName: string;
  storeId: string;
  storeAddress: string | null;
  storePhone: string | null;
}

const CART_STORAGE_KEY = 'aushadiexpress_cart';
const CART_UPDATE_EVENT = 'cart-updated';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize state from localStorage
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Failed to load cart:', error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT));
  }, [cartItems]);

  useEffect(() => {
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Only update if the cart has actually changed
          setCartItems(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(parsedCart);
            return prevStr !== newStr ? parsedCart : prev;
          });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      }
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    return () => window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Check if item already exists from same store
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.storeId === item.storeId
      );

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }

      // Add new item
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, storeId: string) => {
    setCartItems((prev) => prev.filter(
      (item) => !(item.productId === productId && item.storeId === storeId)
    ));
  };

  const updateQuantity = (productId: string, storeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, storeId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.storeId === storeId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Group items by store
  const getItemsByStore = () => {
    const grouped: Record<string, CartItem[]> = {};
    cartItems.forEach((item) => {
      if (!grouped[item.storeId]) {
        grouped[item.storeId] = [];
      }
      grouped[item.storeId].push(item);
    });
    return grouped;
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getItemsByStore,
  };
}
