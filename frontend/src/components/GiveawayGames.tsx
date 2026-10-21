import { Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { parseGiveawayRules } from '../utils/giveaway';
import { getImageUrl } from '../utils/image';

export const GiveawayGames = () => {
  const { games, loading } = useGames();
  
  // Filter items that are marked as giveaways
  const giveawayGamesData = games.filter(game => game.isGiveaway);

  if (loading) {
    return (
      <section className="py-20 px-6 lg:px-12 relative z-10" id="giveaway">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold font-heading">Giveaway Items</h3>
            </div>
            <div className="w-24 h-6 bg-white/5 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col bg-cards/40 border border-white/5 rounded-xl overflow-hidden animate-pulse">
                <div className="w-full aspect-video bg-white/5"></div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div>
                    <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-white/5 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-10 w-full bg-white/10 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (giveawayGamesData.length === 0) return null;

  return (
    <section className="py-20 px-6 lg:px-12 relative z-10" id="giveaway">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Gift className="text-[#00F0FF]" size={24} />
              <span>Exclusive Giveaways</span>
            </h3>
          </div>
          <Link to="/store" className="flex items-center gap-2 text-sm font-bold text-[#00F0FF] hover:text-white transition-colors group">
            <span>Explore All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="relative group">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {giveawayGamesData.map((game) => {
              const config = parseGiveawayRules(game.giveawayRules);
              const category = config.category || game.genre || 'Subscription';

              return (
                <Link 
                  to={`/giveaway/${game.slug || game.id}`}
                  key={`giveaway-${game.id}`} 
                  className="group flex flex-col text-left bg-cards/40 hover:bg-cards border border-white/5 hover:border-[#00F0FF]/50 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg w-full hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
                >
                  <div className="relative aspect-video overflow-hidden bg-cards w-full">
                    <img 
                      src={getImageUrl(game.coverImage) || '/images/hero-artwork.png'} 
                      alt={game.title} 
                      loading="lazy" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    
                    {/* Top Left Category Badge */}
                    <div className="absolute top-0 left-0 bg-[#00F0FF] text-black font-black text-xs px-3 py-1.5 uppercase tracking-wider rounded-br-lg z-10 shadow-md flex items-center gap-1">
                      <Sparkles size={11} /> {category}
                    </div>
                    
                    {/* Top Right Gift Icon */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur p-2 rounded-xl border border-white/10 z-10 shadow-md">
                      <Gift size={18} className="text-[#00F0FF]" />
                    </div>

                    {/* Free Entry Ribbon Overlay */}
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      100% Free Entry
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow w-full justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-xl text-white group-hover:text-[#00F0FF] transition-colors line-clamp-1">{game.title}</h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {game.description || config.rules || 'Complete quick social verification to participate in this exclusive giveaway.'}
                      </p>
                    </div>
                    
                    <div className="mt-5 pt-4 flex items-center justify-between border-t border-white/5 w-full">
                      <span className="text-xs text-emerald-400 font-black tracking-wide uppercase">Free to Enter</span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#00F0FF] transition-colors group-hover:translate-x-1">
                        <span>Enter Giveaway</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
