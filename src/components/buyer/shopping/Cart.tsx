import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Fix: Properly define the CartProvider as a React functional component
export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = async (product: Omit<CartItem, 'quantity'>) => {
    try {
      // Check product availability in database and get the seller_id
      const { data: productData, error } = await supabase
        .from('products')
        .select('stock_quantity, is_available, seller_id, name')
        .eq('id', product.id)
        .single();
      
      if (error) {
        console.error('Error checking product availability:', error);
        toast.error('Unable to verify product availability');
        return;
      }
      
      if (!productData || !productData.is_available || productData.stock_quantity <= 0) {
        toast.error('This product is currently unavailable');
        return;
      }

      // Ensure we have a valid seller_id
      if (!productData.seller_id) {
        console.error('Product has no seller_id:', product.id);
        toast.error('Cannot add product without seller information');
        return;
      }
      
      console.log(`Adding product ${product.id} with seller ID: ${productData.seller_id}`);
      
      setItems(currentItems => {
        // Check if item already exists in cart
        const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
          // If it exists, check if we can increase quantity
          const newItems = [...currentItems];
          const newQuantity = newItems[existingItemIndex].quantity + 1;
          
          if (productData && newQuantity > productData.stock_quantity) {
            toast.error(`Sorry, only ${productData.stock_quantity} items available`);
            return currentItems;
          }
          
          newItems[existingItemIndex].quantity = newQuantity;
          toast.success(`Added another ${product.name} to your cart`);
          return newItems;
        } else {
          // If it doesn't exist, add new item with quantity 1 and include seller_id
          toast.success(`${product.name} added to your cart`);
          return [...currentItems, { 
            ...product, 
            quantity: 1,
            seller: productData.seller_id // Ensure seller ID is included
          }];
        }
      });

      // Open the cart sidebar when an item is added
      setIsCartOpen(true);
    } catch (err) {
      console.error('Error adding item to cart:', err);
      toast.error('Failed to add item to cart');
    }
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

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      // Verify quantity against inventory
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      
      const { data: productData, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error checking product stock:', error);
        toast.error('Unable to verify product availability');
        return;
      }
      
      if (productData && quantity > productData.stock_quantity) {
        toast.error(`Sorry, only ${productData.stock_quantity} items available`);
        setItems(currentItems => 
          currentItems.map(item => 
            item.id === id ? { ...item, quantity: productData.stock_quantity } : item
          )
        );
        return;
      }
      
      setItems(currentItems => 
        currentItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      toast.error('Failed to update cart');
    }
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
    totalPrice,
    isCartOpen,
    setIsCartOpen
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
