import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Heart, User, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import type { Currency } from '../context/CurrencyContext';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { StaggeredMenu } from './StaggeredMenu';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { user, logout, openAuthModal } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  
  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'];
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (targetPath: string) => (e: React.MouseEvent) => {
    if (location.pathname === targetPath) {
      e.preventDefault();
      // @ts-expect-error lenis is attached to window
      if (window.lenis) {
        // @ts-expect-error lenis is attached to window
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav
        className={clsx(
          'hidden lg:flex fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 lg:px-12 items-center justify-between',
          scrolled ? 'bg-background/60 backdrop-blur-xl py-4 shadow-2xl' : 'bg-gradient-to-b from-background/80 to-transparent py-6'
        )}
      >
      <div className="flex items-center gap-10">
        <Link to="/" onClick={handleNavClick('/')} className="text-2xl font-heading font-black tracking-tighter text-primary drop-shadow-[0_0_12px_rgba(220,248,54,0.4)] hover:drop-shadow-[0_0_20px_rgba(220,248,54,0.8)] transition-all duration-300 hover:scale-105">
          VALQORE.PRO
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" onClick={handleNavClick('/')} className="relative text-sm font-bold text-text-secondary hover:text-white transition-colors duration-300 group py-2">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/store" onClick={handleNavClick('/store')} className="relative text-sm font-bold text-text-secondary hover:text-white transition-colors duration-300 group py-2">
            Store
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <a href="/#support" className="relative text-sm font-bold text-text-secondary hover:text-white transition-colors duration-300 group py-2">
            Support
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/store" className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group block">
          <Search size={20} className="group-hover:scale-110 transition-transform" />
        </Link>

        {/* Currency Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="flex items-center gap-1 p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group font-bold text-sm"
          >
            {currency}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCurrencyOpen && (
            <div className="absolute top-full right-0 mt-2 bg-cards/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden min-w-[100px] shadow-2xl z-50">
              {currencies.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    setIsCurrencyOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                    currency === c ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group relative block">
          <Heart size={20} className="group-hover:scale-110 transition-transform" />
          {wishlistItems.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)]">
              {wishlistItems.length}
            </span>
          )}
        </button>
        <Link 
          to={user ? "/cart" : "#"} 
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              openAuthModal();
            }
          }}
          className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group relative block"
        >
          <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-1 bg-primary text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(220,248,54,0.6)]">
              {cartItems.length}
            </span>
          )}
        </Link>
        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block"></div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-bold text-white max-w-[100px] truncate">{user.username}</span>
            <button onClick={logout} className="hidden sm:flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-sm font-bold px-4 py-2 rounded-full transition-all duration-300">
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button onClick={openAuthModal} className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-background hover:shadow-[0_0_20px_rgba(220,248,54,0.4)] text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300">
            <User size={16} />
            <span>Login</span>
          </button>
        )}
      </div>
    </nav>

      {/* Mobile Navigation (StaggeredMenu) */}
      <div className="block lg:hidden">
        <StaggeredMenu
          position="right"
          isFixed={true}
          items={[
            { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
            { label: 'Store', ariaLabel: 'Browse the store', link: '/store' },
            { label: 'Support', ariaLabel: 'Get help', link: '/#support' },
            { label: 'Login', ariaLabel: 'Sign in to account', link: '/auth' }
          ]}
          socialItems={[
            { label: 'Discord', link: '#' },
            { label: 'Twitter', link: '#' },
            { label: 'Steam', link: '#' }
          ]}
          displaySocials={true}
          displayItemNumbering={true}
          colors={['#dcf836', '#222222', '#0A0A0B']}
          accentColor="#dcf836"
          menuButtonColor="#ffffff"
          openMenuButtonColor="#dcf836"
          changeMenuColorOnOpen={true}
        />
      </div>
    </>
  );
};
