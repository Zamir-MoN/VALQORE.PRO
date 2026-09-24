import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronDown, ShoppingCart, Check, Gamepad2, Sparkles, ShieldCheck, Zap, ArrowUpDown } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/image';

const SORT_OPTIONS = [
  'Highest Savings',
  'Price: Low to High',
  'Price: High to Low',
  'Newest',
  'Alphabetical'
];

export const BundlesPage = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  const { addToCart, isInCart, isOwned } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Highest Savings');
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    document.title = 'Game Bundles | VALQORE.PRO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filter only bundle games
  const bundleGames = useMemo(() => {
    return games.filter(g => g.isBundle && !g.isGiveaway);
  }, [games]);

  // Filter by search query
  const filteredBundles = useMemo(() => {
    return bundleGames.filter(bundle => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const titleMatch = bundle.title.toLowerCase().includes(q);
      const devMatch = bundle.developer?.toLowerCase().includes(q);
      const gamesMatch = bundle.bundleGames?.toLowerCase().includes(q);
      const descMatch = bundle.description?.toLowerCase().includes(q);
      return titleMatch || devMatch || gamesMatch || descMatch;
    });
  }, [bundleGames, searchQuery]);

  // Sort bundles
  const sortedBundles = useMemo(() => {
    return [...filteredBundles].sort((a, b) => {
      const savingsA = (a.steamPrice && a.steamPrice > a.price) ? ((a.steamPrice - a.price) / a.steamPrice) : 0;
      const savingsB = (b.steamPrice && b.steamPrice > b.price) ? ((b.steamPrice - b.price) / b.steamPrice) : 0;

      switch (sortBy) {
        case 'Price: Low to High':
          return a.price - b.price;
        case 'Price: High to Low':
          return b.price - a.price;
        case 'Highest Savings':
          return savingsB - savingsA;
        case 'Alphabetical':
          return a.title.localeCompare(b.title);
        case 'Newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [filteredBundles, sortBy]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-12 relative z-10 min-h-screen">
      <div className="container mx-auto max-w-[1400px]">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-12 p-6 sm:p-10 lg:p-12 border border-white/10 bg-gradient-to-br from-purple-950/40 via-background/80 to-background/90 backdrop-blur-xl shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A855F7]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] text-xs font-black uppercase tracking-wider mb-5 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Package size={14} className="animate-pulse" />
              <span>Franchise & Mega Bundles</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white mb-4 leading-tight">
              Curated Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-purple-300 to-primary">Bundles & Packs</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl font-normal">
              Own complete franchises and game collections in a single discounted pack. Enjoy instant digital delivery, verified launcher credentials, and permanent lifetime warranty.
            </p>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10">
                <Sparkles size={14} className="text-[#A855F7]" /> Up to 80% Bundle Savings
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10">
                <Zap size={14} className="text-primary" /> Instant Delivery
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10">
                <ShieldCheck size={14} className="text-emerald-400" /> 100% Lifetime Warranty
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bundles or included games..."
              className="w-full pl-10 pr-4 py-2.5 bg-cards/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-text-secondary/60 focus:border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-[#A855F7] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results count & Sort */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <span className="text-xs text-text-secondary font-bold whitespace-nowrap">
              {sortedBundles.length} {sortedBundles.length === 1 ? 'Bundle' : 'Bundles'} Available
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-cards/60 border border-white/10 rounded-xl text-xs font-bold text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <ArrowUpDown size={14} className="text-[#A855F7]" />
                <span>Sort: {sortBy}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-cards/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-30">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors ${
                        sortBy === option ? 'text-[#A855F7] bg-[#A855F7]/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col bg-cards/40 border border-white/5 rounded-2xl p-3 overflow-hidden animate-pulse">
                <div className="w-full aspect-[16/9] bg-white/5 rounded-xl" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                    <div className="h-5 w-16 bg-white/10 rounded" />
                    <div className="h-8 w-24 bg-white/10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedBundles.length === 0 ? (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-cards/30 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center">
            <div className="p-4 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7] mb-4">
              <Package size={36} />
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white mb-2">No Bundles Found</h3>
            <p className="text-text-secondary text-sm max-w-md mb-6">
              {searchQuery ? `No bundles matching "${searchQuery}". Try a different search term or clear the filter.` : 'Check back soon for new bundle packs and franchise releases.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-[#A855F7] hover:bg-[#A855F7]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          /* Bundles Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBundles.map((bundle) => {
              const hasSavings = bundle.steamPrice != null && bundle.steamPrice > bundle.price && bundle.price > 0;
              const savingsPercent = hasSavings ? Math.round(((bundle.steamPrice! - bundle.price) / bundle.steamPrice!) * 100) : 0;
              const inCart = isInCart(bundle.id);
              const owned = isOwned(bundle.id);

              // Calculate included games count
              const includedList = bundle.bundleGames
                ? bundle.bundleGames.split(/[,+]/).map(s => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={bundle.id}
                  className="group flex flex-col bg-cards/50 hover:bg-cards/90 border border-white/10 hover:border-[#A855F7]/50 rounded-2xl p-3 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:-translate-y-1 relative"
                >
                  {/* Landscape Image Banner (16:9) */}
                  <Link to={`/game/${bundle.slug || bundle.id}`} className="block relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-black/60">
                    <img
                      src={getImageUrl(bundle.coverImage) || '/images/hero-artwork.png'}
                      alt={bundle.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    {/* Top Left: Bundle Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-[#A855F7]/40 text-[#A855F7] text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                      <Package size={12} className="text-[#A855F7]" />
                      <span>Bundle Pack</span>
                    </div>

                    {/* Top Right: Status / Savings Badge */}
                    {bundle.outOfStock ? (
                      <div className="absolute top-2.5 right-2.5 bg-red-500/90 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                        Out of Stock
                      </div>
                    ) : owned ? (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                        <Check size={11} strokeWidth={3} />
                        <span>In Library</span>
                      </div>
                    ) : hasSavings && isFinite(savingsPercent) ? (
                      <div className="absolute top-2.5 right-2.5 bg-[#A855F7]/25 text-[#A855F7] border border-[#A855F7]/40 backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.3)] whitespace-nowrap">
                        SAVE {savingsPercent}%
                      </div>
                    ) : null}
                  </Link>

                  {/* Card Body */}
                  <div className="p-2 sm:p-3 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <Link to={`/game/${bundle.slug || bundle.id}`}>
                        <h3 className="font-heading font-black text-base sm:text-lg text-white group-hover:text-[#A855F7] transition-colors line-clamp-1 leading-snug">
                          {bundle.title}
                        </h3>
                      </Link>

                      {/* Included Games Pill / Count */}
                      {includedList.length > 0 ? (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
                          <Gamepad2 size={13} className="text-[#A855F7] shrink-0" />
                          <span className="font-semibold text-white/80">{includedList.length} Games Included:</span>
                          <span className="truncate text-text-secondary">{includedList.slice(0, 2).join(', ')}{includedList.length > 2 ? '...' : ''}</span>
                        </div>
                      ) : bundle.bundleGames ? (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary truncate">
                          <Gamepad2 size={13} className="text-[#A855F7] shrink-0" />
                          <span className="truncate">{bundle.bundleGames}</span>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-xs text-text-secondary truncate">
                          {bundle.developer || bundle.genre}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Add to Cart Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2 mt-auto">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-black text-lg sm:text-xl text-white">
                            {formatPrice(bundle.price)}
                          </span>
                        </div>
                        {hasSavings && (
                          <span className="text-[11px] text-text-secondary/70 line-through">
                            {formatPrice(bundle.steamPrice!)}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {!bundle.outOfStock && (
                        owned ? (
                          <Link
                            to="/library"
                            className="p-2.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-all border border-emerald-500/30"
                            title="Owned in Library"
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </Link>
                        ) : inCart ? (
                          <Link
                            to="/cart"
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                          >
                            <Check size={14} />
                            <span>In Cart</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => addToCart(bundle)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#A855F7] hover:bg-[#A855F7]/90 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <ShoppingCart size={14} />
                            <span>Get Pack</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Benefits Section at Bottom */}
        <div className="mt-20 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cards/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-[#A855F7]/15 rounded-xl border border-[#A855F7]/30 text-[#A855F7] shrink-0">
              <Package size={22} />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-base mb-1">Bulk Value Savings</h4>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Save up to 80% compared to buying individual games. Complete franchise collections priced for maximum affordability.
              </p>
            </div>
          </div>

          <div className="bg-cards/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-primary/15 rounded-xl border border-primary/30 text-primary shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-base mb-1">Instant Full Access</h4>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                All titles in the bundle are activated immediately upon checkout with full access to campaigns, online multiplayer, and DLCs.
              </p>
            </div>
          </div>

          <div className="bg-cards/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-base mb-1">Lifetime Warranty</h4>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Every bundle is backed by our full replacement guarantee and 24/7 dedicated community support on Discord and Telegram.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
