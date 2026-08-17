import { useState } from 'react';
import { Gift, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import type { Game } from '../types';

export const GiveawayGames = () => {
  const { games, loading } = useGames();
  const [selectedGiveaway, setSelectedGiveaway] = useState<Game | null>(null);
  
  // Filter games that are marked as giveaways
  const giveawayGamesData = games.filter(game => game.isGiveaway);

  if (loading || giveawayGamesData.length === 0) return null;

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
              <button 
                key={`giveaway-${game.id}`} 
                onClick={() => setSelectedGiveaway(game)}
                className="group flex flex-col text-left bg-cards/40 hover:bg-cards border border-white/5 hover:border-[#00F0FF]/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg w-full"
              >
                <div className="relative aspect-video overflow-hidden bg-cards w-full">
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
                
                <div className="p-5 flex flex-col flex-grow w-full">
                  <h4 className="font-heading font-bold text-xl text-white group-hover:text-[#00F0FF] transition-colors line-clamp-1">{game.title}</h4>
                  
                  <div className="mt-5 pt-4 flex items-center justify-between border-t border-white/5 w-full">
                    <span className="text-xs text-text-secondary font-bold tracking-wide uppercase">valqore gaming</span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#00F0FF] transition-colors">
                      <span>Claim Now</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Participation Modal */}
      {selectedGiveaway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cards border border-[#00F0FF]/30 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,240,255,0.15)]">
            <button 
              onClick={() => setSelectedGiveaway(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img src={selectedGiveaway.coverImage} alt={selectedGiveaway.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[#00F0FF] text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-2">
                  <Gift size={12} /> Giveaway Event
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
                  {selectedGiveaway.title}
                </h2>
              </div>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-[#00F0FF]/50 via-white/10 to-transparent mb-6"></div>
            
            <h3 className="text-lg font-bold text-white mb-4">How to Participate</h3>
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 text-text-secondary leading-relaxed whitespace-pre-wrap">
              {selectedGiveaway.giveawayRules || "No specific rules have been provided for this giveaway. Please check back later!"}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedGiveaway(null)}
                className="bg-[#00F0FF] text-black font-black uppercase tracking-wide px-8 py-3 rounded-lg hover:bg-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
