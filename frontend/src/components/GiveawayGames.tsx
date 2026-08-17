import { useState, useEffect } from 'react';
import { Gift, ArrowRight, X, Clock, Flame } from 'lucide-react';
import { useGames } from '../context/GameContext';
import type { Game } from '../types';
import { getImageUrl } from '../utils/image';

export const GiveawayGames = () => {
  const { games, loading } = useGames();
  const [selectedGiveaway, setSelectedGiveaway] = useState<Game | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });
  
  const giveawayGamesData = games.filter(game => game.isGiveaway && !game.outOfStock);

  useEffect(() => {
    // Fake countdown timer for visual flair
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedGiveaway) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedGiveaway]);

  if (loading || giveawayGamesData.length === 0) return null;

  return (
    <section className="py-24 px-6 lg:px-12 relative z-10 overflow-hidden" id="giveaway">
      {/* Dark Neon Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] bg-[#00F0FF]/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto max-w-[1400px] relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-sm">
              <Flame size={14} className="text-[#00F0FF] animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#00F0FF] uppercase">Active Drops</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Exclusive Giveaways</h2>
          </div>
          
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-md shadow-lg">
            <Clock size={18} className="text-[#00F0FF]" />
            <div className="flex gap-2 text-white font-black text-lg font-mono">
              <span className="bg-white/5 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
              <span className="bg-white/5 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
              <span className="bg-white/5 px-2 py-1 rounded text-[#00F0FF]">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
        
        {/* High Stakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giveawayGamesData.map((game) => (
            <button 
              key={`giveaway-${game.id}`} 
              onClick={() => setSelectedGiveaway(game)}
              className="group text-left bg-black/40 border border-white/10 hover:border-[#00F0FF] rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:-translate-y-2 relative"
            >
              {/* Neon Glow Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#00F0FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative aspect-video overflow-hidden bg-black/60 w-full border-b border-white/5 group-hover:border-[#00F0FF]/50 transition-colors">
                <img src={getImageUrl(game.coverImage)} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                
                {/* Top Left Badge */}
                <div className="absolute top-4 left-4 bg-[#00F0FF] text-black font-black text-xs px-4 py-1.5 uppercase tracking-wider rounded shadow-[0_0_15px_rgba(0,240,255,0.8)] z-10">
                  100% Free
                </div>
                
                {/* Center Pulse Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 scale-50 group-hover:scale-100 bg-black/20 backdrop-blur-sm">
                  <div className="bg-[#00F0FF] p-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.8)]">
                    <Gift size={28} className="text-black" />
                  </div>
                </div>
              </div>
              
              <div className="p-6 relative z-10 bg-gradient-to-b from-transparent to-black/80">
                <h4 className="font-bold text-2xl text-white group-hover:text-[#00F0FF] transition-colors line-clamp-1 mb-2 drop-shadow-md">{game.title}</h4>
                <p className="text-text-secondary text-sm line-clamp-2 mb-6">{game.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 font-bold tracking-wide uppercase bg-white/5 px-2 py-1 rounded">valqore gaming</span>
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#00F0FF] bg-[#00F0FF]/10 px-4 py-2 rounded-lg border border-[#00F0FF]/30 group-hover:bg-[#00F0FF] group-hover:text-black transition-all">
                    <span>Enter Draw</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Participation Modal */}
      {selectedGiveaway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-black border-2 border-[#00F0FF] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_80px_rgba(0,240,255,0.3)]">
            <button 
              onClick={() => setSelectedGiveaway(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-lg hover:bg-white/10"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                <img src={getImageUrl(selectedGiveaway.coverImage)} alt={selectedGiveaway.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[#00F0FF] text-xs font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                  <Gift size={14} /> Giveaway Event
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
                  {selectedGiveaway.title}
                </h2>
              </div>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-[#00F0FF]/50 via-white/10 to-transparent mb-8"></div>
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Flame size={20} className="text-[#00F0FF]" /> How to Participate
            </h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-text-secondary leading-relaxed whitespace-pre-wrap text-lg font-medium">
              {selectedGiveaway.giveawayRules || "To participate, you must have an active Valqore account and click 'Enter Draw' below. Winners will be notified via email."}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedGiveaway(null)}
                className="bg-[#00F0FF] hover:bg-white text-black font-black uppercase tracking-widest px-10 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:scale-105"
              >
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
