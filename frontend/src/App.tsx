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
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const CreatorGuidelines = lazy(() => import('./components/CreatorGuidelines').then(m => ({ default: m.CreatorGuidelines })));
const CreatorApplication = lazy(() => import('./components/CreatorApplication').then(m => ({ default: m.CreatorApplication })));

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
    // Initialize Lenis
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.0,
      smoothWheel: true,
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
                <div className="fixed inset-0 -z-50 pointer-events-none">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transform-gpu will-change-transform"
                  >
                    <source src="/videos/bg-nexus.mp4" type="video/mp4" />
                  </video>
                  {/* Optional overlay to darken video */}
                  <div className="absolute inset-0 bg-background/60"></div>
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
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/admin" element={<AdminDashboard />} />
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
