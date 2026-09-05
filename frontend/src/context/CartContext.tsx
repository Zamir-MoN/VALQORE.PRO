import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { Game } from '../types';

interface CartContextType {
  cartItems: Game[];
  ownedGameIds: string[];
  loading: boolean;
  addToCart: (gameId: string) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  isInCart: (gameId: string) => boolean;
  isOwned: (gameId: string) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, openAuthModal } = useAuth();
  const [cartItems, setCartItems] = useState<Game[]>([]);
  const [ownedGameIds, setOwnedGameIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  const fetchOwnedGames = async () => {
    if (!token || !user) {
      setOwnedGameIds([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data;
      if (Array.isArray(orders)) {
        const owned = orders
          .filter((o: any) => o.status === 'COMPLETED')
          .flatMap((o: any) => (o.items || []).map((item: any) => item.gameId || item.game?.id))
          .filter(Boolean);
        setOwnedGameIds(Array.from(new Set(owned)));
      }
    } catch (error) {
      // Quietly ignore
    }
  };

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

  const refreshCart = async () => {
    if (!token) {
      setCartItems([]);
      setOwnedGameIds([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data);
      fetchOwnedGames();
    } catch (error) {
      console.error('Failed to silently refresh cart', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchCart();
      fetchOwnedGames();
    } else {
      setCartItems([]);
      setOwnedGameIds([]);
    }
  }, [user, token]);

  const addToCart = async (gameId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (isOwned(gameId)) {
      toast.error('This game is already in your library');
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

  const isOwned = (gameId: string) => {
    return ownedGameIds.includes(gameId);
  };

  return (
    <CartContext.Provider value={{ cartItems, ownedGameIds, loading, addToCart, removeFromCart, isInCart, isOwned, refreshCart }}>
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
