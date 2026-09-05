import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, X, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatOrderId } from '../utils/order';
import { PaymentModal } from './PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const PendingPaymentOverlay: React.FC = () => {
  const { user, token } = useAuth();
  const socket = useSocket();
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fetchLatestPendingOrder = useCallback(async () => {
    if (!token || !user) {
      setPendingOrder(null);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data;
      if (Array.isArray(orders)) {
        // Find the latest active pending order
        const pending = orders.find((o: any) => o.status === 'PENDING');
        if (pending) {
          setPendingOrder(pending);
        } else {
          setPendingOrder(null);
        }
      }
    } catch (err) {
      // Quietly ignore network failures in background
    }
  }, [token, user]);

  // Initial fetch and poll on mount or auth change
  useEffect(() => {
    if (token && user) {
      fetchLatestPendingOrder();
      const interval = setInterval(fetchLatestPendingOrder, 15000); // 15s refresh
      return () => clearInterval(interval);
    } else {
      setPendingOrder(null);
    }
  }, [token, user, fetchLatestPendingOrder]);

  // Socket updates for orders
  useEffect(() => {
    if (!socket) return;

    const handleOrderChange = () => {
      fetchLatestPendingOrder();
    };

    socket.on('orders_updated', handleOrderChange);
    
    if (pendingOrder) {
      socket.on(`payment_status_${pendingOrder.id}`, (data: { status: string }) => {
        if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
          fetchLatestPendingOrder();
        }
      });
    }

    return () => {
      socket.off('orders_updated', handleOrderChange);
      if (pendingOrder) {
        socket.off(`payment_status_${pendingOrder.id}`);
      }
    };
  }, [socket, pendingOrder, fetchLatestPendingOrder]);

  // Reset dismiss state if the pending order changes
  const prevOrderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (pendingOrder?.id && pendingOrder.id !== prevOrderIdRef.current) {
      setIsDismissed(false);
      prevOrderIdRef.current = pendingOrder.id;
    }
  }, [pendingOrder?.id]);

  // Open Payment Modal directly
  const handleOpenPayment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pendingOrder) return;

    try {
      const res = await axios.get(`${API_URL}/payments/${pendingOrder.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentData(res.data);
      setIsPaymentModalOpen(true);
    } catch (err) {
      toast.error('Failed to load payment details');
    }
  };

  // Cancel Pending Order
  const handleCancelOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pendingOrder) return;

    setIsCancelling(true);
    try {
      await axios.put(
        `${API_URL}/orders/${pendingOrder.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order cancelled');
      setShowCancelConfirm(false);
      setPendingOrder(null);
      fetchLatestPendingOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  // Don't display overlay on admin routes or if no pending order (unless payment modal is actively open)
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute || (!pendingOrder && !isPaymentModalOpen)) {
    return null;
  }

  // Cover image / details fallback
  const firstItem = pendingOrder.items?.[0];
  const itemCount = pendingOrder.items?.length || 1;
  const gameTitle = firstItem?.game?.title || 'Game Purchase';
  const gameCover = firstItem?.game?.coverImage || '/images/card-cyberpunk.jpg';

  if (isDismissed) {
    // Show a compact floating pill icon in the bottom right when minimized
    return (
      <>
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-95 duration-300">
          <button
            onClick={() => setIsDismissed(false)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#121214]/95 hover:bg-[#1a1a1e] border border-primary/50 text-white rounded-full shadow-[0_0_25px_rgba(220,248,54,0.3)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Complete your pending payment"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <CreditCard size={18} className="text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary leading-none">
                Pending Payment
              </span>
              <span className="text-xs font-bold text-white leading-tight">
                {pendingOrder ? formatPrice(pendingOrder.totalAmount) : ''}
              </span>
            </div>
          </button>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            fetchLatestPendingOrder();
          }}
          orderData={paymentData}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            setPendingOrder(null);
            fetchLatestPendingOrder();
            navigate('/library');
          }}
        />
      </>
    );
  }

  return (
    <>
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300"
      >
        <div className="relative rounded-2xl bg-[#121214]/95 border border-primary/40 p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(220,248,54,0.15)] backdrop-blur-2xl overflow-hidden group">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

          {/* Cancel Confirmation Prompt Overlay inside Card */}
          {showCancelConfirm && (
            <div className="absolute inset-0 z-30 bg-[#121214]/98 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center animate-in fade-in duration-200">
              <AlertCircle size={28} className="text-red-400 mb-2" />
              <h4 className="text-sm font-heading font-black text-white mb-1">Cancel this order?</h4>
              <p className="text-[11px] text-text-secondary mb-3 leading-tight max-w-[220px]">
                This will cancel order #{formatOrderId(pendingOrder.id)}. You can purchase again anytime.
              </p>
              <div className="flex gap-2 w-full max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Keep
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelOrder}
                  className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? '...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          )}

          {/* Top Bar: Badge, Order ID, Dismiss Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Payment Pending
              </span>
              <span className="font-mono text-xs font-bold text-text-secondary">
                {formatOrderId(pendingOrder.id)}
              </span>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize"
              aria-label="Minimize"
            >
              <X size={15} />
            </button>
          </div>

          {/* Middle: Game preview & Price */}
          <div className="flex items-center gap-3 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
              <img
                src={gameCover}
                alt={gameTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight mb-1">
                {gameTitle}
              </h4>
              {itemCount > 1 && (
                <span className="text-[10px] text-text-secondary font-medium block mb-0.5">
                  +{itemCount - 1} other item{itemCount > 2 ? 's' : ''}
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Due:</span>
                <span className="text-sm sm:text-base font-heading font-black text-primary drop-shadow-[0_0_8px_rgba(220,248,54,0.3)]">
                  {formatPrice(pendingOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Pay with UPI & Cancel Order */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPayment}
              className="flex-1 py-2.5 px-3 bg-primary hover:bg-white text-background font-heading font-black text-xs rounded-xl shadow-[0_0_15px_rgba(220,248,54,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider group/btn cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <CreditCard size={14} /> Pay with UPI
              <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="py-2.5 px-3 text-text-secondary hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Cancel this order"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Delta APay Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          fetchLatestPendingOrder();
        }}
        orderData={paymentData}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          setPendingOrder(null);
          fetchLatestPendingOrder();
          navigate('/library');
        }}
      />
    </>
  );
};
