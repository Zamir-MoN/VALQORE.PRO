import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { Game } from '../types';

interface WishlistContextType {
  wishlistItems: Game[];
  loading: boolean;
  addToWishlist: (gameId: string) => Promise<void>;
  removeFromWishlist: (gameId: string) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, openAuthModal } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/wishlist`);
      setWishlistItems(res.data);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (gameId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await axios.post(`${API_URL}/wishlist`, { gameId });
      await fetchWishlist();
      toast.success('Added to wishlist!');
    } catch (error: any) {
      console.error('Failed to add to wishlist', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (gameId: string) => {
    if (!user) return;
    try {
      await axios.delete(`${API_URL}/wishlist/${gameId}`);
      setWishlistItems(prev => prev.filter(item => item.id !== gameId));
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const isInWishlist = (gameId: string) => {
    return wishlistItems.some(item => item.id === gameId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
