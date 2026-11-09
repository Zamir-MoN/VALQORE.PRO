import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { GiveawaySpinWheel } from './GiveawaySpinWheel';
import { getImageUrl } from '../utils/image';
import axios from 'axios';
import type { Game } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

// Miniature crisp game card for ambient background horizontal strips
const BackgroundGameStripCard: React.FC<{ game: Game }> = React.memo(({ game }) => {
  return (
    <div className="flex-shrink-0 w-36 sm:w-40 md:w-48 bg-[#16161D] border-2 border-white/20 hover:border-primary/50 rounded-2xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] select-none pointer-events-none transition-all">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black mb-2.5 shadow-inner">
        <img
          src={game.coverImage ? getImageUrl(game.coverImage) : '/images/hero-artwork.png'}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {game.tagImage && (
          <img
            src={getImageUrl(game.tagImage)}
            alt="Tag"
            className="absolute bottom-2 left-2 h-5 sm:h-6 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          />
        )}
      </div>
      <div className="px-1">
        <h5 className="font-heading font-black text-xs sm:text-sm text-white truncate leading-snug tracking-wide">
          {game.title}
        </h5>
        <div className="flex items-center justify-between mt-1 text-xs font-mono font-bold">
          <span className="text-primary font-black">₹{game.price}</span>
          {game.steamPrice && game.steamPrice > game.price && (
            <span className="text-white/50 line-through text-[11px]">₹{game.steamPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export const CreatorSpinWheelPage: React.FC = () => {
  const { user, token, loading: authLoading, openAuthModal } = useAuth();
  const { games } = useGames();
  const navigate = useNavigate();

  const [creatorStatus, setCreatorStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
      navigate('/profile');
    }
  }, [user, authLoading, navigate, openAuthModal]);

  useEffect(() => {
    if (user && token) {
      checkCreatorPermission();
    }
  }, [user, token]);

  const checkCreatorPermission = async () => {
    try {
      const res = await axios.get(`${API_URL}/creators/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatorStatus(res.data.status);
    } catch (err) {
      setCreatorStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Prepare game items for the two horizontal looping background strips
  const { stripRow1, stripRow2 } = useMemo(() => {
    const validGames = (games || []).filter(g => g && (g.title || g.coverImage));
    if (validGames.length === 0) return { stripRow1: [], stripRow2: [] };

    // Duplicate list so seamless loop has sufficient width
    const targetLength = Math.max(16, validGames.length * 2);
    const repeated: Game[] = [];
    while (repeated.length < targetLength) {
      repeated.push(...validGames);
    }

    const mid = Math.floor(repeated.length / 2);
    const r1 = repeated.slice(0, mid);
    const r2 = repeated.slice(mid);

    return {
      stripRow1: [...r1, ...r1], // 2x duplication for 100% seamless marquee
      stripRow2: [...r2, ...r2]
    };
  }, [games]);

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen overflow-hidden">
      {/* Background cyber ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-primary/10 rounded-[100%] blur-[140px] -z-10 pointer-events-none" />

      {/* 2 Horizontal looping background strips in the middle */}
      {stripRow1.length > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 -z-10 pointer-events-none flex flex-col gap-8 opacity-85 overflow-hidden select-none">
          {/* Top horizontal strip: Moves Right to Left */}
          <div className="w-full overflow-hidden flex">
            <div className="animate-marquee-left flex gap-5">
              {stripRow1.map((game, i) => (
                <BackgroundGameStripCard key={`strip-top-${game.id || i}-${i}`} game={game} />
              ))}
            </div>
          </div>

          {/* Bottom horizontal strip: Moves Left to Right */}
          <div className="w-full overflow-hidden flex">
            <div className="animate-marquee-right flex gap-5">
              {stripRow2.map((game, i) => (
                <BackgroundGameStripCard key={`strip-bottom-${game.id || i}-${i}`} game={game} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-[1200px]">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 text-text-secondary hover:text-white transition-colors group px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wider uppercase text-xs">Back to Profile</span>
          </button>
        </div>

        {/* Permission Guard */}
        {checkingStatus ? (
          <div className="py-24 flex flex-col items-center justify-center text-text-secondary">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            <span className="text-sm font-bold uppercase tracking-wider">Verifying Creator Status...</span>
          </div>
        ) : creatorStatus !== 'APPROVED' ? (
          <div className="bg-cards/40 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto backdrop-blur-xl">
            <AlertCircle size={44} className="text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Creator Approval Required</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              The Giveaway Spin Wheel is exclusively reserved for approved Valqore Creator partners. Once your application is reviewed and approved, this arena unlocks automatically!
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-3.5 bg-primary text-black font-black uppercase tracking-wider text-xs rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(220,248,54,0.3)] cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Live Spin Wheel Component */
          <GiveawaySpinWheel
            token={token}
            apiUrl={API_URL}
            games={games as any}
          />
        )}
      </div>
    </div>
  );
};

export default CreatorSpinWheelPage;

