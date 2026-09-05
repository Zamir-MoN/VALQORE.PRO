import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Loader2, Shield, Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/GameContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number;
    purpose: string;
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

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !orderData) {
      setStatus('PENDING');
      setShowCancelConfirm(false);
      setRedirectCountdown(3);
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
  }, [isOpen, orderData, socket]);

  // Handle countdown and auto-redirect when payment completes
  useEffect(() => {
    if (status !== 'COMPLETED') return;

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
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderData, status, token]);

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

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => {
        // Prevent background clicks from closing or navigating
        e.stopPropagation();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Subtle Neon Backdrop */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-primary/15 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-[#00F0FF]/15 rounded-full blur-[90px] pointer-events-none"></div>

        {/* Cancel Dialog Prompt */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-30 bg-[#121214]/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-heading font-black text-white mb-2">Cancel Payment?</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Are you sure you want to cancel this payment session? The generated QR code will be invalidated.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors text-sm cursor-pointer"
              >
                Keep Paying
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pr-10">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 bg-primary rotate-45 shadow-[0_0_12px_rgba(220,248,54,0.9)] flex-shrink-0"></div>
            <span className="font-heading font-black tracking-wider text-xl sm:text-2xl uppercase text-white">
              VALQORE <span className="text-primary">PAY</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black">
            <Shield size={12} /> Instant UPI
          </span>
        </div>

        {/* Close Button cleanly aligned in upper-right corner */}
        {status === 'PENDING' && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20 cursor-pointer"
            title="Close payment window"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {status === 'PENDING' && (
          <div className="flex flex-col items-center">
            
            {/* Amount Banner */}
            <div className="text-center mb-4">
              <p className="text-xs uppercase tracking-widest text-text-secondary font-bold mb-1">Total Payable</p>
              <p className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
                ₹{orderData.amount}
              </p>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_35px_rgba(255,255,255,0.18)] mb-4 relative group">
              <img
                src={orderData.qrCode}
                alt="UPI QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl object-contain"
              />
            </div>

            {/* Supported UPI Logos */}
            <div className="w-full flex justify-center items-center py-2 px-4 bg-white/5 rounded-xl border border-white/5 mb-5">
              <img
                src="/UPI-apps2.jpg"
                alt="Google Pay, PhonePe, Paytm"
                className="h-7 w-auto object-contain brightness-110"
              />
            </div>

            {/* Automatic Verification Notice */}
            <div className="w-full mt-4 flex flex-col items-center justify-center p-4 bg-primary/10 border border-primary/20 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl"></div>
              <Loader2 size={24} className="text-primary animate-spin mb-2" />
              <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider text-center z-10">
                Waiting for payment confirmation...
              </p>
              <p className="text-xs text-text-secondary text-center max-w-[250px] z-10">
                Scan the QR with any UPI app. Your payment will be verified automatically. Please do not close this window.
              </p>
            </div>
          </div>
        )}

        {/* Ultra-Premium Success Screen */}
        {status === 'COMPLETED' && (
          <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 relative">
            
            {/* Ambient Radial Blast */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl pointer-events-none"></div>

            {/* Premium Animated Icon with Layered Glow Rings */}
            <div className="relative mb-6">
              {/* Outer Pulsing Waves */}
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-ping opacity-60"></div>
              <div className="absolute -inset-2 bg-primary/30 rounded-full blur-md animate-pulse"></div>
              
              {/* Main Badge */}
              <div className="relative w-24 h-24 bg-gradient-to-tr from-[#121214] via-[#1c2211] to-[#121214] border-2 border-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,248,54,0.6)]">
                <CheckCircle2 size={52} className="text-primary animate-in zoom-in-75 duration-700 drop-shadow-[0_0_15px_rgba(220,248,54,0.8)]" />
                
                {/* Micro Sparkle Accents */}
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
            
            <p className="text-text-secondary text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
              Your order has been verified. Your game licenses and launcher access are now ready in your library.
            </p>

            {/* Auto Redirect Banner */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium flex items-center gap-2">
                <Gamepad2 size={16} className="text-primary" /> Redirecting to Library in
              </span>
              <span className="font-heading font-black text-primary text-sm px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                {redirectCountdown}s
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onSuccess}
              className="w-full py-4 bg-primary hover:bg-white text-background font-heading font-black text-sm sm:text-base rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(220,248,54,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02] active:scale-95"
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

