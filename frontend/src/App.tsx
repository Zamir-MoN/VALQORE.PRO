import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';

import { Navbar } from './components/Navbar';
import { LoadingScreen } from './components/LoadingScreen';
import { Hero } from './components/Hero';
import { RentalGames } from './components/RentalGames';
import { TrendingGames } from './components/TrendingGames';
import { GiveawayGames } from './components/GiveawayGames';
import { BrowseGames } from './components/BrowseGames';

import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { GameDetails } from './components/GameDetails';
import { Cart } from './components/Cart';
import { Profile } from './components/Profile';
import { AuthModal } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CreatorGuidelines } from './components/CreatorGuidelines';
import { CreatorApplication } from './components/CreatorApplication';

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
      syncTouch: true,
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
                    <source src="/videos/background.mp4" type="video/mp4" />
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
                    </main>
                    <Footer />
                    <ScrollToTop />
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
