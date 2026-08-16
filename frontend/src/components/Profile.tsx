import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Key, ShoppingBag, XCircle, Loader2, CheckCircle2, Clock, ChevronRight, Mail, Calendar, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const Profile = () => {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
      navigate('/');
    }
  }, [user, authLoading, navigate, openAuthModal]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error('Failed to load your orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order cancelled successfully');
      fetchOrders(); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  if (authLoading || !user) return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex justify-center items-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen" id="profile-page">
      
      {/* Background ambient glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-[1200px]">
        
        {/* Premium Header Banner */}
        <div className="relative mb-10 rounded-3xl overflow-hidden border border-white/10 bg-cards/60 backdrop-blur-xl shadow-2xl">
          {/* Abstract banner background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/20 via-transparent to-primary/5 opacity-50"></div>
          
          <div className="relative p-8 pt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center border-2 border-primary/50 shadow-[0_0_20px_rgba(220,248,54,0.15)] relative z-10">
                <User size={40} className="text-primary" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left pb-2">
              <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-wider uppercase text-white mb-2 drop-shadow-md">
                {user.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-text-secondary">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Mail size={14} className="text-primary" /> {user.email || 'Member'}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <ShieldCheck size={14} className="text-primary" /> Verified Account
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Tabs - Sleek Redesign */}
          <div className="w-full md:w-72 flex flex-row md:flex-col gap-2 bg-cards/40 p-3 rounded-3xl border border-white/5 sticky top-32 overflow-x-auto no-scrollbar shadow-xl backdrop-blur-md">
            <p className="hidden md:block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 mt-2 ml-3">Dashboard</p>
            
            <button 
              onClick={() => setActiveTab('orders')}
              className={clsx(
                "flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap flex-1 md:flex-none group",
                activeTab === 'orders' 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(220,248,54,0.05)]' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              )}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={20} className={activeTab === 'orders' ? 'text-primary' : 'text-text-secondary group-hover:text-white'} /> 
                Order History
              </span>
              {activeTab === 'orders' && <ChevronRight size={16} className="hidden md:block opacity-70" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={clsx(
                "flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap flex-1 md:flex-none group",
                activeTab === 'settings' 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(220,248,54,0.05)]' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              )}
            >
              <span className="flex items-center gap-3">
                <Key size={20} className={activeTab === 'settings' ? 'text-primary' : 'text-text-secondary group-hover:text-white'} /> 
                Account Security
              </span>
              {activeTab === 'settings' && <ChevronRight size={16} className="hidden md:block opacity-70" />}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-h-[500px]">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-wider uppercase text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-primary rounded-full"></span> My Orders
                  </h2>
                </div>
                
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-32 bg-cards/20 rounded-3xl border border-white/5">
                    <Loader2 size={40} className="text-primary animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-b from-cards/40 to-transparent border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-colors duration-700"></div>
                    
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 relative z-10">
                      <ShoppingBag size={32} className="text-white/40" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">No orders found</h3>
                    <p className="text-text-secondary mb-8 max-w-sm relative z-10">Looks like you haven't made any purchases yet. Explore our store for the best deals!</p>
                    
                    <Link to="/store" className="relative z-10 bg-primary hover:bg-white text-background font-black px-8 py-3.5 rounded-xl transition-all uppercase tracking-wide hover:scale-105 active:scale-95 duration-300 shadow-[0_0_15px_rgba(220,248,54,0.3)]">
                      Explore Store
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-white/10 rounded-3xl bg-cards/40 backdrop-blur-md overflow-hidden flex flex-col hover:border-white/20 transition-colors duration-300 shadow-lg">
                        
                        {/* Premium Order Header */}
                        <div className="bg-gradient-to-r from-white/5 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Order Reference</span>
                            <span className="font-mono text-sm text-white/90 bg-black/20 px-3 py-1 rounded-md border border-white/5">{order.id}</span>
                          </div>
                          
                          <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-end items-center">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Purchase Date</span>
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary/70" /> {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex flex-col text-right gap-1">
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Total Amount</span>
                              <span className="text-lg font-heading font-black text-primary drop-shadow-[0_0_8px_rgba(220,248,54,0.3)]">
                                {formatPrice(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items & Status */}
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-8 justify-between items-start bg-background/30">
                          
                          {/* Items List */}
                          <div className="flex flex-col gap-5 flex-1 w-full">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex gap-5 items-center group">
                                <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg shadow-md border border-white/10 relative">
                                  <img src={item.game.coverImage} alt={item.game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex flex-col justify-center">
                                  <Link to={`/game/${item.game.id}`} className="text-lg font-bold text-white hover:text-primary transition-colors line-clamp-1 mb-1">
                                    {item.game.title}
                                  </Link>
                                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{item.game.developer}</p>
                                  <div className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 w-max">
                                    <span className="text-sm font-bold text-white">{formatPrice(item.pricePaid)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Status & Actions */}
                          <div className="flex flex-col gap-4 min-w-[160px] items-start sm:items-end w-full sm:w-auto pt-6 sm:pt-0 border-t border-white/5 sm:border-0">
                            <div className="flex flex-col items-start sm:items-end w-full gap-2">
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Status</span>
                              
                              {order.status === 'PENDING' && (
                                <div className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-orange-400/20 w-full sm:w-auto justify-center">
                                  <Clock size={16} /> Pending Fulfillment
                                </div>
                              )}
                              {order.status === 'COMPLETED' && (
                                <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-primary/20 w-full sm:w-auto justify-center">
                                  <CheckCircle2 size={16} /> Completed
                                </div>
                              )}
                              {order.status === 'CANCELLED' && (
                                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-400/20 w-full sm:w-auto justify-center">
                                  <XCircle size={16} /> Cancelled
                                </div>
                              )}
                            </div>
                            
                            {order.status === 'PENDING' && (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                className="mt-2 text-xs text-red-400 hover:text-white hover:bg-red-500 border border-red-500/30 hover:border-red-500 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold w-full sm:w-auto text-center hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-xl">
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-wider uppercase text-white flex items-center gap-3 mb-2">
                    <span className="w-2 h-8 bg-primary rounded-full"></span> Security Settings
                  </h2>
                  <p className="text-text-secondary font-bold text-sm ml-5">Manage your password and secure your account.</p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 bg-cards/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                  
                  {/* Subtle top gradient line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                  <div className="flex flex-col gap-2.5 group">
                    <label className="text-xs text-text-secondary group-focus-within:text-white transition-colors uppercase font-bold tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
                  
                  <div className="flex flex-col gap-2.5 group">
                    <label className="text-xs text-text-secondary group-focus-within:text-white transition-colors uppercase font-bold tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 group">
                    <label className="text-xs text-text-secondary group-focus-within:text-white transition-colors uppercase font-bold tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="mt-6 bg-primary text-background font-black text-lg py-4 rounded-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary shadow-[0_0_20px_rgba(220,248,54,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] uppercase tracking-wide"
                  >
                    {isChangingPassword ? <><Loader2 size={20} className="animate-spin" /> Updating...</> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
