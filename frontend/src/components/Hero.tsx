import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { getImageUrl } from '../utils/image';

export const Hero = () => {
  const { games } = useGames();
  const validGames = games.filter(g => !g.isGiveaway && !g.outOfStock);
  
  // Safe fallback to prevent empty state layout collapse
  const displayGames = validGames.length > 0 
    ? validGames.slice(0, 4) 
    : [
        { id: 'temp1', title: 'Loading...', coverImage: '', price: 0, category: '...' }
      ];

  const [activeIndex, setActiveIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Ensure activeIndex is bounded
  const safeIndex = activeIndex >= displayGames.length ? 0 : activeIndex;
  const activeGame = displayGames[safeIndex];

  // Auto-slide
  useEffect(() => {
    if (displayGames.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayGames.length]);

  useEffect(() => {
    if (!titleRef.current) return;
    const splitTitle = new SplitType(titleRef.current, { types: 'words,chars' });
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(
      splitTitle.chars,
      { y: 100, opacity: 0, rotateX: -90 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.02, ease: 'back.out(1.7)' }
    );
    return () => splitTitle.revert();
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black" id="home">
      {/* Background Image with Crossfade */}
      <AnimatePresence mode="popLayout">
        {activeGame && activeGame.coverImage && (
          <motion.div
            key={activeGame.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={getImageUrl(activeGame.coverImage)} 
              alt={activeGame.title} 
              className="w-full h-full object-cover opacity-40 mix-blend-lighten"
            />
            {/* Cinematic Gradients & Noise */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container relative z-10 mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-end pb-16 pt-32 min-h-screen">
        
        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col justify-end h-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]"></span>
            <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">Premium Storefront</span>
          </motion.div>

          <h1 
            ref={titleRef}
            className="text-6xl sm:text-7xl lg:text-[7rem] font-black leading-[1] text-white drop-shadow-2xl mb-6 tracking-tighter"
            style={{ clipPath: 'polygon(0 -20%, 100% -20%, 100% 120%, 0% 120%)' }}
          >
            Play Beyond<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">Reality</span>
          </h1>

          <AnimatePresence mode="wait">
            {activeGame && activeGame.coverImage && (
              <motion.div
                key={activeGame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 rounded-md bg-primary/20 text-primary font-bold text-sm border border-primary/20 backdrop-blur-sm">
                    {activeGame.category || 'Featured'}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">{activeGame.title}</h2>
                <p className="text-text-secondary text-base sm:text-lg mb-8 line-clamp-2 max-w-lg">
                  {activeGame.description || "Immerse yourself in breathtaking worlds and unforgettable adventures. Get it now at the best price."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Link to="/store" className="group relative flex items-center justify-center gap-2 bg-primary text-background font-bold text-lg px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:scale-[1.02]">
              <span className="relative z-10">Explore Store</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </Link>
            
            <button 
              onClick={() => {
                // @ts-expect-error lenis
                window.lenis?.scrollTo('#trending', { offset: -50, duration: 1.2 });
              }}
              className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <PlayCircle size={22} className="text-white group-hover:text-primary transition-colors" />
              <span>Trending Now</span>
            </button>
          </motion.div>
        </div>

        {/* Interactive Glass Dock (Right/Bottom) */}
        <div className="lg:col-span-4 flex flex-col justify-end gap-4 h-full z-20">
          <p className="text-sm font-bold tracking-widest text-white/50 uppercase mb-2 hidden lg:block">Featured Collection</p>
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x hide-scrollbar">
            {displayGames.map((game, idx) => {
              if (!game.coverImage) return null;
              return (
                <button
                  key={game.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative flex items-center gap-4 p-2 pr-6 rounded-2xl transition-all duration-500 text-left snap-center shrink-0 w-[240px] sm:w-[280px] lg:w-full ${
                    activeIndex === idx 
                    ? 'bg-black/40 border-white/20 shadow-2xl scale-100 lg:scale-105 translate-x-0 lg:-translate-x-4' 
                    : 'bg-black/20 border-white/5 hover:bg-white/10 scale-95 opacity-60 hover:opacity-100'
                  } border backdrop-blur-xl overflow-hidden`}
                >
                  {activeIndex === idx && (
                    <motion.div 
                      layoutId="activeHeroIndicator"
                      className="absolute inset-0 rounded-2xl border-2 border-primary z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/10 transition-colors duration-500"></div>
                  
                  <img 
                    src={getImageUrl(game.coverImage)} 
                    alt={game.title}
                    className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-xl shadow-lg relative z-10"
                  />
                  <div className="flex-col overflow-hidden relative z-10 flex flex-1">
                    <h4 className={`font-bold text-sm sm:text-base truncate w-full transition-colors ${activeIndex === idx ? 'text-primary' : 'text-white group-hover:text-white'}`}>{game.title}</h4>
                    <p className="text-text-secondary font-semibold text-xs sm:text-sm mt-1">${game.price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
