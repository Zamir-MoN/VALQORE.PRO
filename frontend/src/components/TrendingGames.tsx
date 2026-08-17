import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { GameCard } from './GameCard';

export const TrendingGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  
  if (loading) return null;

  const validGames = games.filter(g => !g.isGiveaway);
  const trendingGames = validGames.slice(0, 12);
  const dealsGames = validGames.slice(1, 3);
  const newGames = validGames.slice(2, 4);

  return (
    <section className="py-20 px-6 lg:px-12 relative z-10" id="trending">
      <div className="container mx-auto max-w-[1400px]">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Left Column: Trending Games */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold font-heading">Trending Now</h3>
              <Link to="/store" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors group">
                <span>View All</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-4">
                {trendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column: Sidebars */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Top Deals */}
            <div className="bg-cards/40 rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold font-heading mb-6">Top Deals</h3>
              <div className="space-y-6">
                {dealsGames.map(game => (
                  <Link to={`/game/${game.id}`} key={`deal-${game.id}`} className="flex gap-4 group cursor-pointer">
                    <img 
                      src={game.coverImage || '/images/hero-artwork.png'} 
                      alt={game.title} 
                      className="w-16 h-16 rounded-xl object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">{game.title}</h4>
                      <div className="flex flex-col">
                        <span className="text-xs text-text-secondary line-through">{formatPrice(game.price)}</span>
                        <span className="text-sm font-bold text-primary">{formatPrice(game.price * 0.5)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* New Arrivals */}
            <div className="bg-cards/40 rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold font-heading mb-6">New Arrivals</h3>
              <div className="space-y-6">
                {newGames.map(game => (
                  <Link to={`/game/${game.id}`} key={`new-${game.id}`} className="flex gap-4 group cursor-pointer">
                    <img 
                      src={game.coverImage || '/images/hero-artwork.png'} 
                      alt={game.title} 
                      className="w-16 h-16 rounded-xl object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">{game.title}</h4>
                      <div className="flex flex-col h-full justify-between">
                        <span className="text-sm font-bold text-white mt-1">{formatPrice(game.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
