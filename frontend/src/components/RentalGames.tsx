import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { getImageUrl } from '../utils/image';

export const RentalGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  
  if (loading) return null;

  const validGames = games.filter(game => game.isRentable && !game.isGiveaway && !game.outOfStock);
  if (validGames.length === 0) return null;

  const featured = validGames[0];
  const others = validGames.slice(1, 4);

  return (
    <section className="py-24 px-6 lg:px-12 relative z-10" id="rental">
      <div className="container mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 shadow-lg backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              <span className="text-xs font-bold tracking-wider text-white uppercase">Premium Rentals</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Play More, Pay Less</h2>
          </div>
          <Link to="/store" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all group backdrop-blur-sm">
            <span>View All Rentals</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-blue-500" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[280px] md:auto-rows-[300px]">
          
          {/* Main Rental Feature (Spans 8 cols) */}
          {featured && (
            <div className="lg:col-span-8 lg:row-span-2 group relative rounded-[2rem] overflow-hidden border border-white/10 glass hover:border-blue-500/50 transition-all duration-500 flex flex-col md:flex-row bg-gradient-to-br from-white/[0.02] to-transparent hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              
              <div className="md:w-1/2 h-64 md:h-full relative overflow-hidden shrink-0">
                <img 
                  src={getImageUrl(featured.coverImage)} 
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/80 md:to-black"></div>
              </div>

              <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center relative z-10 md:-ml-8 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 to-transparent md:from-transparent md:via-black/20 md:to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-black text-sm border border-blue-500/30 backdrop-blur-md uppercase tracking-widest shadow-lg">
                    Top Rental
                  </span>
                </div>
                <h3 className="text-3xl lg:text-5xl font-black text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors drop-shadow-lg">{featured.title}</h3>
                <p className="text-white/70 text-base md:text-lg line-clamp-2 max-w-md mb-8 font-medium drop-shadow-md">{featured.description}</p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-colors cursor-pointer flex items-center gap-3 w-fit">
                    <Clock size={20} />
                    Rent for {formatPrice(featured.price * 0.15)}
                  </div>
                  <Link to={`/game/${featured.id}`} className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold transition-colors w-fit text-center">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Right Column / Side Tiles (Span 4 cols) */}
          <div className="lg:col-span-4 lg:row-span-2 flex flex-col gap-6">
            
            {/* Info Bento Tile */}
            <div className="flex-1 rounded-[2rem] p-8 border border-white/10 glass bg-gradient-to-br from-blue-900/20 to-transparent flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl min-h-[250px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
              <ShieldCheck className="w-12 h-12 text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <h4 className="text-2xl font-bold text-white mb-3">Instant Access</h4>
              <p className="text-text-secondary leading-relaxed">Rent games securely and play immediately. Your save data syncs perfectly directly with our secure cloud servers.</p>
            </div>

            {/* Small Game Tile */}
            {others[0] && (
              <Link 
                to={`/game/${others[0].id}`}
                className="flex-1 group relative rounded-[2rem] overflow-hidden border border-white/10 glass hover:border-blue-500/50 transition-all duration-500 block hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] min-h-[250px]"
              >
                <img 
                  src={getImageUrl(others[0].coverImage)} 
                  alt={others[0].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <h4 className="text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{others[0].title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-black text-lg bg-blue-600 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      Rent {formatPrice(others[0].price * 0.15)}
                    </span>
                  </div>
                </div>
              </Link>
            )}

          </div>

          {/* Bottom Row */}
          {others.slice(1, 4).map(game => (
            <Link 
              key={game.id}
              to={`/game/${game.id}`}
              className="lg:col-span-6 group relative rounded-[2rem] overflow-hidden border border-white/10 glass hover:border-blue-500/50 transition-all duration-500 flex h-[200px] hover:-translate-y-1 hover:shadow-2xl bg-white/[0.02]"
            >
              <div className="w-2/5 h-full relative shrink-0">
                <img 
                  src={getImageUrl(game.coverImage)} 
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/90"></div>
              </div>
              <div className="w-3/5 p-6 lg:p-8 flex flex-col justify-center relative z-10 bg-gradient-to-l from-background/50 to-transparent">
                <h4 className="text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{game.title}</h4>
                <p className="text-text-secondary text-sm line-clamp-1 mb-4">{game.genre}</p>
                <span className="text-white font-bold text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg w-fit">
                  {formatPrice(game.price * 0.15)} / day
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
