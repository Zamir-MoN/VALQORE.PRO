
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/image';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const { formatPrice } = useCurrency();
  const { isOwned } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const owned = isOwned(game.id);

  return (
    <Link 
      to={`/game/${game.slug || game.id}`} 
      className="group relative flex flex-col bg-cards/50 hover:bg-cards/80 border border-white/5 hover:border-primary/40 rounded-2xl p-2.5 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 shadow-lg backdrop-blur-md block transform-gpu will-change-transform"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-3 bg-black/40">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer rounded-xl z-0"></div>
        )}

        <img 
          src={game.coverImage ? getImageUrl(game.coverImage) : '/images/hero-artwork.png'} 
          alt={game.title} 
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${game.outOfStock ? 'grayscale-[0.5] opacity-70' : ''}`}
        />
        
        {/* Gradient Overlay for bottom text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        
        {/* Top-right tags (in library, discount, out of stock) */}
        {owned ? (
          <div className="absolute top-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/50 text-black font-black text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20">
            IN LIBRARY
          </div>
        ) : game.outOfStock ? (
          <div className="absolute top-2.5 right-2.5 bg-red-600/90 backdrop-blur-sm border border-red-500/50 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md shadow-lg z-20">
            OUT OF STOCK
          </div>
        ) : null}

        {/* Bottom Left Tag Image */}
        {game.tagImage && (
          <img 
            src={getImageUrl(game.tagImage)} 
            alt="Tag" 
            loading="lazy"
            decoding="async"
            className="absolute bottom-2.5 left-2.5 h-7 sm:h-8 object-contain drop-shadow-md z-10"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow px-1 mt-1">
        <h3 className="font-heading font-bold text-sm sm:text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 text-white">
          {game.title}
        </h3>
        
        <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-1 mb-1.5">
          {game.genre}, {game.developer}
        </p>
        
        <div className="mt-auto flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {(() => {
            const finalPrice = game.price;
            const hasSteamSavings = game.steamPrice != null && game.steamPrice > finalPrice && finalPrice > 0;
            const savingsPercent = hasSteamSavings ? Math.round(((game.steamPrice! - finalPrice) / game.steamPrice!) * 100) : 0;
            
            return (
              <>
                <span className="text-primary font-black text-sm sm:text-base leading-none">
                  {formatPrice(finalPrice)}
                </span>
                
                {hasSteamSavings && isFinite(savingsPercent) && (
                  <>
                    <span className="text-[11px] sm:text-xs text-text-secondary/80 line-through leading-none">
                      {formatPrice(game.steamPrice!)}
                    </span>
                    <span className="bg-primary/20 text-primary text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap leading-none">
                      SAVE {savingsPercent}%
                    </span>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </Link>
  );
};

