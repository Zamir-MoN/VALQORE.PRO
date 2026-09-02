import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ArrowLeft, Shield, CreditCard, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PaymentModal } from './PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const Cart = () => {
  const { cartItems, loading, removeFromCart } = useCart();
  const { user, token, loading: authLoading, openAuthModal } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState<{
    orderId: string;
    amount: number;
    purpose: string;
    upiUri: string;
    qrCode: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
      navigate('/');
    }
  }, [user, authLoading, navigate, openAuthModal]);

  const handleCheckout = async () => {
    if (!user) return;
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      const res = await axios.post(`${API_URL}/payments/create-session`, {
        couponCode: couponApplied ? couponCode : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setPaymentOrderData(res.data);
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to initiate payment session');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading || authLoading || !user) return (
    <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen flex justify-center items-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  let total = cartItems.reduce((acc, item) => acc + (item.price * (1 - item.discount / 100)), 0);
  let savings = subtotal - total;

  if (couponApplied) {
    savings += couponDiscountAmount;
    total -= couponDiscountAmount;
    if (total < 0) total = 0; // Prevent negative total
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      const res = await axios.post(`${API_URL}/coupons/validate`, { code: couponCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCouponDiscountAmount(res.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! ₹${res.data.discount} off.`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired coupon');
      setCouponApplied(false);
      setCouponDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen" id="cart-page">
      <div className="container mx-auto max-w-[1200px]">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-primary rotate-45 flex-shrink-0 shadow-[0_0_10px_rgba(220,248,54,0.5)]"></div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-wider uppercase text-white">
              Your Cart
            </h1>
          </div>
          <span className="ml-auto text-text-secondary font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            {cartItems.length} ITEMS
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-cards/30 border border-white/10 rounded-3xl backdrop-blur-md relative overflow-hidden group">
            {/* Background glowing effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
            
            <div className="w-24 h-24 bg-cards border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
              <ShoppingCart size={40} className="text-white/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4 relative z-10">Your cart is empty</h2>
            <p className="text-text-secondary text-center max-w-md mb-8 relative z-10 leading-relaxed">Looks like you haven't added any games to your cart yet. Discover your next favorite game in our store.</p>
            <Link 
              to="/store"
              className="relative z-10 bg-primary hover:bg-white text-background font-black text-lg px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(220,248,54,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all uppercase tracking-wide hover:scale-105 active:scale-95 duration-300 flex items-center gap-2 group/btn"
            >
              Browse Games <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-cards/40 border border-white/5 rounded-2xl p-4 sm:p-6 transition-all hover:bg-cards/60 hover:border-white/10 group relative">
                
                {/* Item Image */}
                <Link to={`/game/${item.id}`} className="w-full sm:w-40 aspect-video sm:aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden relative border border-white/10">
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">
                      -{item.discount}%
                    </div>
                  )}
                </Link>
                
                {/* Item Details */}
                <div className="flex flex-col justify-between flex-grow">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-white/10 text-text-secondary text-[10px] font-bold rounded uppercase tracking-wider">{item.genre}</span>
                        <span className="px-2 py-0.5 bg-white/10 text-text-secondary text-[10px] font-bold rounded uppercase tracking-wider">{item.platforms[0]}</span>
                      </div>
                      <Link to={`/game/${item.id}`}>
                        <h3 className="text-xl font-bold text-white hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-text-secondary text-sm mt-1">{item.developer}</p>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-text-secondary hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors group/trash"
                    >
                      <Trash2 size={18} className="group-hover/trash:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4 sm:mt-0">
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded border border-white/5">
                      Instant Delivery
                    </span>
                    <div className="flex flex-col items-end">
                      {item.discount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-text-secondary line-through text-sm">{formatPrice(item.price)}</span>
                          <span className="text-lg font-heading font-black text-white">
                            {formatPrice(item.price * (1 - item.discount / 100))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-heading font-black text-white">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-6">
              
              <div className="bg-cards/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-xl font-heading font-black tracking-wider uppercase text-white mb-6">
                  Order Summary
                </h2>
                
                <div className="flex flex-col gap-4 text-sm font-bold mb-6">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center text-primary drop-shadow-[0_0_8px_rgba(220,248,54,0.3)]">
                      <span>Discount {couponApplied && '(+ Coupon)'}</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                      className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-text-secondary/50 disabled:opacity-50"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponApplied || isApplyingCoupon}
                      className="bg-white/10 hover:bg-primary text-white hover:text-black px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white uppercase tracking-wider"
                    >
                      {isApplyingCoupon ? <Loader2 size={16} className="animate-spin inline" /> : (couponApplied ? 'Applied' : 'Apply')}
                    </button>
                  </div>
                  {couponApplied && (
                    <button 
                      onClick={() => {
                        setCouponApplied(false);
                        setCouponCode('');
                        setCouponDiscountAmount(0);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 mt-2 font-bold underline decoration-red-400/30 underline-offset-2 transition-colors"
                    >
                      Remove coupon
                    </button>
                  )}
                </div>
                
                <div className="pt-4 border-t border-white/10 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-text-secondary font-bold uppercase tracking-wider">Estimated Total</span>
                    <span className="text-3xl font-heading font-black text-white">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl p-4 mb-6 flex gap-3 text-sm">
                  <div className="text-[#00F0FF] mt-0.5 flex-shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#00F0FF] uppercase tracking-wider text-xs mb-1">Important Notice</h4>
                    <p className="text-text-secondary leading-relaxed">
                      After checkout, you will receive login credentials for our <strong className="text-white">Custom Desktop Launcher</strong> to access your games automatically.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-primary hover:bg-white text-background font-black text-lg px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(220,248,54,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all uppercase tracking-wide hover:scale-105 active:scale-95 duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isCheckingOut ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Secure Checkout <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
                  <Shield size={14} className="text-primary" />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-cards/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Accepted Payment Methods</p>
                <div className="flex flex-wrap justify-center gap-3 opacity-60">
                  <div className="h-8 w-14 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div className="h-8 w-14 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3.5 object-contain grayscale" />
                  </div>
                  <div className="h-8 w-14 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032" alt="USDT" className="h-4 object-contain grayscale" />
                  </div>
                  <div className="h-8 w-14 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src="https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=032" alt="LTC" className="h-4 object-contain grayscale" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
        )}
      </div>

      {/* Delta APay Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={paymentOrderData}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          window.location.href = '/profile';
        }}
      />
    </div>
  );
};
