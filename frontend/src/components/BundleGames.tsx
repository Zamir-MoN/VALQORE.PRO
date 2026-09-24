import { Layers, ArrowRight, ShoppingCart, Check, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/image';

export const BundleGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  const { addToCart, isInCart, isOwned } = useCart();

  // Filter games marked as bundles
  const bundleGamesData = games.filter(game => game.isBundle && !game.isGiveaway);

  if (loading) {
    return (
      <section className="py-16 px-6 lg:px-12 relative z-10" id="bundles">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-primary/10 rounded-full animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col bg-cards/40 border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full aspect-[16/9] bg-white/5" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-6 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/5 rounded" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-6 w-24 bg-white/10 rounded" />
                    <div className="h-9 w-28 bg-white/10 rounded-xl" />
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
    <section className="py-16 px-6 lg:px-12 relative z-10" id="bundles">
      <div className="container mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-heading font-black tracking-tight">Bundles</h2>
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5 shadow-[0_0_12px_rgba(220,248,54,0.15)]">
              <Layers size={13} className="text-primary animate-pulse" />
              <span>Special Pack</span>
            </span>
          </div>
          <Link 
            to="/store" 
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Landscape Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bundleGamesData.map((bundle) => {
            const hasSavings = bundle.steamPrice != null && bundle.steamPrice > bundle.price && bundle.price > 0;
            const savingsPercent = hasSavings ? Math.round(((bundle.steamPrice! - bundle.price) / bundle.steamPrice!) * 100) : 0;
            const inCart = isInCart(bundle.id);
            const owned = isOwned(bundle.id);

            return (
              <div
                key={bundle.id}
                className="group flex flex-col bg-cards/50 hover:bg-cards/80 border border-white/10 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,248,54,0.15)] hover:-translate-y-1 relative"
              >
                {/* Landscape Image Banner (16:9) */}
                <Link to={`/game/${bundle.slug || bundle.id}`} className="block relative w-full aspect-[16/9] overflow-hidden bg-black/40">
                  <img
                    src={getImageUrl(bundle.coverImage) || '/images/hero-artwork.png'}
                    alt={bundle.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                  {/* Top Left: Bundle Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-primary/40 text-primary text-xs font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
                    <Layers size={13} className="text-primary" />
                    <span>Bundle</span>
                  </div>

                  {/* Top Right: Savings / Status Badge */}
                  {bundle.outOfStock ? (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                      Out of Stock
                    </div>
                  ) : owned ? (
                    <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Check size={13} />
                      <span>In Library</span>
                    </div>
                  ) : hasSavings && isFinite(savingsPercent) ? (
                    <div className="absolute top-3 right-3 bg-primary/20 text-primary border border-primary/30 backdrop-blur-md text-xs font-black px-2.5 py-1 rounded-lg shadow-[0_0_12px_rgba(220,248,54,0.2)] whitespace-nowrap">
                      SAVE {savingsPercent}%
                    </div>
                  ) : null}

                  {/* Bottom Platforms Overlay */}
                  {bundle.platforms && (
                    <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white/70 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                      {Array.isArray(bundle.platforms) ? bundle.platforms.join(', ') : bundle.platforms}
                    </div>
                  )}
                </Link>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                  <div>
                    <Link to={`/game/${bundle.slug || bundle.id}`}>
                      <h3 className="font-heading font-black text-lg sm:text-xl text-white group-hover:text-primary transition-colors line-clamp-1">
                        {bundle.title}
                      </h3>
                    </Link>

                    {/* Bundled Games Preview Subtitle */}
                    {bundle.bundleGames ? (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary line-clamp-1">
                        <Gamepad2 size={13} className="text-primary flex-shrink-0" />
                        <span className="truncate">{bundle.bundleGames}</span>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs text-text-secondary line-clamp-1">
                        {bundle.developer || bundle.genre}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Action Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3">
                    <div className="flex flex-col">
                      {hasSavings && bundle.steamPrice && (
                        <span className="text-xs text-text-secondary/70 line-through">
                          {formatPrice(bundle.steamPrice)}
                        </span>
                      )}
                      <span className="text-lg sm:text-xl font-heading font-black text-primary">
                        {formatPrice(bundle.price)}
                      </span>
                    </div>

                    {owned ? (
                      <Link
                        to="/library"
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs transition-all text-center"
                      >
                        In Library
                      </Link>
                    ) : bundle.outOfStock ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-white/5 text-text-secondary border border-white/5 rounded-xl font-bold text-xs opacity-50 cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(bundle.id)}
                        disabled={inCart}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                          inCart
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-primary text-black hover:bg-white border border-primary/40 shadow-[0_0_15px_rgba(220,248,54,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check size={14} />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            <span>Add to Cart</span>
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
