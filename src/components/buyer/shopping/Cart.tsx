
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // If it exists, increase quantity
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += 1;
        toast.success(`Added another ${product.name} to your cart`);
        return newItems;
      } else {
        // If it doesn't exist, add new item with quantity 1
        toast.success(`${product.name} added to your cart`);
        return [...currentItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const itemToRemove = currentItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from your cart`);
      }
      return currentItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart has been cleared');
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
