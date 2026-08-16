import { Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';

export const GiveawayGames = () => {
  const { games, loading } = useGames();
  
  if (loading) return null;

  // Use a specific slice of games (exactly 3) to make it distinct
  const giveawayGamesData = games.slice(3, 6).map((game, index) => {
    if (index === 0) return { ...game, coverImage: 'https://chromeunboxed.com/wp-content/uploads/2025/09/YouTubePremiumNewFeatures.webp' };
    if (index === 1) return { ...game, coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE5YuETdQLCPjw-c0ouX-aNjCHKe35kUk8Gn9Td_OC8f75hrHt20KTNRM&s=10' };
    if (index === 2) return { ...game, coverImage: 'https://static0.cbrimages.com/wordpress/wp-content/uploads/2025/10/steam-logo-with-steam-games-in-the-background.jpg?w=1600&h=900&fit=crop' };
    return game;
  });

  return (
    <section className="py-20 px-6 lg:px-12 relative z-10" id="giveaway">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold font-heading">Giveaway Items</h3>
          </div>
          <Link to="/store" className="flex items-center gap-2 text-sm font-bold text-[#00F0FF] hover:text-white transition-colors group">
            <span>Claim More</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="relative group">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giveawayGamesData.map((game) => (
              <Link to={`/game/${game.id}`} key={`giveaway-${game.id}`} className="group flex flex-col bg-cards/40 hover:bg-cards border border-white/5 hover:border-[#00F0FF]/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-cards">
                  <img src={game.coverImage || '/images/hero-artwork.png'} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Top Left Badge */}
                  <div className="absolute top-0 left-0 bg-[#00F0FF] text-black font-black text-xs px-3 py-1.5 uppercase tracking-wider rounded-br-lg z-10 shadow-md">
                    Free
                  </div>
                  
                  {/* Top Right Logo/Icon */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10 z-10 shadow-md">
                    <Gift size={18} className="text-white" />
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="font-heading font-bold text-xl text-white group-hover:text-[#00F0FF] transition-colors line-clamp-1">{game.title}</h4>
                  
                  <div className="mt-5 pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-xs text-text-secondary font-bold tracking-wide uppercase">valqore gaming</span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#00F0FF] transition-colors">
                      <span>Claim Now</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
