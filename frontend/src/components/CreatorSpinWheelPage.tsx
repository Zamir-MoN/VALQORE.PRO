import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { GiveawaySpinWheel } from './GiveawaySpinWheel';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

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

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen">
      {/* Background cyber ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-primary/10 rounded-[100%] blur-[140px] -z-10 pointer-events-none" />

      <div className="container mx-auto max-w-[1200px]">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 text-text-secondary hover:text-white transition-colors group px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wider uppercase text-xs">Back to Profile</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-black uppercase tracking-widest border border-primary/30">
            <Sparkles size={13} className="animate-pulse" /> Dedicated Creator Arena
          </div>
        </div>

        {/* Page Title Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-wide uppercase text-white flex items-center justify-center md:justify-start gap-4 mb-3">
            <span className="w-2.5 h-10 bg-primary rounded-full hidden md:block"></span>
            <Trophy className="text-primary" size={38} />
            <span>Giveaway Winner Selection</span>
          </h1>
          <p className="text-text-secondary font-medium text-sm md:text-base max-w-2xl ml-0 md:ml-6">
            Spin the official live wheel to draw verified giveaway winners from Instagram 4-digit code participants.
          </p>
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

