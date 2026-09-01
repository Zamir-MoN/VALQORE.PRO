import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { GameCard } from './GameCard';

export const TrendingGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  
  if (loading) {
    return (
      <section className="py-20 px-6 lg:px-12 relative z-10" id="trending">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-heading">Trending Now</h3>
                <div className="w-20 h-6 bg-white/5 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-4 animate-pulse">
                    <div className="w-full aspect-[3/4] bg-white/5 rounded-2xl"></div>
                    <div className="flex flex-col gap-2">
                      <div className="h-5 bg-white/10 rounded-md w-3/4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
              {[...Array(2)].map((_, sectionIdx) => (
                <div key={sectionIdx} className="bg-cards/40 rounded-2xl p-6 border border-white/5 animate-pulse">
                  <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
                  <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0"></div>
                        <div className="flex flex-col justify-center gap-2 w-full">
                          <div className="h-4 bg-white/10 rounded w-full"></div>
                          <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const validGames = games.filter(g => !g.isGiveaway);
  const trendingGames = validGames.slice(0, 12);
  const dealsGames = validGames
    .filter(g => (g.discount || 0) > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 3);
  const newGames = [...validGames]
    .sort((a, b) => new Date(b.createdAt || b.releaseDate).getTime() - new Date(a.createdAt || a.releaseDate).getTime())
    .slice(0, 3);

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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-4">
                {trendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {/* View All Games Bottom Action */}
              <div className="mt-10 flex justify-center">
                <Link 
                  to="/store" 
                  className="group inline-flex items-center gap-3 bg-cards/60 hover:bg-primary border border-white/10 hover:border-primary text-white hover:text-black font-heading font-black text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(220,248,54,0.4)] uppercase tracking-wider hover:scale-105 active:scale-95"
                >
                  <span>View All Games</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Column: Sidebars */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Top Deals */}
            {dealsGames.length > 0 && (
              <div className="bg-cards/40 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold font-heading mb-6 flex items-center justify-between">
                  <span>Top Deals</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">Sale</span>
                </h3>
                <div className="space-y-6">
                  {dealsGames.map(game => {
                    const discountedPrice = game.price * (1 - (game.discount || 0) / 100);
                    return (
                      <Link to={`/game/${game.id}`} key={`deal-${game.id}`} className="flex gap-4 group cursor-pointer">
                        <img 
                          src={game.coverImage || '/images/hero-artwork.png'} 
                          alt={game.title} 
                          loading="lazy"
                          className="w-16 h-16 rounded-xl object-cover group-hover:opacity-80 transition-opacity flex-shrink-0"
                        />
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{game.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-secondary line-through">{formatPrice(game.price)}</span>
                            <span className="text-sm font-bold text-primary">{formatPrice(discountedPrice)}</span>
                            <span className="text-[10px] font-black text-black bg-primary px-1.5 py-0.5 rounded">
                              -{game.discount}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}


            {/* New Arrivals */}
            <div className="bg-cards/40 rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold font-heading mb-6">New Arrivals</h3>
              <div className="space-y-6">
                {newGames.map(game => (
                  <Link to={`/game/${game.id}`} key={`new-${game.id}`} className="flex gap-4 group cursor-pointer">
                    <img 
                      src={game.coverImage || '/images/hero-artwork.png'} 
                      alt={game.title} 
                      loading="lazy"
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
