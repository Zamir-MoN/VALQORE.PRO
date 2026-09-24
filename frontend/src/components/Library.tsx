import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Gamepad2, Search, Play, ArrowRight, ArrowLeft, ShieldCheck, Download, Loader2, Sparkles, Star, Key, ExternalLink, X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import axios from 'axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/image';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const Library = () => {
  const { user, token, loading: authLoading, openAuthModal } = useAuth();
  const { games: allGlobalGames } = useGames();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'COMPLETED' | 'CREATOR_ACCESS'>('COMPLETED');
  const [creatorStatus, setCreatorStatus] = useState<string | null>(null);

  // Phase 11: Account Info Modal State
  const [selectedAccountGame, setSelectedAccountGame] = useState<any | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Handle escape key for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountModalOpen(false);
    };
    if (isAccountModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isAccountModalOpen]);

  useEffect(() => {
    document.title = 'VALQORE';
  }, []);


  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
      navigate('/');
    }
  }, [user, authLoading, navigate, openAuthModal]);


  useEffect(() => {
    if (user && token) {
      fetchLibraryGames();
      checkCreatorStatus();
    }
  }, [user, token]);

  const checkCreatorStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/creators/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatorStatus(res.data.status);
    } catch (err) {
      console.error('Creator status check error:', err);
    }
  };

  const fetchLibraryGames = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err: any) {
      console.error('Failed to fetch library games', err);
      toast.error('Failed to load your game library');
    } finally {
      setLoading(false);
    }
  };

  // Creator Access Games from store marked with creatorAccess: true
  const creatorAccessGames = allGlobalGames.filter(g => g.creatorAccess);

  // Extract unique COMPLETED purchased games from orders (deduplicated by game id)
  const completedOrders = orders.filter(order => order.status === 'COMPLETED');
  const gamesMap = new Map<string, any>();

  completedOrders.forEach(order => {
    (order.items || []).forEach((item: any) => {
      if (item.game && item.game.id) {
        // If not added or if this order is more recent, store it
        if (!gamesMap.has(item.game.id)) {
          gamesMap.set(item.game.id, {
            ...item.game,
            orderId: order.id,
            orderStatus: order.status,
            orderDate: order.createdAt,
            pricePaid: item.pricePaid,
            isCreatorGame: false
          });
        }
      }
    });
  });

  const allLibraryGames = Array.from(gamesMap.values());

  const displayedGames = filter === 'CREATOR_ACCESS'
    ? creatorAccessGames.map(g => ({
        ...g,
        orderId: `creator-${g.id}`,
        orderStatus: 'CREATOR_ACCESS',
        orderDate: g.releaseDate || new Date().toISOString(),
        pricePaid: 0,
        isCreatorGame: true
      }))
    : allLibraryGames;

  const filteredGames = displayedGames.filter(g => {
    const matchesSearch = !searchQuery || 
      g.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'ALL' || filter === 'CREATOR_ACCESS' || g.orderStatus === filter;

    return matchesSearch && matchesFilter;
  });


  if (authLoading || !user) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleClaimCreatorGame = (gameTitle: string) => {
    const creatorName = user?.username || 'Valqore Creator';
    const message = encodeURIComponent(`Hi Valqore! I want to claim Creator Access for "${gameTitle}". My creator account name is "${creatorName}".`);
    toast.success(`Redirecting to Instagram to claim ${gameTitle}!`, { icon: '🚀' });
    window.open(`https://ig.me/m/valqore.pro?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Order details copied to clipboard!');
      } else {
        toast.error('Failed to copy details');
      }
    } catch (err) {
      toast.error('Failed to copy details');
    }
    document.body.removeChild(textArea);
  };

  const handleCopyOrderDetails = (game: any) => {
    const text = `Hi Valqore.pro! 👋

I need the account details for my purchased game.

🎮 Game: ${game.title}
🆔 Order ID: #${game.orderId}
💰 Amount: ₹${game.pricePaid}
📅 Purchase Date: ${new Date(game.orderDate).toLocaleDateString()}

Please provide my game account details.
Thank you!`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success('Order details copied to clipboard!'))
        .catch(() => copyToClipboardFallback(text));
    } else {
      copyToClipboardFallback(text);
    }
  };

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-24 px-3 sm:px-6 lg:px-12 relative z-10 min-h-screen" id="library-page">
      {/* Background ambient glow */}
      <div className="absolute top-28 sm:top-40 left-1/2 -translate-x-1/2 w-[350px] sm:w-[800px] h-[250px] sm:h-[350px] bg-primary/5 rounded-[100%] blur-[100px] sm:blur-[140px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-[1400px]">
        
        {/* Header section */}
        <div className="flex flex-col gap-5 sm:gap-6 mb-8 sm:mb-10 pb-5 sm:pb-6 border-b border-white/10">
          <div>
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors w-fit mb-3 group cursor-pointer"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">Back</span>
            </button>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-white flex items-center gap-3 sm:gap-4">
              <Gamepad2 className="text-primary w-8 h-8 sm:w-11 sm:h-11 flex-shrink-0" />
              <span>Game Library</span>
            </h1>
            <p className="text-text-secondary text-xs sm:text-base mt-1.5 sm:mt-2">
              Access and manage all your purchased game accounts and licenses.
            </p>
          </div>


          {/* Controls: Search and Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cards/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-primary focus:bg-cards/90 outline-none transition-all placeholder:text-text-secondary/60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-cards/60 border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilter('COMPLETED')}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filter === 'COMPLETED'
                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(220,248,54,0.3)]'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                Purchased ({allLibraryGames.length})
              </button>
              {creatorStatus === 'APPROVED' && creatorAccessGames.length > 0 && (
                <button
                  onClick={() => setFilter('CREATOR_ACCESS')}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filter === 'CREATOR_ACCESS'
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(220,248,54,0.3)]'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Star size={13} className={filter === 'CREATOR_ACCESS' ? 'fill-black' : 'text-primary fill-primary/30'} />
                  <span>Creator Access ({creatorAccessGames.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs sm:text-sm text-text-secondary font-medium">Loading your library...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cards/60 border border-white/10 flex items-center justify-center text-text-secondary mb-4 sm:mb-5 shadow-lg">
              <Gamepad2 size={36} className="text-white/30" />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white mb-2">
              {filter === 'CREATOR_ACCESS' ? 'No Creator Games Available' : 'Your Library is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
              {filter === 'CREATOR_ACCESS' 
                ? "There are currently no games marked for creator distribution. Check back soon!" 
                : "You haven't purchased any games yet or your search filter didn't match any items. Explore our store to find your next adventure!"}
            </p>
            <Link
              to="/store"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-primary text-background font-heading font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(220,248,54,0.3)] uppercase tracking-wider w-full sm:w-auto"
            >
              <span>Browse Games Store</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {filteredGames.map((item, idx) => (
              <div 
                key={`${item.id}-${item.orderId}-${idx}`} 
                className="group bg-cards/40 hover:bg-cards/80 border border-white/5 hover:border-primary/40 rounded-xl p-2.5 sm:p-3 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col backdrop-blur-sm relative overflow-hidden"
              >
                {/* Cover Art */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-2.5 bg-black/40">
                  <img 
                    src={item.coverImage ? getImageUrl(item.coverImage) : '/images/hero-artwork.png'} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg ${
                      item.isCreatorGame
                        ? 'bg-primary text-black shadow-[0_0_10px_rgba(220,248,54,0.4)]'
                        : item.orderStatus === 'COMPLETED' 
                        ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                        : item.orderStatus === 'CANCELLED'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {item.isCreatorGame ? '★ Creator' : item.orderStatus === 'COMPLETED' ? 'Ready' : item.orderStatus}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    <span className="text-[8px] sm:text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 backdrop-blur-md">
                      {item.genre || 'Game'}
                    </span>
                  </div>
                </div>

                {/* Title & Info */}
                <div className="flex flex-col flex-1">
                  <h3 className="font-heading font-black text-sm sm:text-base text-white group-hover:text-primary transition-colors truncate mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-[10px] sm:text-xs truncate mb-2">{item.developer || 'Publisher'}</p>

                  <div className="mt-auto pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-text-secondary mb-2.5 sm:mb-3 gap-1 sm:gap-0">
                    <span>{item.isCreatorGame ? 'Access Type' : 'Purchased'}</span>
                    <span className="text-white font-mono font-bold">
                      {item.isCreatorGame ? 'Creator Pass' : new Date(item.orderDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    <Link
                      to={`/game/${item.slug || item.id}`}
                      className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-all text-center active:scale-95"
                    >
                      <Play size={11} className="text-primary flex-shrink-0" />
                      <span>Details</span>
                    </Link>
                    {item.isCreatorGame ? (
                      <button
                        onClick={() => handleClaimCreatorGame(item.title)}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-primary to-[#c4e320] hover:from-white hover:to-white text-black font-black border border-primary/40 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-all text-center shadow-[0_0_10px_rgba(220,248,54,0.3)] hover:shadow-[0_0_15px_rgba(220,248,54,0.6)] active:scale-95 cursor-pointer"
                      >
                        <Key size={11} className="flex-shrink-0" />
                        <span>Claim</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAccountGame(item);
                          setIsAccountModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-all text-center shadow-[0_0_10px_rgba(220,248,54,0.1)] active:scale-95 cursor-pointer"
                      >
                        <ShieldCheck size={11} className="flex-shrink-0" />
                        <span>Account</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info Modal */}
      {createPortal(
        <AnimatePresence>
          {isAccountModalOpen && selectedAccountGame && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-cards/50">
                <h3 className="font-heading font-black text-xl text-white">Purchase Details</h3>
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-primary mb-2">Thank you for your purchase! 🎮</h4>
                  <p className="text-sm text-text-secondary">
                    Please use the purchase details below when contacting Valqore to receive your game account credentials.
                  </p>
                </div>
                
                <div className="bg-cards border border-white/10 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-text-secondary text-xs">Order ID</span>
                    <span className="text-white font-mono font-bold text-sm">{selectedAccountGame.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-text-secondary text-xs">Game</span>
                    <span className="text-white font-bold text-sm text-right">{selectedAccountGame.title}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-text-secondary text-xs">Amount Paid</span>
                    <span className="text-primary font-bold text-sm">₹{selectedAccountGame.pricePaid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-xs">Purchase Date</span>
                    <span className="text-white font-mono text-sm">{new Date(selectedAccountGame.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleCopyOrderDetails(selectedAccountGame)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Copy size={16} />
                    <span>Copy Order Details</span>
                  </button>
                  
                  <a
                    href="https://ig.me/m/valqore.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-white text-black rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(220,248,54,0.3)] hover:shadow-[0_0_20px_rgba(220,248,54,0.5)] cursor-pointer active:scale-95"
                  >
                    <ExternalLink size={16} />
                    <span>Contact us on Instagram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
