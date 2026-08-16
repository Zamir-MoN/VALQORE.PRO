import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Gamepad2, Globe, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, { username, password });
        login(res.data.token, res.data.user);
      } else {
        const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={closeAuthModal}
        />

        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-cards/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <button 
            onClick={closeAuthModal} 
            className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-4">
              <Gamepad2 size={40} className="text-primary drop-shadow-[0_0_15px_rgba(220,248,54,0.5)]" />
            </div>
            <h2 className="text-2xl font-heading font-black tracking-wider text-white">
              {isLogin ? 'WELCOME BACK' : 'JOIN VALQORE'}
            </h2>
            <p className="text-text-secondary mt-1 text-xs">
              {isLogin ? 'Log in to access your digital library.' : 'Create an account to start your journey.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-500 text-sm rounded-lg text-center font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-colors text-sm font-bold">
              <Globe size={18} />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] rounded-xl py-3 transition-colors text-sm font-bold">
              <MessageSquare size={18} />
              Discord
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">or continue with {isLogin ? 'username' : 'email'}</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="relative"
                >
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    required={!isLogin}
                    className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" 
                required
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                required
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
              />
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="relative"
                >
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password" 
                    required={!isLogin}
                    className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-xs text-primary hover:text-white transition-colors">Forgot Password?</a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background font-bold uppercase tracking-wider py-4 rounded-xl mt-2 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(220,248,54,0.5)] transition-shadow disabled:opacity-50 text-sm"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={handleToggle}
              className="text-primary font-bold hover:text-white transition-colors uppercase tracking-wider ml-1"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
