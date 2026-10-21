import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Loader2, Shield, Sparkles, ArrowRight, Gamepad2, QrCode, Copy, Check, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/GameContext';
import { formatOrderId } from '../utils/order';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number;
    purpose?: string;
    upiUri: string;
    qrCode: string;
  } | null;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess
}) => {
  const { token } = useAuth();
  const socket = useSocket();
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitUtrMode, setSubmitUtrMode] = useState(false);
  const [utrInputValue, setUtrInputValue] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !orderData) {
      setStatus('PENDING');
      setShowCancelConfirm(false);
      setRedirectCountdown(3);
      setCopiedUpi(false);
      return;
    }

    // Lock page scroll and disable background interaction when payment modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setStatus('PENDING');
    setRedirectCountdown(3);

    // 1. Socket Listener for instant real-time payment confirmation
    if (socket) {
      const eventName = `payment_status_${orderData.orderId}`;
      const handlePaymentStatus = (data: { status: string }) => {
        if (data.status === 'COMPLETED') {
          setStatus('COMPLETED');
          toast.success('Payment verified successfully!');
        } else if (data.status === 'CANCELLED') {
          setStatus('CANCELLED');
        }
      };

      socket.on(eventName, handlePaymentStatus);

      return () => {
        document.body.style.overflow = originalOverflow;
        socket.off(eventName, handlePaymentStatus);
      };
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, orderData?.orderId, socket]);

  // Handle countdown and auto-redirect when payment completes
  useEffect(() => {
    if (status !== 'COMPLETED') return;

    setRedirectCountdown(4);

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onSuccess]);

  // 2. Polling Fallback to guarantee verification even if socket drops
  useEffect(() => {
    if (!isOpen || !orderData || status !== 'PENDING') return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/payments/${orderData.orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.status === 'COMPLETED') {
          setStatus('COMPLETED');
          clearInterval(pollingRef.current);
          toast.success('Payment confirmed!');
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderData?.orderId, status, token]);

  if (!isOpen || !orderData) return null;

  const handleCancelPayment = async () => {
    setShowCancelConfirm(false);
    try {
      await axios.post(
        `${API_URL}/payments/${orderData.orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.error('Payment cancelled');
      onClose();
    } catch (err) {
      onClose();
    }
  };

  const handleCopyUpi = () => {
    const upiId = 'valqore.pro.paul@fam';
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInputValue || utrInputValue.trim().length !== 12) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const res = await axios.post(
        `${API_URL}/payments/${orderData.orderId}/submit-utr`,
        { utr: utrInputValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      if (res.data.message.includes('instantly')) {
        setStatus('COMPLETED');
      }
      setSubmitUtrMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit UTR');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div 
        className={`relative w-full ${submitUtrMode ? 'max-w-[900px]' : 'max-w-2xl'} bg-[#0E0E10] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Dynamic Neon Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Cancel Confirmation Prompt */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-40 bg-[#0E0E10]/95 backdrop-blur-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white mb-2">Cancel Payment Session?</h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed max-w-sm">
              Are you sure you want to cancel? The generated QR code and instant verification session will be invalidated.
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors text-xs sm:text-sm cursor-pointer"
              >
                Keep Paying
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-xs sm:text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-black/60 border border-primary/40 shadow-[0_0_15px_rgba(220,248,54,0.25)] p-1.5 overflow-hidden">
              <img src="/logo.png" alt="Valqore" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(220,248,54,0.7)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black tracking-wider text-lg sm:text-xl uppercase text-white leading-none">
                  VALQORE <span className="text-primary">PAY</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                  <Zap size={10} className="fill-primary" /> Verified Gateway
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                Ref: {formatOrderId(orderData.orderId)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-primary text-xs font-bold">
              <Shield size={13} /> 256-Bit SSL
            </span>

            {status === 'PENDING' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors cursor-pointer"
                title="Close payment window"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* PENDING: Responsive Layout */}
        {status === 'PENDING' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Payable Info & Automated Radar */}
            <div className={`${submitUtrMode ? 'md:col-span-6 lg:col-span-4 hidden lg:flex' : 'md:col-span-6 flex'} flex-col justify-center gap-4`}>
              
              {/* Amount Showcase Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-widest text-text-secondary font-bold">
                    Amount Payable
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    No Extra Fees
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
                    ₹{orderData.amount}
                  </span>
                  <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">INR</span>
                </div>
              </div>

              {/* Supported Payment Channels - Individual Apps */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2.5">
                  Accepted UPI Apps
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="flex items-center justify-center p-2 bg-white/[0.06] hover:bg-white/10 rounded-2xl border border-white/10 transition-all h-13">
                    <img
                      src="/google_pay.png"
                      alt="Google Pay"
                      className="w-8 h-8 object-contain drop-shadow-md"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white/[0.06] hover:bg-white/10 rounded-2xl border border-white/10 transition-all h-13">
                    <img
                      src="/phone_pay.png"
                      alt="PhonePe"
                      className="w-8.5 h-8.5 object-contain rounded-full shadow-md"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white/[0.06] hover:bg-white/10 rounded-2xl border border-white/10 transition-all h-13">
                    <img
                      src="/paytm.png"
                      alt="Paytm"
                      className="w-8.5 h-8.5 object-contain rounded-full shadow-md bg-white p-0.5"
                    />
                  </div>
                </div>
              </div>


              {/* Live WebSocket Verification Radar */}
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 relative overflow-hidden flex items-center gap-3">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-30 animate-ping"></span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Loader2 size={16} className="text-primary animate-spin" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider leading-none mb-1">
                    Auto-Verification Active
                  </p>
                  <p className="text-[11px] text-text-secondary leading-tight">
                    Instant sync with banking gateway. Keeps window open.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: High-Res QR Card */}
            <div className={`${submitUtrMode ? 'md:col-span-6 lg:col-span-4' : 'md:col-span-6'} flex flex-col items-center`}>
              <div className="w-full max-w-[260px] p-4 bg-gradient-to-b from-[#18181C] to-[#121214] border border-white/15 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative group text-center">
                
                {/* Floating Scan Header Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(220,248,54,0.4)] mb-3">
                  <QrCode size={12} /> Scan with Any UPI App
                </div>

                {/* QR Container with Crisp Glass Edge & Central Valqore Badge */}
                <div className="p-2.5 bg-white rounded-2xl shadow-2xl relative overflow-hidden mb-3 mx-auto w-fit">
                  <img
                    src={orderData.qrCode}
                    alt="UPI QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl object-contain block"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-black rounded-xl border border-primary/50 flex items-center justify-center p-1 shadow-lg pointer-events-none">
                    <img src="/logo.png" alt="Valqore" className="w-full h-full object-contain" />
                  </div>
                </div>

                {!submitUtrMode ? (
                  <>
                    <p className="text-[11px] text-text-secondary font-medium px-2 mb-3">
                      Open GPay / PhonePe / Paytm to complete checkout.
                    </p>
                    <button
                      onClick={() => setSubmitUtrMode(true)}
                      className="text-[10px] text-primary/70 hover:text-primary underline decoration-primary/30 hover:decoration-primary transition-colors cursor-pointer"
                    >
                      Already paid but waiting? Submit UTR
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSubmitUtr} className="px-2 mt-2">
                    <p className="text-[10px] text-text-secondary mb-2 text-left leading-tight">
                      Find the 12-digit UTR/Reference No. in your UPI app receipt and enter it below to instantly verify.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={utrInputValue}
                        onChange={(e) => setUtrInputValue(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        placeholder="e.g. 204374160843"
                        className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary transition-colors font-mono"
                        maxLength={12}
                        disabled={isSubmittingUtr}
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingUtr || utrInputValue.length !== 12}
                        className="bg-primary hover:bg-primary/90 text-black px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        {isSubmittingUtr ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Third Column: UTR Guide Graphic (Only in submitUtrMode) */}
            {submitUtrMode && (
              <div className="md:col-span-6 lg:col-span-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-full bg-[#1A1A1E] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl p-2 relative group">
                  <div className="relative w-full rounded-xl overflow-hidden border border-white/5">
                    <img 
                      src="/utr-screenshot.png" 
                      alt="PhonePe UTR Screenshot" 
                      className="w-full h-auto object-cover"
                    />
                    
                    {/* Glowing highlight box over the UTR area on the screenshot */}
                    <div className="absolute bottom-[36.5%] left-[20%] right-[10%] h-[4.5%] bg-primary/20 border-2 border-primary rounded-md animate-pulse shadow-[0_0_15px_rgba(220,248,54,0.6)]"></div>
                  </div>
                  
                  <p className="text-[11px] text-primary/80 mt-3 mb-1 leading-relaxed text-center px-1 font-medium bg-primary/5 p-2 rounded-lg border border-primary/10">
                    Check the "Transfer Details" or "Debited from" section in your UPI app receipt to find the 12-digit UTR.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Ultra-Premium Success Screen */}
        {status === 'COMPLETED' && (
          <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 relative">
            
            {/* Ambient Radial Blast */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl pointer-events-none"></div>

            {/* Premium Animated Icon with Layered Glow Rings */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-ping opacity-60"></div>
              <div className="absolute -inset-2 bg-primary/30 rounded-full blur-md animate-pulse"></div>
              
              <div className="relative w-24 h-24 bg-gradient-to-tr from-[#121214] via-[#1c2211] to-[#121214] border-2 border-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,248,54,0.6)]">
                <CheckCircle2 size={52} className="text-primary animate-in zoom-in-75 duration-700 drop-shadow-[0_0_15px_rgba(220,248,54,0.8)]" />
                
                <div className="absolute -top-1 -right-1 text-primary animate-bounce">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            {/* Status Headings */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Transaction Verified
            </div>

            <h3 className="text-2xl sm:text-3xl font-heading font-black text-white mb-2 tracking-tight">
              Payment <span className="text-primary">Successful!</span>
            </h3>
            
            <p className="text-text-secondary text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
              Your order has been verified. Your game licenses and launcher access are unlocked and ready in your library.
            </p>

            {/* Auto Redirect Banner */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium flex items-center gap-2">
                <Gamepad2 size={16} className="text-primary" /> Redirecting to Library in
              </span>
              <span className="font-heading font-black text-primary text-sm px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                {redirectCountdown}s
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onSuccess}
              className="w-full max-w-sm py-4 bg-primary hover:bg-white text-background font-heading font-black text-sm sm:text-base rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(220,248,54,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <span>Go to My Library Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};


