import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Loader2, Copy, Shield, ArrowRight, ExternalLink } from 'lucide-react';
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
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !orderData) {
      setStatus('PENDING');
      setUtr('');
      setFeedback(null);
      setShowCancelConfirm(false);
      return;
    }

    // Lock page scroll and disable background interaction when payment modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setStatus('PENDING');

    // 1. Socket Listener for instant real-time payment confirmation
    if (socket) {
      const eventName = `payment_status_${orderData.orderId}`;
      const handlePaymentStatus = (data: { status: string }) => {
        if (data.status === 'COMPLETED') {
          setStatus('COMPLETED');
          toast.success('Payment verified successfully!');
          setTimeout(() => {
            onSuccess();
          }, 2000);
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
  }, [isOpen, orderData, socket, onSuccess]);

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
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderData, status, token, onSuccess]);

  if (!isOpen || !orderData) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(orderData.upiUri);
    setCopied(true);
    toast.success('UPI link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the 12-digit UTR from your UPI payment.' });
      return;
    }

    if (!/^\d{12}$/.test(utr.trim())) {
      setFeedback({ type: 'error', message: 'UTR must be exactly 12 numeric digits.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await axios.post(
        `${API_URL}/payments/${orderData.orderId}/confirm`,
        { utr: utr.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && !res.data.pending) {
        setStatus('COMPLETED');
        toast.success('Payment verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else if (res.data.pending) {
        setFeedback({
          type: 'success',
          message: 'UTR submitted! Waiting for instant bank confirmation...'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Verification failed. Please double check your 12-digit UTR.'
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!isOpen || !orderData) {
    return null;
  }

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
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-[80px] pointer-events-none"></div>

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
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors text-sm"
              >
                Keep Paying
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        {status === 'PENDING' && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="absolute top-5 right-5 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20 cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-primary rotate-45 shadow-[0_0_10px_rgba(220,248,54,0.8)]"></div>
          <span className="font-heading font-black tracking-wider text-xl uppercase text-white">
            Delta <span className="text-primary">APay</span>
          </span>
          <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black">
            <Shield size={12} /> Instant UPI
          </span>
        </div>

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
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] mb-4 relative group">
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

            {/* UTR Input Form */}
            <form onSubmit={handleConfirmUtr} className="w-full space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider text-left">
                  Enter 12-Digit UTR / Ref No.
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 423589123456"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-center text-white tracking-[0.25em] font-heading font-black text-lg focus:outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-white/30"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    feedback.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-primary/10 border border-primary/30 text-primary'
                  }`}
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || utr.length !== 12}
                className="w-full py-4 bg-primary hover:bg-white text-background font-heading font-black text-base rounded-xl transition-all shadow-[0_0_20px_rgba(220,248,54,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] uppercase tracking-wider disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-background flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verifying Payment...
                  </>
                ) : (
                  <>
                    Confirm & Complete Order <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-text-secondary/70 mt-4 text-center leading-relaxed">
              Scan with any UPI App (GPay, PhonePe, Paytm, BHIM). Once completed, enter the 12-digit UTR to immediately unlock your games.
            </p>
          </div>
        )}

        {/* Success Screen */}
        {status === 'COMPLETED' && (
          <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,248,54,0.5)]">
              <CheckCircle2 size={44} className="text-primary animate-bounce" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-white mb-2">
              Payment Successful!
            </h3>
            <p className="text-text-secondary text-sm max-w-xs mb-8">
              Your payment has been verified. Your games & launcher account are now unlocked.
            </p>
            <button
              onClick={onSuccess}
              className="w-full py-4 bg-primary hover:bg-white text-background font-heading font-black text-base rounded-xl transition-all shadow-[0_0_20px_rgba(220,248,54,0.4)] uppercase tracking-wider"
            >
              Go to My Library
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
