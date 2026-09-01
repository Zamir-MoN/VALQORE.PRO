import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Gamepad2, X, KeyRound, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

  // Cooldown countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setStep('form');
    setOtpDigits(['', '', '', '', '', '']);
  };

  const resetModal = () => {
    setError('');
    setSuccessMsg('');
    setStep('form');
    setOtpDigits(['', '', '', '', '', '']);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    closeAuthModal();
  };

  // --------------------------------------------------
  // Google OAuth Login
  // --------------------------------------------------
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.post(`${API_URL}/auth/google`, {
          accessToken: tokenResponse.access_token,
        });
        login(res.data.token, res.data.user);
        resetModal();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google authentication failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-In was cancelled or failed');
    }
  });

  // --------------------------------------------------
  // Form Submission (Login OR Send Register OTP)
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      // Direct Login
      setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/auth/login`, { username, password });
        login(res.data.token, res.data.user);
        resetModal();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Register Step 1: Validate & Send OTP
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/auth/send-register-otp`, { username, email });
        setSuccessMsg(res.data.message || 'OTP sent to your email!');
        setStep('otp');
        setResendCooldown(60);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to send verification code');
      } finally {
        setLoading(false);
      }
    }
  };

  // --------------------------------------------------
  // Resend OTP
  // --------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/send-register-otp`, { username, email });
      setSuccessMsg(res.data.message || 'New verification code sent!');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // OTP Digits Handling
  // --------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of whole 6-digit string
    if (value.length > 1) {
      const pasteData = value.replace(/\D/g, '').slice(0, 6);
      if (pasteData) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < pasteData.length; i++) {
          newDigits[i] = pasteData[i];
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --------------------------------------------------
  // Verify OTP & Complete Registration
  // --------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/verify-register-otp`, {
        username,
        email,
        password,
        otp,
      });
      login(res.data.token, res.data.user);
      resetModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired verification code');
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
          onClick={resetModal}
        />

        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-cards/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
          
          <button 
            onClick={resetModal} 
            className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              {step === 'otp' ? (
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/30">
                  <ShieldCheck size={36} className="text-primary drop-shadow-[0_0_15px_rgba(220,248,54,0.5)]" />
                </div>
              ) : (
                <Gamepad2 size={40} className="text-primary drop-shadow-[0_0_15px_rgba(220,248,54,0.5)]" />
              )}
            </div>
            <h2 className="text-2xl font-heading font-black tracking-wider text-white">
              {step === 'otp' ? 'VERIFY YOUR EMAIL' : (isLogin ? 'WELCOME BACK' : 'JOIN VALQORE')}
            </h2>
            <p className="text-text-secondary mt-1 text-xs">
              {step === 'otp' 
                ? `Enter the 6-digit code sent to ${email}`
                : (isLogin ? 'Log in to access your digital library.' : 'Create an account to start your journey.')}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-xs rounded-xl text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          {successMsg && !error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded-xl text-center font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              {successMsg}
            </motion.div>
          )}

          {/* STEP 1: Main Form (Login / Register) */}
          {step === 'form' ? (
            <>
              {/* Google Sign In Button */}
              <div className="mb-6">
                <button 
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/15 hover:border-white/30 rounded-2xl py-3.5 transition-all text-sm font-bold text-white shadow-lg cursor-pointer group"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">or continue with {isLogin ? 'credentials' : 'email'}</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="relative"
                    >
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address" 
                        required={!isLogin}
                        className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isLogin ? "Username or Email" : "Username"} 
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                  />
                </div>

                <AnimatePresence mode="popLayout" initial={false}>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="relative"
                    >
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password" 
                        required={!isLogin}
                        className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(220,248,54,0.2)] text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-background font-bold uppercase tracking-wider py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(220,248,54,0.5)] transition-all disabled:opacity-50 text-sm cursor-pointer"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Send Verification Code')}
                  <ArrowRight size={18} />
                </motion.button>
              </form>

              <div className="mt-6 text-center text-xs text-text-secondary">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={handleToggle}
                  className="text-primary font-bold hover:text-white transition-colors uppercase tracking-wider ml-1 cursor-pointer"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </div>
            </>
          ) : (
            /* STEP 2: OTP Input Screen */
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="flex justify-center gap-2.5 my-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 bg-black/50 border border-white/15 focus:border-primary focus:bg-primary/5 rounded-xl text-center text-2xl font-bold text-primary outline-none transition-all focus:shadow-[0_0_20px_rgba(220,248,54,0.3)]"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full bg-primary text-background font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(220,248,54,0.5)] transition-all disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
                <KeyRound size={18} />
              </motion.button>

              <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  ← Edit Information
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary hover:text-white transition-colors disabled:opacity-40 disabled:hover:text-primary flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RotateCw size={14} className={resendCooldown > 0 ? '' : 'animate-spin-once'} />
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

