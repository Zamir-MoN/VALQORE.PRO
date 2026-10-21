import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Gift, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Clock, 
  Users, 
  Loader2, 
  Lock, 
  AlertCircle,
  Copy,
  Check,
  Send,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { useGames, useSocket } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { parseGiveawayRules, getInstagramDmUrl, getInstagramHandle, DEFAULT_INSTAGRAM_URL } from '../utils/giveaway';
import { getImageUrl } from '../utils/image';

export const GiveawayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { games, getImageUrl } = useGames();
  const socket = useSocket();
  const { user, token: authToken } = useAuth();
  const { formatPrice } = useCurrency();

  // Find game/giveaway from GameContext
  const game = games.find(g => (g.slug && g.slug === id) || g.id === id);

  // Giveaway status from API
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);
  const [approvedEntries, setApprovedEntries] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);

  // Copy code feedback state
  const [copiedCode, setCopiedCode] = useState(false);

  // Instagram Click-to-Verify state tracking (persisted in localStorage)
  const storageKey = `valqore_giveaway_${game?.id || id}_${user?.id || 'guest'}`;
  const [instagramVerified, setInstagramVerified] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_instagram`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Verifying countdown states
  const [verifyingInstagram, setVerifyingInstagram] = useState(false);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);

  // Countdown timer calculation
  const giveawayConfig = parseGiveawayRules(game?.giveawayRules);
  const instagramProfileUrl = giveawayConfig.tasks?.instagram?.url || DEFAULT_INSTAGRAM_URL;
  const instagramHandle = getInstagramHandle(instagramProfileUrl);
  const instagramDmUrl = getInstagramDmUrl(instagramProfileUrl);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isEnded: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false
  });

  // Fetch live giveaway entry status
  useEffect(() => {
    if (!game && !id) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const activeToken = authToken || localStorage.getItem('valqore_token') || localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }
        const targetId = game?.id || id;
        
        const res = await axios.get(`/api/giveaways/${targetId}/status`, { headers });
        if (isMounted && res.data) {
          setTotalEntries(res.data.totalEntries || 0);
          setApprovedEntries(res.data.approvedEntries || 0);
          setHasEntered(Boolean(res.data.hasEntered));
          setIsApproved(Boolean(res.data.isApproved));
          setUserEntry(res.data.userEntry);
          if (res.data.winner) {
            setWinner(res.data.winner);
          }
        }
      } catch (err) {
        console.warn('Could not fetch giveaway status from backend:', err);
      } finally {
        if (isMounted) setLoadingStatus(false);
      }
    };

    fetchStatus();

    // Listen for live socket updates
    const handleGiveawayUpdate = (data: any) => {
      if (data && (data.giveawayId === game?.id || data.giveawayId === id)) {
        if (data.totalEntries !== undefined) {
          setTotalEntries(data.totalEntries);
        }
        if (data.winner) {
          setWinner(data.winner);
        }
      }
    };

    const handleEntryApproved = (data: any) => {
      if (data && (data.giveawayId === game?.id || data.giveawayId === id)) {
        if (data.userId === user?.id || (userEntry?.code && data.code === userEntry.code)) {
          setIsApproved(true);
          setUserEntry((prev: any) => ({ ...prev, status: 'APPROVED' }));
          toast.success('🎉 Your Instagram follow was verified! Your giveaway entry is now APPROVED!', { duration: 6000 });
        }
        setApprovedEntries((prev) => prev + 1);
      }
    };

    const handleEntryRevoked = (data: any) => {
      if (data && (data.giveawayId === game?.id || data.giveawayId === id)) {
        if (data.userId === user?.id || (userEntry?.code && data.code === userEntry.code)) {
          setIsApproved(false);
          setUserEntry((prev: any) => ({ ...prev, status: 'PENDING' }));
          toast.error('Your entry approval was revoked. Must remain following on Instagram to qualify!', { duration: 6000 });
        }
        setApprovedEntries((prev) => Math.max(0, prev - 1));
      }
    };

    socket?.on('giveaway_updated', handleGiveawayUpdate);
    socket?.on('giveaway_entry_approved', handleEntryApproved);
    socket?.on('giveaway_entry_revoked', handleEntryRevoked);

    return () => {
      isMounted = false;
      socket?.off('giveaway_updated', handleGiveawayUpdate);
      socket?.off('giveaway_entry_approved', handleEntryApproved);
      socket?.off('giveaway_entry_revoked', handleEntryRevoked);
    };
  }, [game?.id, id, user?.id, userEntry?.code, socket]);

  // Sync winner from game model if present
  useEffect(() => {
    if (giveawayConfig.winner && !winner) {
      setWinner(giveawayConfig.winner);
    }
  }, [giveawayConfig.winner, winner]);

  // Countdown timer effect
  useEffect(() => {
    if (!giveawayConfig.endDate) return;

    const targetDate = new Date(giveawayConfig.endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0 || isNaN(targetDate)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [giveawayConfig.endDate]);

  // Handle Instagram Click-to-Verify
  const handleInstagramFollowClick = () => {
    window.open(instagramProfileUrl, '_blank', 'noopener,noreferrer');

    if (!instagramVerified) {
      setVerifyingInstagram(true);
      toast('Opening Instagram profile to follow...', { icon: '📸' });

      setTimeout(() => {
        setVerifyingInstagram(false);
        setInstagramVerified(true);
        try {
          localStorage.setItem(`${storageKey}_instagram`, 'true');
        } catch {}
        toast.success(`Follow step marked! Click 'Participate' to get your 4-digit code. ✅`);
      }, 3000);
    }
  };

  // Handle Participate button click -> generates 4-digit code and prompts Instagram DM
  const handleParticipate = async () => {
    if (!user) {
      toast.error('Please log in to participate in the giveaway!');
      const loginBtn = document.querySelector('[data-auth-trigger="login"]') as HTMLElement;
      if (loginBtn) {
        loginBtn.click();
      }
      return;
    }

    if (!instagramVerified) {
      toast.error(`Please click 'Follow @${instagramHandle}' on Instagram first!`);
      return;
    }

    // Open new tab synchronously within user click event so browser popup blocker does NOT block it
    const dmWindow = window.open('about:blank', '_blank');

    try {
      setIsSubmittingEntry(true);
      const activeToken = authToken || localStorage.getItem('valqore_token') || localStorage.getItem('token');
      const targetId = game?.id || id;

      const res = await axios.post(
        `/api/giveaways/${targetId}/enter`,
        {},
        { headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {} }
      );

      if (res.data.success) {
        const code = res.data.code;
        const entry = res.data.entry || { code, status: res.data.status || 'PENDING' };
        setHasEntered(true);
        setIsApproved(res.data.isApproved || entry.status === 'APPROVED');
        setUserEntry(entry);
        setTotalEntries(res.data.totalEntries || totalEntries + 1);

        // Auto-copy code to clipboard immediately
        try {
          await navigator.clipboard.writeText(code);
        } catch {}

        setShowDmModal(true);
        const dmUrlWithCode = getInstagramDmUrl(instagramProfileUrl, code);

        // Direct the opened window to Instagram DM
        if (dmWindow && !dmWindow.closed) {
          dmWindow.location.href = dmUrlWithCode;
        } else {
          // Fallback if popup blocker was on: redirect current window
          window.location.href = dmUrlWithCode;
        }

        toast.success(`Code ${code} copied! Press Ctrl+V (Paste) in Instagram DM to send.`, { duration: 7000 });
      } else {
        if (dmWindow) dmWindow.close();
      }
    } catch (err: any) {
      if (dmWindow) dmWindow.close();
      const errorMsg = err.response?.data?.error || 'Failed to enter giveaway. Please try again.';
      toast.error(errorMsg);
      if (errorMsg.includes('already')) {
        setHasEntered(true);
      }
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  // Copy 4-digit code to clipboard
  const handleCopyCode = (codeToCopy?: string) => {
    const code = codeToCopy || userEntry?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`Code ${code} copied! Paste (Ctrl+V) in Instagram DM. 📋`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Open Instagram DM
  const handleOpenInstagramDm = () => {
    if (userEntry?.code) {
      try {
        navigator.clipboard.writeText(userEntry.code);
        toast.success(`Code ${userEntry.code} copied! Press Ctrl+V in the chat.`);
      } catch {}
    }
    const dmUrl = getInstagramDmUrl(instagramProfileUrl, userEntry?.code);
    window.open(dmUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle share giveaway
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Win ${game?.title || 'Giveaway'} for Free on VALQORE!`;
    const shareText = `Enter the ${game?.title || 'Giveaway'} on VALQORE! Follow on Instagram & participate for free.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          toast.success('Giveaway link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Giveaway link copied to clipboard!');
    }
  };

  if (!game && !loadingStatus) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Gift className="w-16 h-16 text-[#00F0FF] mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Giveaway Not Found</h2>
        <p className="text-text-secondary max-w-md mb-6">
          This giveaway may have concluded or the link might be incorrect.
        </p>
        <Link 
          to="/store"
          className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-white transition-all shadow-[0_0_15px_rgba(220,248,54,0.3)]"
        >
          Explore Other Rewards
        </Link>
      </div>
    );
  }

  const categoryName = giveawayConfig.category || game?.genre || 'Subscription';
  const displayWorth = giveawayConfig.worth || game?.price || 0;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <div className="container mx-auto max-w-[1300px]">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00F0FF] hover:text-white transition-colors bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 px-4 py-2 rounded-lg border border-[#00F0FF]/30 cursor-pointer"
          >
            <Share2 size={14} /> Share Giveaway
          </button>
        </div>

        {/* Hero Banner Header */}
        <div className="glass p-6 sm:p-10 rounded-3xl border border-pink-500/20 bg-gradient-to-r from-cards/80 via-black/60 to-cards/80 shadow-[0_0_30px_rgba(236,72,153,0.08)] mb-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col gap-3 max-w-2xl">


              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight drop-shadow-md">
                {game?.title || 'Exclusive Giveaway'}
              </h1>

              {/* Worth & Entrants Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary font-medium pt-1">
                {displayWorth > 0 && (
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span className="text-text-secondary font-normal">Prize Value:</span>
                    <span className="text-primary font-black text-base">{formatPrice(displayWorth)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Users size={16} className="text-[#00F0FF]" />
                  <span>{approvedEntries > 0 ? `${approvedEntries} Approved / ${totalEntries} Total Entrants` : `${totalEntries} Entrants`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Trophy size={16} className="text-amber-400" />
                  <span>{giveawayConfig.winnersCount || 1} Winner{(giveawayConfig.winnersCount || 1) > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Live Countdown Box */}
            {giveawayConfig.endDate && (
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shrink-0 min-w-[280px] shadow-inner">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                  <Clock size={13} className="text-[#00F0FF]" /> 
                  {timeLeft.isEnded ? 'Giveaway Concluded' : 'Giveaway Closes In'}
                </span>
                
                {timeLeft.isEnded ? (
                  <div className="text-red-400 font-black text-lg uppercase tracking-wider">
                    Entries Closed
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center w-full">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                      <span className="block text-2xl font-black text-white font-heading">{String(timeLeft.days).padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Days</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                      <span className="block text-2xl font-black text-white font-heading">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Hours</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                      <span className="block text-2xl font-black text-white font-heading">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Mins</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                      <span className="block text-2xl font-black text-pink-400 font-heading">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Secs</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Left Column (Artwork & Details), Right Column (Instagram Task & Entry Portal) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cover & Rules */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Prize Cover Card */}
            <div className="glass rounded-3xl border border-white/10 overflow-hidden relative group aspect-video sm:aspect-[16/9] bg-cards">
              <img 
                src={getImageUrl(game?.coverImage) || '/images/hero-artwork.png'} 
                alt={game?.title || 'Giveaway'} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
              
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Gift size={16} className="text-[#00F0FF]" />
                <span className="text-xs font-black uppercase text-white tracking-wider">Official Valqore Drop</span>
              </div>
            </div>

            {/* Winner Announcement Spotlight (if drawn) */}
            {winner && (
              <div className="glass p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-0.5">
                    Official Winner Chosen
                  </div>
                  <h3 className="text-xl font-black text-white font-heading">
                    {winner.username || 'Lucky Winner'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Congratulations! The prize redemption details have been coordinated with the winner.
                  </p>
                </div>
              </div>
            )}

            {/* Description & Rules Card */}
            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-cards/40 flex flex-col gap-4">
              <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#00F0FF]" /> About This Giveaway & Prize
              </h3>
              
              <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {game?.description || giveawayConfig.rules || "Follow @valqore.pro on Instagram, click Participate to receive your unique 4-digit code, and send it to our Instagram DM. Once our team verifies your follow, your entry will be approved!"}
              </div>

              {/* Terms & Conditions Notice */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3 text-xs text-text-secondary">
                <AlertCircle size={16} className="text-[#00F0FF] shrink-0 mt-0.5" />
                <p>
                  Instagram Follow Policy: One entry per user account. You must be following @{instagramHandle} on Instagram when the draw occurs. Unfollowing prior to the draw disqualifies your entry.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Instagram Task & Entry Portal */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            <div className="glass p-6 sm:p-8 rounded-3xl border border-pink-500/30 bg-gradient-to-b from-cards/90 via-black/80 to-cards/90 shadow-[0_0_30px_rgba(236,72,153,0.08)] flex flex-col gap-6">
              
              {/* Task Header */}
              <div className="border-b border-white/10 pb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-pink-400 block mb-1">
                  Instagram Entry Verification
                </span>
                <h3 className="text-2xl font-black font-heading text-white">
                  How To Participate
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Follow <span className="text-white font-bold">@{instagramHandle}</span> on Instagram, then get your 4-digit code and DM us to get approved:
                </p>

                {/* Step indicator */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    instagramVerified 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white'
                  }`}>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
                    <span>Follow on IG</span>
                    {instagramVerified && <CheckCircle2 size={14} className="ml-auto" />}
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    isApproved 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : hasEntered 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-white/5 border-white/10 text-text-secondary'
                  }`}>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
                    <span>{isApproved ? 'Approved' : hasEntered ? 'DM Code' : 'Get Code'}</span>
                    {isApproved && <CheckCircle2 size={14} className="ml-auto" />}
                  </div>
                </div>
              </div>

              {/* Step 1: Follow on Instagram */}
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  instagramVerified 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-white/10 bg-white/[0.02] hover:border-pink-500/50'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
                        <FaInstagram size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          Follow @{instagramHandle}
                          {instagramVerified && <CheckCircle2 size={16} className="text-emerald-400" />}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          Must follow our official Instagram page to qualify
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstagramFollowClick}
                    disabled={verifyingInstagram}
                    className={`w-full mt-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      instagramVerified
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : verifyingInstagram
                        ? 'bg-pink-500/30 text-white border border-pink-500 cursor-wait'
                        : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-90 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                    }`}
                  >
                    {verifyingInstagram ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Verifying Follow...</span>
                      </>
                    ) : instagramVerified ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Followed & Ready For Code</span>
                      </>
                    ) : (
                      <>
                        <span>Follow @{instagramHandle}</span>
                        <ExternalLink size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 & Status Display */}
              <div className="pt-2">
                {/* 1. If Entry is already APPROVED */}
                {hasEntered && isApproved ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex flex-col gap-3 shadow-[0_0_20px_rgba(52,211,153,0.2)] text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white font-heading">
                        Entry Verified & Approved! 🎉
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        Admin verified your Instagram follow. You are officially in the random winner draw!
                      </p>
                    </div>

                    {userEntry?.code && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs text-text-secondary">Your Verified Code:</span>
                        <span className="font-mono font-black text-sm px-3 py-1 rounded-lg bg-black/60 border border-emerald-500/40 text-emerald-300 tracking-widest shadow-inner">
                          {userEntry.code}
                        </span>
                      </div>
                    )}
                  </div>
                ) : hasEntered && !isApproved ? (
                  /* 2. If Entry is PENDING (User has 4-digit code, waiting for Admin DM approval) */
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/15 via-black/60 to-black/80 border border-amber-500/40 flex flex-col gap-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <Clock size={20} className="animate-spin" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                          Step 2: DM Admin on Instagram
                        </span>
                        <h4 className="text-base font-black text-white font-heading">
                          Verification Code Generated
                        </h4>
                      </div>
                    </div>

                    {/* 4-Digit Code Box */}
                    <div className="bg-black/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                      <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                        Your 4-Digit Giveaway Code
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black font-mono tracking-[0.3em] text-[#00F0FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                          {userEntry?.code || '----'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(userEntry?.code)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                      </div>
                      <span className="text-[11px] text-text-secondary text-center">
                        Send this code to <span className="text-white font-bold">@{instagramHandle}</span> via Instagram DM
                      </span>
                    </div>

                    {/* Action Button: Open Instagram DM */}
                    <button
                      type="button"
                      onClick={handleOpenInstagramDm}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                    >
                      <Send size={15} />
                      <span>Send Code in Instagram DM</span>
                    </button>

                    <div className="flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-text-secondary leading-relaxed">
                      <ShieldAlert size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Admin will check if you followed <strong className="text-white">@{instagramHandle}</strong>, paste your code into the dashboard, and approve your entry. This screen will automatically update!
                      </span>
                    </div>
                  </div>
                ) : !user ? (
                  /* 3. Not Logged In State */
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const trigger = document.querySelector('[data-auth-trigger="login"]') as HTMLElement;
                        if (trigger) trigger.click();
                      }}
                      className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock size={16} /> Sign In to Participate
                    </button>
                    <p className="text-[11px] text-center text-text-secondary">
                      You need a free VALQORE account to generate your 4-digit code.
                    </p>
                  </div>
                ) : (
                  /* 4. Logged in, ready to click Participate */
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleParticipate}
                      disabled={!instagramVerified || isSubmittingEntry}
                      className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                        instagramVerified
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-[#00F0FF] hover:opacity-95 text-white shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-[1.02] active:scale-95'
                          : 'bg-white/5 text-white/40 border border-white/5 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isSubmittingEntry ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Generating 4-Digit Code...</span>
                        </>
                      ) : instagramVerified ? (
                        <>
                          <MessageCircle size={18} />
                          <span>Participate & Get 4-Digit Code</span>
                        </>
                      ) : (
                        <span>Follow on Instagram to Unlock</span>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-text-secondary">
                      {instagramVerified 
                        ? 'Click above to receive your 4-digit code and direct message our Instagram!' 
                        : `Click Step 1 above to follow @${instagramHandle} first.`}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* DM Modal Popup when User first enters */}
      {showDmModal && userEntry?.code && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-pink-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-[0_0_50px_rgba(236,72,153,0.3)] relative flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              <FaInstagram size={30} />
            </div>

            <span className="text-[11px] font-black uppercase tracking-widest text-pink-400 block mb-1">
              Giveaway Participation Code
            </span>
            <h3 className="text-2xl font-black font-heading text-white mb-2">
              Send Code to Instagram DM
            </h3>
            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
              We have opened Instagram DM in a new tab. Send this 4-digit code so admin can check your follow and approve your entry:
            </p>

            {/* Glowing 4-Digit Code Display */}
            <div className="bg-black/80 border border-pink-500/40 rounded-2xl p-4 w-full flex items-center justify-between gap-4 mb-3 shadow-inner">
              <span className="text-3xl font-black font-mono tracking-[0.35em] text-[#00F0FF] pl-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">
                {userEntry.code}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(userEntry.code)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/25 rounded-xl p-3 w-full mb-5 text-left flex items-start gap-2.5">
              <span className="text-pink-400 font-bold text-sm leading-none mt-0.5">👉</span>
              <p className="text-xs text-pink-200/90 leading-relaxed">
                <strong>Code is copied to your clipboard!</strong> Simply click the Instagram message bar and press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px] font-bold">Ctrl + V</kbd> (or right-click &gt; Paste) to send it to us.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <a
                href={getInstagramDmUrl(instagramProfileUrl, userEntry?.code)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (userEntry?.code) {
                    try {
                      navigator.clipboard.writeText(userEntry.code);
                      toast.success(`Code ${userEntry.code} copied! Press Ctrl+V in the chat.`);
                    } catch {}
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer no-underline"
              >
                <Send size={15} />
                <span>Open Instagram DM with @{instagramHandle}</span>
              </a>

              <button
                type="button"
                onClick={() => setShowDmModal(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                I have sent the code, close this
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
