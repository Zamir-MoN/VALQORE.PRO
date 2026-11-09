import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Copy, Check, Users, Gift, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { soundFX } from '../utils/wheelAudio';

interface Participant {
  id: string;
  gameId: string;
  userId: string;
  code?: string | null;
  status: string;
  createdAt?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface GiveawayGame {
  id: string;
  title: string;
  slug?: string;
  isGiveaway?: boolean;
  coverImage?: string;
  giveawayRules?: string | null;
}

interface GiveawaySpinWheelProps {
  token: string | null;
  apiUrl: string;
  games: GiveawayGame[];
}

const SEGMENT_COLORS = [
  '#DCF836', // Neon Lime Primary
  '#00F0FF', // Cyber Cyan
  '#FF0055', // Neon Pink
  '#9D00FF', // Purple
  '#FF7700', // Orange
  '#00FF66', // Bright Green
  '#FFD700', // Gold
  '#00B4D8', // Deep Cyan
  '#F72585', // Magenta
  '#4CC9F0', // Sky Blue
  '#7209B7', // Violet
  '#10B981', // Emerald
];

export const GiveawaySpinWheel: React.FC<GiveawaySpinWheelProps> = ({ token, apiUrl, games }) => {
  const giveawayGames = (games || []).filter(g => g.isGiveaway);
  const [selectedGiveawayId, setSelectedGiveawayId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [winner, setWinner] = useState<any | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Set default selected giveaway
  useEffect(() => {
    if (giveawayGames.length > 0 && !selectedGiveawayId) {
      setSelectedGiveawayId(giveawayGames[0].id);
    }
  }, [giveawayGames, selectedGiveawayId]);

  // Fetch approved participants whenever the selected giveaway changes
  useEffect(() => {
    if (!selectedGiveawayId || !token) return;
    fetchParticipants(selectedGiveawayId);
  }, [selectedGiveawayId, token]);

  const fetchParticipants = async (giveawayId: string) => {
    setLoadingParticipants(true);
    setWinner(null);
    try {
      const res = await axios.get(`${apiUrl}/giveaways/admin/${giveawayId}/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We only spin for APPROVED participants
      const allEntries: Participant[] = res.data.entries || [];
      const approvedOnly = allEntries.filter(e => e.status === 'APPROVED');
      setParticipants(approvedOnly);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch giveaway participants');
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Draw the spin wheel on canvas (clean look without heavy borders)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    const count = participants.length;
    if (count === 0) {
      // Empty placeholder wheel
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#141418';
      ctx.fill();

      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Approved Entrants', center, center);
      return;
    }

    const arc = (2 * Math.PI) / count;

    // Draw slices
    for (let i = 0; i < count; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();

      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();

      // Subtle slice separator
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(10, 10, 14, 0.4)';
      ctx.stroke();

      // Draw participant label (rotated so text is always readable from outside)
      ctx.save();
      ctx.translate(center, center);
      const midAngle = angle + arc / 2;
      ctx.rotate(midAngle);

      ctx.fillStyle = '#060608';
      ctx.font = count > 16 ? 'bold 10px sans-serif' : count > 8 ? 'bold 12px sans-serif' : 'bold 13px sans-serif';

      const username = participants[i].user?.username || `User #${i + 1}`;
      const code = participants[i].code ? ` (${participants[i].code})` : '';
      const label = username.length > 12 ? `${username.slice(0, 10)}..` : username;

      // Always readable orientation
      const normalizedMid = (midAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      if (normalizedMid > Math.PI / 2 && normalizedMid < (3 * Math.PI) / 2) {
        ctx.rotate(Math.PI);
        ctx.textAlign = 'left';
        ctx.fillText(`${label}${code}`, -radius + 20, 5);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(`${label}${code}`, radius - 20, 5);
      }
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0E0E12';
    ctx.fill();

    // Center inner dot
    ctx.beginPath();
    ctx.arc(center, center, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#DCF836';
    ctx.fill();
  }, [participants]);

  // Handle spin with smooth deceleration physics & realistic audio ticking
  const handleSpinWheel = async () => {
    if (isSpinning || !selectedGiveawayId || participants.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    try {
      // 1. Call backend to select winner from approved entries
      const res = await axios.post(
        `${apiUrl}/giveaways/admin/${selectedGiveawayId}/draw-winner`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const drawnWinner = res.data.winner;
      if (!drawnWinner) {
        throw new Error('No winner returned by the server');
      }

      // 2. Find winner's slice index in our participants array
      const winnerIndex = participants.findIndex(
        p => p.user?.id === drawnWinner.userId || p.id === drawnWinner.entryId
      );

      const count = participants.length;
      const targetIndex = winnerIndex >= 0 ? winnerIndex : 0;
      const sliceDeg = 360 / count;

      // Top indicator is at 270 degrees
      const sliceCenter = targetIndex * sliceDeg + sliceDeg / 2;
      let targetDeg = (270 - sliceCenter) % 360;
      if (targetDeg < 0) targetDeg += 360;

      // Spin minimum 6 full revolutions
      const fullSpins = 6 * 360;
      const startDeg = rotation;
      const currentMod = startDeg % 360;
      const additionalRotation = fullSpins + ((targetDeg - currentMod + 360) % 360);
      const totalDelta = additionalRotation;
      const totalDuration = 5500; // 5.5 seconds

      const startTime = performance.now();
      let lastSliceIndex = -1;

      // Physics tick loop with deceleration sound
      const animateWheel = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        // Quintic ease-out deceleration curve for ultra-realistic slow down
        const easeOut = 1 - Math.pow(1 - progress, 5);
        const currentRot = startDeg + totalDelta * easeOut;
        setRotation(currentRot);

        // Check which slice is passing top indicator (270 deg)
        const currentAngleAtIndicator = (270 - (currentRot % 360) + 360) % 360;
        const currentSlice = Math.floor(currentAngleAtIndicator / sliceDeg);

        if (currentSlice !== lastSliceIndex) {
          lastSliceIndex = currentSlice;
          if (soundEnabledRef.current) {
            soundFX.playTick();
          }
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animateWheel);
        } else {
          // Finished spinning
          setIsSpinning(false);
          setWinner(drawnWinner);
          setShowWinnerModal(true);
          if (soundEnabledRef.current) {
            soundFX.playWinChime();
          }
          toast.success(`🎉 Winner Selected: @${drawnWinner.username}!`, { duration: 6000 });
        }
      };

      animFrameRef.current = requestAnimationFrame(animateWheel);
    } catch (err: any) {
      setIsSpinning(false);
      toast.error(err.response?.data?.error || 'Failed to spin wheel');
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const selectedGame = giveawayGames.find(g => g.id === selectedGiveawayId);

  return (
    <div className="bg-cards/40 rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-2xl mt-4">
      {/* Background cyber ambient glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header (Clean, tag removed) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h3 className="text-2xl md:text-3xl font-heading font-black tracking-wide uppercase text-white flex items-center gap-3">
            <Trophy className="text-primary" size={26} /> Giveaway Spin Wheel
          </h3>
          <p className="text-text-secondary text-sm font-medium mt-1">
            Pick a giveaway and spin the live wheel to randomly select the lucky winner among verified participants.
          </p>
        </div>

        {/* Giveaway Selector & Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-white/40" />}
          </button>

          <div className="relative min-w-[220px]">
            <select
              value={selectedGiveawayId}
              onChange={e => setSelectedGiveawayId(e.target.value)}
              disabled={isSpinning || giveawayGames.length === 0}
              className="w-full bg-background/90 border border-white/10 hover:border-primary/40 focus:border-primary text-white text-sm font-bold rounded-2xl px-4 py-3 outline-none transition-all cursor-pointer disabled:opacity-50"
            >
              {giveawayGames.length === 0 ? (
                <option value="">No Active Giveaways</option>
              ) : (
                giveawayGames.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => selectedGiveawayId && fetchParticipants(selectedGiveawayId)}
            disabled={isSpinning || !selectedGiveawayId || loadingParticipants}
            title="Refresh Participants"
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} className={loadingParticipants ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Wheel Display */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
            {/* Pointer / Arrow Indicator at Top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-[0_4px_12px_rgba(220,248,54,0.6)]">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-primary" />
              <div className="w-2.5 h-2.5 rounded-full bg-black -mt-6" />
            </div>

            {/* Rotating Wheel Canvas */}
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <canvas
                ref={canvasRef}
                width={420}
                height={420}
                className="w-full h-full rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-8 w-full max-w-sm">
            <button
              type="button"
              onClick={handleSpinWheel}
              disabled={isSpinning || participants.length === 0 || !selectedGiveawayId}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary via-lime-400 to-primary text-black font-heading font-black text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(220,248,54,0.4)] hover:shadow-[0_0_45px_rgba(220,248,54,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-3"
            >
              <Sparkles size={22} className={isSpinning ? 'animate-spin' : ''} />
              <span>{isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN TO SELECT WINNER'}</span>
            </button>
            <p className="text-center text-xs text-text-secondary mt-2.5 font-semibold">
              {participants.length} verified participant{participants.length === 1 ? '' : 's'} loaded on the wheel
            </p>
          </div>
        </div>

        {/* Right Side: Giveaway Information & Entrants List */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Selected Giveaway Card */}
          <div className="bg-background/80 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="text-primary" size={20} />
              <span className="text-xs uppercase font-bold tracking-widest text-text-secondary">Selected Giveaway</span>
            </div>
            <h4 className="text-lg font-black text-white truncate">
              {selectedGame?.title || 'No Giveaway Selected'}
            </h4>
            <div className="mt-4 flex items-center gap-4 text-xs font-bold text-text-secondary">
              <span className="flex items-center gap-1.5 text-primary">
                <Users size={14} /> {participants.length} Approved Entries
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                Instagram Verified
              </span>
            </div>
          </div>

          {/* Participant List Preview */}
          <div className="bg-background/80 border border-white/5 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-widest text-text-secondary flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" /> Approved Entrants
              </span>
              <span className="text-xs font-mono font-bold text-white/60">
                {participants.length} total
              </span>
            </div>

            {loadingParticipants ? (
              <div className="py-12 flex flex-col items-center justify-center text-text-secondary">
                <RefreshCw size={24} className="animate-spin text-primary mb-2" />
                <span className="text-xs font-bold">Loading entrants...</span>
              </div>
            ) : participants.length === 0 ? (
              <div className="py-10 px-4 rounded-xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                <AlertCircle size={28} className="text-amber-400/80 mb-2" />
                <p className="text-sm font-bold text-white">No Approved Entrants Yet</p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  Entrants must submit their 4-digit code in Instagram DM and get verified before they can appear on the wheel.
                </p>
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {participants.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block truncate">
                          @{entry.user?.username || 'User'}
                        </span>
                        <span className="text-[11px] text-text-secondary font-mono truncate block">
                          {entry.user?.email}
                        </span>
                      </div>
                    </div>
                    {entry.code && (
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-black shrink-0">
                        #{entry.code}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WINNER CELEBRATION MODAL */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#0D0D11] border-2 border-primary/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(220,248,54,0.35)] text-center animate-in zoom-in-95 duration-300">
            {/* Ambient burst */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-[40px] pointer-events-none" />

            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary/30 to-lime-500/10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(220,248,54,0.4)]">
              <Trophy size={42} className="animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Winner Selected
            </div>

            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-wider mb-1">
              Congratulations!
            </h3>
            <p className="text-xs text-text-secondary font-medium mb-6">
              Selected through the Creator Spin Wheel for <span className="text-white font-bold">{selectedGame?.title}</span>
            </p>

            {/* Winner Card */}
            <div className="bg-background/90 border border-primary/30 rounded-2xl p-5 text-left mb-6 relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-heading font-black text-xl shrink-0">
                  {(winner.username || 'W')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                    Winner Username
                  </span>
                  <span className="text-lg font-black text-white block truncate">
                    @{winner.username}
                  </span>
                </div>
              </div>

              {winner.code && (
                <div className="mb-3 pb-3 border-b border-white/5 flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold uppercase">4-Digit Code:</span>
                  <span className="font-mono font-black text-primary px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                    #{winner.code}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                    Contact Email
                  </span>
                  <span className="text-xs font-mono text-white/90 truncate block">
                    {winner.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(winner.email || '');
                    setCopiedEmail(true);
                    toast.success('Winner email copied to clipboard!');
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedEmail ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowWinnerModal(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-lime-400 text-black font-heading font-black uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_25px_rgba(220,248,54,0.3)] cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
