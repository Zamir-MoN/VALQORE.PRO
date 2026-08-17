import { ArrowRight, Star, Tag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { getImageUrl } from '../utils/image';

export const TrendingGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  
  if (loading) return null;

  const validGames = games.filter(g => !g.isGiveaway && !g.outOfStock);
  if (validGames.length === 0) return null;

  const featured = validGames[0];
  const bentoSmall = validGames.slice(1, 6); // Up to 5 more games

  return (
    <section className="py-24 px-6 lg:px-12 relative z-10" id="trending">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 shadow-lg backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]"></span>
              <span className="text-xs font-bold tracking-wider text-white uppercase">Hot Right Now</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Trending Games</h2>
          </div>
          <Link to="/store" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all group backdrop-blur-sm">
            <span>View All Catalog</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-primary" />
          </Link>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[300px]">
          
          {/* Main Featured Bento (Spans 8 cols, 2 rows on Desktop) */}
          {featured && (
            <Link 
              to={`/game/${featured.id}`}
              className="md:col-span-2 lg:col-span-8 lg:row-span-2 group relative rounded-[2rem] overflow-hidden border border-white/10 glass hover:border-primary/50 transition-all duration-500 block hover:shadow-[0_0_40px_rgba(var(--primary),0.2)]"
            >
              <img 
                src={getImageUrl(featured.coverImage)} 
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end z-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 rounded-lg bg-primary/20 text-primary font-black text-sm border border-primary/20 backdrop-blur-md uppercase tracking-widest shadow-lg">
                    #1 Trending
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 shadow-lg">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-white">4.9 / 5.0</span>
                  </div>
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight group-hover:text-primary transition-colors drop-shadow-lg">{featured.title}</h3>
                <p className="text-white/70 text-lg line-clamp-2 max-w-2xl mb-8 font-medium drop-shadow-md">{featured.description}</p>
                <div className="flex items-center gap-4">
                  <div className="px-8 py-4 rounded-xl bg-primary text-background font-black text-xl shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                    {formatPrice(featured.price)}
                  </div>
                  {/* Fake original price for visual flair */}
                  <div className="px-6 py-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 font-bold line-through text-lg">
                    {formatPrice(featured.price * 1.4)}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Side Bento Tiles (Span 4 cols, 1 row each on Desktop) */}
          <div className="md:col-span-2 lg:col-span-4 lg:row-span-2 flex flex-col gap-6">
            {bentoSmall.slice(0, 2).map((game, idx) => (
              <Link 
                key={game.id}
                to={`/game/${game.id}`}
                className="flex-1 group relative rounded-3xl overflow-hidden border border-white/10 glass hover:border-white/30 transition-all duration-500 block min-h-[300px] hover:-translate-y-1 hover:shadow-2xl"
              >
                <img 
                  src={getImageUrl(game.coverImage)} 
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <h4 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors drop-shadow-md">{game.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-xl bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/5">{formatPrice(game.price)}</span>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs font-bold uppercase tracking-wider bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      {idx === 0 ? <Tag size={12} className="text-primary" /> : <Clock size={12} className="text-[#00F0FF]" />}
                      <span>{idx === 0 ? 'Top Deal' : 'Just Added'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Row Bento Tiles (Span 4 cols each on Desktop) */}
          {bentoSmall.slice(2, 5).map((game) => (
            <Link 
              key={game.id}
              to={`/game/${game.id}`}
              className="lg:col-span-4 group relative rounded-3xl overflow-hidden border border-white/10 glass hover:border-white/30 transition-all duration-500 block min-h-[300px] hover:-translate-y-1 hover:shadow-2xl"
            >
              <img 
                src={getImageUrl(game.coverImage)} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                <h4 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors drop-shadow-md">{game.title}</h4>
                <span className="text-primary font-black text-xl bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md w-fit border border-white/5">{formatPrice(game.price)}</span>
              </div>
            </Link>
          ))}
          
        </div>
      </div>
    </section>
  );
};
