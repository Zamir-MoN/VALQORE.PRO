import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { Game } from '../types';

interface CartContextType {
  cartItems: Game[];
  loading: boolean;
  addToCart: (gameId: string) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  isInCart: (gameId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, openAuthModal } = useAuth();
  const [cartItems, setCartItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/cart`);
      setCartItems(res.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (gameId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/cart`, { gameId });
      setCartItems(prev => [...prev, res.data]);
      toast.success('Added to cart!');
    } catch (error: any) {
      if (error.response?.data?.error) {
         toast.error(error.response.data.error);
      } else {
         console.error('Failed to add to cart', error);
         toast.error('Failed to add to cart');
      }
    }
  };

  const removeFromCart = async (gameId: string) => {
    if (!user) return;
    try {
      await axios.delete(`${API_URL}/cart/${gameId}`);
      setCartItems(prev => prev.filter(item => item.id !== gameId));
    } catch (error) {
      console.error('Failed to remove from cart', error);
    }
  };

  const isInCart = (gameId: string) => {
    return cartItems.some(item => item.id === gameId);
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
