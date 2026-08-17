
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

import { getImageUrl } from '../utils/image';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const { formatPrice } = useCurrency();




  return (
    <Link to={`/game/${game.id}`} className="group relative flex flex-col bg-background transition-all duration-500 cursor-pointer hover:-translate-y-2 block">
      {/* Cover Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
        <img 
          src={game.coverImage ? getImageUrl(game.coverImage) : '/images/hero-artwork.png'} 
          alt={game.title} 
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${game.outOfStock ? 'grayscale-[0.5] opacity-70' : ''}`}
        />
        
        {/* Gradient Overlay for bottom text legibility if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60"></div>
        
        {/* Top-right tags (optional, e.g. discount, out of stock) */}
        {game.outOfStock ? (
          <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm border border-red-500/50 text-white font-bold text-xs px-2 py-1 rounded shadow-lg z-20">
            OUT OF STOCK
          </div>
        ) : game.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded shadow-lg">
            -{game.discount}%
          </div>
        )}

        {/* Bottom Left Tag Image */}
        {game.tagImage && (
          <img 
            src={getImageUrl(game.tagImage)} 
            alt="Tag" 
            loading="lazy"
            className="absolute bottom-3 left-3 h-8 sm:h-9 object-contain drop-shadow-md z-10"
          />
        )}

      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow px-1">
        <h3 className="font-heading font-bold text-base sm:text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 text-white">
          {game.title}
        </h3>
        
        <div className="mt-auto flex items-end justify-between">
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-1 flex-1 pr-2">
            {game.genre}, {game.developer}
          </p>
          
          <div className="text-right whitespace-nowrap">
            {game.discount > 0 ? (
              <span className="text-primary font-bold text-sm sm:text-base">
                {formatPrice(game.price * (1 - game.discount / 100))}
              </span>
            ) : (
              <span className="text-primary font-bold text-sm sm:text-base">
                {formatPrice(game.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
