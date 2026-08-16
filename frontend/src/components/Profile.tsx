import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Key, ShoppingBag, XCircle, Loader2, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen" id="profile-page">
      <div className="container mx-auto max-w-[1200px]">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(220,248,54,0.3)]">
            <User size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-wider uppercase text-white">
              {user.username}'s Profile
            </h1>
            <p className="text-text-secondary font-bold">{user.email || 'Member'}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 bg-cards/40 p-2 rounded-2xl border border-white/5 sticky top-32 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === 'orders' ? 'bg-primary text-background' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
            >
              <ShoppingBag size={18} /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === 'settings' ? 'bg-primary text-background' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
            >
              <Key size={18} /> Account Settings
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full bg-cards/40 border border-white/5 rounded-3xl p-6 md:p-8 min-h-[500px]">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span> Order History
                </h2>
                
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 size={32} className="text-primary animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-text-secondary mb-4">You haven't placed any orders yet.</p>
                    <Link to="/store" className="inline-block bg-primary text-background font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform">
                      Browse Store
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-white/10 rounded-2xl bg-cards overflow-hidden flex flex-col">
                        
                        {/* Order Header */}
                        <div className="bg-white/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Order ID</span>
                            <span className="font-mono text-sm text-white">{order.id}</span>
                          </div>
                          
                          <div className="flex gap-6 w-full sm:w-auto justify-between sm:justify-end items-center">
                            <div className="flex flex-col">
                              <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Date</span>
                              <span className="text-sm text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Total</span>
                              <span className="text-sm font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items & Status */}
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 justify-between items-start">
                          
                          {/* Items List */}
                          <div className="flex flex-col gap-4 flex-1">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex gap-4 items-center">
                                <img src={item.game.coverImage} alt={item.game.title} className="w-12 h-16 object-cover rounded shadow-md border border-white/10" />
                                <div>
                                  <Link to={`/game/${item.game.id}`} className="font-bold text-white hover:text-primary transition-colors line-clamp-1">{item.game.title}</Link>
                                  <p className="text-xs text-text-secondary">{item.game.developer}</p>
                                  <p className="text-sm font-bold mt-1 text-white">{formatPrice(item.pricePaid)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Status & Actions */}
                          <div className="flex flex-col gap-3 min-w-[140px] items-start sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t border-white/10 sm:border-0">
                            {order.status === 'PENDING' && (
                              <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-400/20">
                                <Clock size={14} /> Pending
                              </div>
                            )}
                            {order.status === 'COMPLETED' && (
                              <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-400/20">
                                <CheckCircle2 size={14} /> Completed
                              </div>
                            )}
                            {order.status === 'CANCELLED' && (
                              <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-400/20">
                                <XCircle size={14} /> Cancelled
                              </div>
                            )}
                            
                            {order.status === 'PENDING' && (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                className="mt-2 text-xs text-red-400 hover:text-white hover:bg-red-500 border border-red-500/50 px-3 py-1.5 rounded-lg transition-colors font-bold w-full sm:w-auto text-center"
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span> Security Settings
                </h2>
                
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 bg-cards p-6 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider ml-1">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background border border-white/10 rounded-xl p-3.5 text-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="w-full h-px bg-white/5 my-2"></div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider ml-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background border border-white/10 rounded-xl p-3.5 text-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background border border-white/10 rounded-xl p-3.5 text-white focus:border-primary outline-none transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="mt-4 bg-primary text-background font-bold py-3.5 rounded-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary shadow-[0_0_15px_rgba(220,248,54,0.2)]"
                  >
                    {isChangingPassword ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password'}
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
