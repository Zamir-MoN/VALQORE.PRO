import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { Gamepad2, Search, Play, ArrowRight, ShieldCheck, Download, Loader2, Sparkles, Star, Key, ExternalLink } from 'lucide-react';
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
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CREATOR_ACCESS'>('ALL');
  const [creatorStatus, setCreatorStatus] = useState<string | null>(null);

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

  // Extract all unique purchased games from orders
  const allLibraryGames = orders.flatMap(order => 
    (order.items || []).map((item: any) => ({
      ...item.game,
      orderId: order.id,
      orderStatus: order.status,
      orderDate: order.createdAt,
      pricePaid: item.pricePaid,
      isCreatorGame: false
    }))
  );

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

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen" id="library-page">
      {/* Background ambient glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 rounded-[100%] blur-[140px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-[1400px]">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-3">
              <Sparkles size={14} /> My Collection
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white flex items-center gap-4">
              <Gamepad2 className="text-primary w-10 h-10 sm:w-12 sm:h-12" />
              Game Library
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              Access and manage all your purchased game accounts and licenses.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cards/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-primary focus:bg-cards/90 outline-none transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap bg-cards/60 p-1 rounded-xl border border-white/10 text-xs font-bold gap-1">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${filter === 'ALL' ? 'bg-primary text-background font-black shadow-[0_0_10px_rgba(220,248,54,0.3)]' : 'text-text-secondary hover:text-white'}`}
              >
                Purchased ({allLibraryGames.length})
              </button>
              {creatorStatus === 'APPROVED' && (
                <button
                  onClick={() => setFilter('CREATOR_ACCESS')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${filter === 'CREATOR_ACCESS' ? 'bg-gradient-to-r from-primary to-lime-400 text-black font-black shadow-[0_0_15px_rgba(220,248,54,0.4)]' : 'text-primary hover:bg-primary/10 border border-primary/20'}`}
                >
                  <Star size={13} className="fill-current" />
                  Creator Access ({creatorAccessGames.length})
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-text-secondary font-bold text-sm">Loading your library...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-24 px-6 bg-cards/30 border border-white/5 rounded-3xl text-center max-w-2xl mx-auto backdrop-blur-sm shadow-2xl">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,248,54,0.15)]">
              <Gamepad2 size={40} />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              {filter === 'CREATOR_ACCESS' ? 'No Creator Access Games Available' : 'No Games in Library Yet'}
            </h2>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
              {filter === 'CREATOR_ACCESS' 
                ? 'No games are currently marked for Creator Access. Check back soon as new games are added!'
                : "You haven't purchased any games yet or your search filter didn't match any items. Explore our store to find your next adventure!"}
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-3 bg-primary text-background font-heading font-black text-sm px-8 py-4 rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(220,248,54,0.3)] uppercase tracking-wider"
            >
              <span>Browse Games Store</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((item, idx) => (
              <div 
                key={`${item.id}-${item.orderId}-${idx}`} 
                className="group bg-cards/40 hover:bg-cards/80 border border-white/5 hover:border-primary/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col backdrop-blur-sm relative overflow-hidden"
              >
                {/* Cover Art */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4 bg-black/40">
                  <img 
                    src={item.coverImage ? getImageUrl(item.coverImage) : '/images/hero-artwork.png'} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
                      item.isCreatorGame
                        ? 'bg-primary text-black shadow-[0_0_15px_rgba(220,248,54,0.4)]'
                        : item.orderStatus === 'COMPLETED' 
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                        : item.orderStatus === 'CANCELLED'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {item.isCreatorGame ? '★ Creator Access' : item.orderStatus === 'COMPLETED' ? 'Ready to Play' : item.orderStatus}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {item.genre || 'Game'}
                    </span>
                  </div>
                </div>

                {/* Title & Info */}
                <div className="flex flex-col flex-1">
                  <h3 className="font-heading font-black text-lg text-white group-hover:text-primary transition-colors truncate mb-1">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-xs truncate mb-4">{item.developer || 'Publisher'}</p>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-secondary mb-4">
                    <span>{item.isCreatorGame ? 'Access Type' : 'Purchased'}</span>
                    <span className="text-white font-mono font-bold">
                      {item.isCreatorGame ? 'Creator Free Pass' : new Date(item.orderDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/game/${item.id}`}
                      className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2.5 text-xs font-bold transition-all text-center"
                    >
                      <Play size={14} className="text-primary" />
                      <span>Details</span>
                    </Link>
                    <Link
                      to={item.isCreatorGame ? `/game/${item.id}` : "/profile"}
                      className="flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 rounded-xl py-2.5 text-xs font-bold transition-all text-center shadow-[0_0_10px_rgba(220,248,54,0.1)]"
                    >
                      {item.isCreatorGame ? <Key size={14} /> : <ShieldCheck size={14} />}
                      <span>{item.isCreatorGame ? 'Play Now' : 'Account Info'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

