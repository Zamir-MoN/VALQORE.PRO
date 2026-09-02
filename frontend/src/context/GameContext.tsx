import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import type { Game } from '../types';

interface GameContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
  socket: any;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Ensure we parse the platforms string into an array if it comes from the API as a string
const parseGames = (rawGames: any[]): Game[] => {
  return rawGames.map((game) => ({
    ...game,
    platforms: typeof game.platforms === 'string' 
      ? game.platforms.split(',').map((p: string) => p.trim()) 
      : (game.platforms || [])
  }));
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketInstance, setSocketInstance] = useState<any>(null);

  // Use the public IP if in production, or fallback to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/games`);
      setGames(parseGames(res.data));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch games:', err);
      setError('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    // Setup Socket.io listener for real-time updates
    const socket = io(API_URL.replace('/api', ''), {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    setSocketInstance(socket);

    socket.on('games_updated', () => {
      // Silently fetch latest games without showing loading state
      axios.get(`${API_URL}/games`)
        .then(res => setGames(parseGames(res.data)))
        .catch(console.error);
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL]);

  return (
    <GameContext.Provider value={{ games, loading, error, refreshGames: fetchGames, socket: socketInstance }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};

export const useSocket = () => {
  const context = useContext(GameContext);
  return context?.socket || null;
};
