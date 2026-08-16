import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      toast.success('Login successful');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.response) {
        const msg = error.response.data.error;
        if (msg === 'Wrong credentials') {
          toast.error('Wrong credentials');
        } else {
          toast.error(`Error (${msg || 'Unknown'})`);
        }
      } else {
        toast.error(`Network error: ${error.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 lg:px-12 flex items-center justify-center overflow-hidden z-10" id="admin-login">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div 
        layout
        className="w-full max-w-md bg-cards/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glowing top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80"></div>

        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-6">
            <ShieldAlert size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </div>
          <h2 className="text-3xl font-heading font-black tracking-wider text-white">
            ADMIN PORTAL
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            Restricted access. Please authenticate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Admin Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-black/60 border border-white/10 focus:border-red-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            />
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/60 border border-white/10 focus:border-red-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white font-bold uppercase tracking-wider py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authorize'}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
