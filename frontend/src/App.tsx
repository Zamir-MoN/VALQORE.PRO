import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';

import { Navbar } from './components/Navbar';
import { LoadingScreen } from './components/LoadingScreen';
import { Hero } from './components/Hero';
import { RentalGames } from './components/RentalGames';
import { TrendingGames } from './components/TrendingGames';
import { GiveawayGames } from './components/GiveawayGames';

import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { AuthModal } from './components/Auth';

const BrowseGames = lazy(() => import('./components/BrowseGames').then(m => ({ default: m.BrowseGames })));
const GameDetails = lazy(() => import('./components/GameDetails').then(m => ({ default: m.GameDetails })));
const Cart = lazy(() => import('./components/Cart').then(m => ({ default: m.Cart })));
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));
const Library = lazy(() => import('./components/Library').then(m => ({ default: m.Library })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const CreatorGuidelines = lazy(() => import('./components/CreatorGuidelines').then(m => ({ default: m.CreatorGuidelines })));
const CreatorApplication = lazy(() => import('./components/CreatorApplication').then(m => ({ default: m.CreatorApplication })));
const Support = lazy(() => import('./components/Support').then(m => ({ default: m.Support })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfService })));


import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // @ts-expect-error lenis is attached to window
    if (window.lenis) {
      // @ts-expect-error lenis is attached to window
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
};

import { PullToRefresh } from './components/PullToRefresh';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // On mobile / touch devices, native scroll is much smoother (120Hz) without JS scroll interception
    if (isTouch) return;

    // Initialize optimized Lenis on desktop
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      autoRaf: true,
    });

    // @ts-expect-error attaching to window for global access
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      // @ts-expect-error cleanup
      delete window.lenis;
    };
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <GameProvider>
          <CartProvider>
            <WishlistProvider>
              <PullToRefresh>
                <Router>
                  {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
                  <ScrollToTop />
                  <AuthModal />
                  <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
                    {/* Mobile Background: Stunning cinematic artwork, zero decoding lag */}
                    <img
                      src="/images/bg-mobile.png"
                      alt="Background"
                      className="block sm:hidden w-full h-full object-cover object-center transform-gpu"
                      loading="eager"
                      decoding="async"
                    />
                    {/* Desktop Background: Looping video */}
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      className="hidden sm:block w-full h-full object-cover transform-gpu"
                    >
                      <source src="/videos/bg-nexus.mp4" type="video/mp4" />
                    </video>
                    {/* Dark gradient overlay for perfect readability & rich aesthetic */}
                    <div className="absolute inset-0 bg-[#0A0A0B]/75"></div>
                  </div>

                  {!loading && (
                    <div className="min-h-screen text-text-primary flex flex-col font-body relative z-0 animate-in fade-in duration-700">
                      <Toaster
                        position="top-center"
                        toastOptions={{
                          className: 'glass text-white font-bold',
                          style: {
                            background: 'rgba(25, 25, 25, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      />
                      <Navbar />
                      <main className="flex-grow">
                        <Suspense fallback={<div className="min-h-[60vh] w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>}>
                          <Routes>
                            <Route path="/" element={
                              <>
                                <Hero />
                                <TrendingGames />
                                <RentalGames />
                                <GiveawayGames />
                                <Testimonials />
                                <FAQ />
                                <Newsletter />
                              </>
                            } />
                            <Route path="/store" element={<BrowseGames />} />
                            <Route path="/game/:id" element={<GameDetails />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/library" element={<Library />} />
                            <Route path="/admin/login" element={<AdminLogin />} />

                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/creator/guidelines" element={<CreatorGuidelines />} />
                            <Route path="/creator/apply" element={<CreatorApplication />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                    </div>
                  )}
                </Router>
              </PullToRefresh>
            </WishlistProvider>
          </CartProvider>
        </GameProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;

