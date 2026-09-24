import { useRef } from 'react';
import { Layers, ArrowRight, ShoppingCart, Check, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/image';

export const BundleGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  const { addToCart, isInCart, isOwned } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter games marked as bundles
  const bundleGamesData = games.filter(game => game.isBundle && !game.isGiveaway);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative z-10" id="bundles">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="h-7 w-32 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-5 w-20 bg-primary/10 rounded-full animate-pulse" />
            </div>
            <div className="w-20 h-5 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[calc(50%-6px)] min-w-[calc(50%-6px)] sm:w-auto sm:min-w-0 flex-shrink-0 flex flex-col bg-cards/40 border border-white/5 rounded-xl p-2 sm:p-2.5 overflow-hidden animate-pulse">
                <div className="w-full aspect-[16/9] bg-white/5 rounded-lg" />
                <div className="p-2 sm:p-2.5 flex flex-col gap-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 w-14 bg-white/10 rounded" />
                    <div className="h-6 w-14 bg-white/10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bundleGamesData.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative z-10" id="bundles">
      <div className="container mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h2 className="text-xl sm:text-3xl font-heading font-black tracking-tight">Bundles</h2>
            <span className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1 shadow-[0_0_12px_rgba(220,248,54,0.15)]">
              <Layers size={11} className="text-primary animate-pulse" />
              <span>Special Pack</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Left/Right Scroll Arrows */}
            {bundleGamesData.length > 2 && (
              <div className="flex sm:hidden items-center gap-1.5">
                <button
                  onClick={() => scroll('left')}
                  className="p-1.5 rounded-lg bg-cards/80 border border-white/10 text-white/80 hover:text-primary active:scale-95 transition-all shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-1.5 rounded-lg bg-cards/80 border border-white/10 text-white/80 hover:text-primary active:scale-95 transition-all shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <Link 
              to="/bundles" 
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-white transition-colors group cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 2-Cards Side-by-Side in One Line with Horizontal Scroll on Mobile */}
        <div
          ref={scrollContainerRef}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 sm:pb-0 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {bundleGamesData.map((bundle) => {
            const hasSavings = bundle.steamPrice != null && bundle.steamPrice > bundle.price && bundle.price > 0;
            const savingsPercent = hasSavings ? Math.round(((bundle.steamPrice! - bundle.price) / bundle.steamPrice!) * 100) : 0;
            const inCart = isInCart(bundle.id);
            const owned = isOwned(bundle.id);

            return (
              <div
                key={bundle.id}
                className="w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-auto sm:min-w-0 sm:max-w-none flex-shrink-0 snap-start group flex flex-col bg-cards/50 hover:bg-cards/80 border border-white/10 hover:border-primary/40 rounded-xl p-2 sm:p-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,248,54,0.15)] hover:-translate-y-1 relative"
              >
                {/* Landscape Image Banner (16:9) */}
                <Link to={`/game/${bundle.slug || bundle.id}`} className="block relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-black/40">
                  <img
                    src={getImageUrl(bundle.coverImage) || '/images/hero-artwork.png'}
                    alt={bundle.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                  {/* Top Left: Bundle Badge */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 bg-black/85 backdrop-blur-md border border-primary/40 text-primary text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 rounded shadow-md uppercase tracking-wider">
                    <Layers size={10} className="text-primary" />
                    <span>Bundle</span>
                  </div>

                  {/* Top Right: Savings / Status Badge */}
                  {bundle.outOfStock ? (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500/90 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 rounded uppercase tracking-wider shadow-md">
                      Out of Stock
                    </div>
                  ) : owned ? (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 rounded shadow-md flex items-center gap-1">
                      <Check size={10} />
                      <span>In Library</span>
                    </div>
                  ) : hasSavings && isFinite(savingsPercent) ? (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-primary/20 text-primary border border-primary/30 backdrop-blur-md text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 rounded shadow-[0_0_10px_rgba(220,248,54,0.2)] whitespace-nowrap">
                      SAVE {savingsPercent}%
                    </div>
                  ) : null}
                </Link>

                {/* Card Body */}
                <div className="p-1.5 sm:p-2.5 flex flex-col justify-between flex-1 gap-1.5 sm:gap-2.5">
                  <div>
                    <Link to={`/game/${bundle.slug || bundle.id}`}>
                      <h3 className="font-heading font-bold text-xs sm:text-base text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                        {bundle.title}
                      </h3>
                    </Link>

                    {/* Bundled Games Preview Subtitle */}
                    {bundle.bundleGames ? (
                      <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-text-secondary line-clamp-1">
                        <Gamepad2 size={11} className="text-primary flex-shrink-0" />
                        <span className="truncate">{bundle.bundleGames}</span>
                      </div>
                    ) : (
                      <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-text-secondary line-clamp-1">
                        {bundle.developer || bundle.genre}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Action Row */}
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/5 gap-1.5">
                    <div className="flex flex-col min-w-0">
                      {hasSavings && bundle.steamPrice && (
                        <span className="text-[9px] sm:text-[10px] text-text-secondary/70 line-through leading-none mb-0.5">
                          {formatPrice(bundle.steamPrice)}
                        </span>
                      )}
                      <span className="text-xs sm:text-lg font-heading font-black text-primary leading-none truncate">
                        {formatPrice(bundle.price)}
                      </span>
                    </div>

                    {owned ? (
                      <Link
                        to="/library"
                        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[10px] sm:text-[11px] transition-all text-center whitespace-nowrap shrink-0"
                      >
                        In Library
                      </Link>
                    ) : bundle.outOfStock ? (
                      <button
                        disabled
                        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/5 text-text-secondary border border-white/5 rounded-lg font-bold text-[10px] sm:text-[11px] opacity-50 cursor-not-allowed whitespace-nowrap shrink-0"
                      >
                        Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(bundle.id)}
                        disabled={inCart}
                        className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                          inCart
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-primary text-black hover:bg-white border border-primary/40 shadow-[0_0_12px_rgba(220,248,54,0.25)] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check size={11} />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={11} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
