import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export const PullToRefresh = ({ children }: { children: React.ReactNode }) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const startY = useRef(0);
  const controls = useAnimation();
  const THRESHOLD = 100;

  useEffect(() => {
    // Only enable on mobile/touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull-to-refresh if we are strictly at the top of the page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || refreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      // If dragging down and at the top
      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default browser refresh/scroll behavior
        if (e.cancelable) e.preventDefault();
        
        // Add resistance factor to feel natural
        const distance = Math.min(diff * 0.4, THRESHOLD + 30);
        setPullDistance(distance);
        controls.set({ y: distance });
      } else if (diff < 0) {
        // Scrolling down the page, cancel pull
        setPulling(false);
        setPullDistance(0);
        controls.start({ y: 0 });
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling || refreshing) return;
      setPulling(false);
      
      if (pullDistance >= THRESHOLD * 0.8) {
        setRefreshing(true);
        // Snap to loading position
        await controls.start({ y: 60, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        
        // Execute refresh
        setTimeout(() => {
          window.location.reload();
        }, 600); 
      } else {
        // Snap back to top if threshold not met
        controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, pullDistance, refreshing, controls]);

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* The Loader that pulls down */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-start pointer-events-none"
        animate={controls}
        initial={{ y: 0 }}
      >
        <div 
          className={`mt-[-50px] flex items-center justify-center w-12 h-12 rounded-full bg-cards/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${pullDistance > 0 || refreshing ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: refreshing ? 'none' : `rotate(${pullDistance * 3}deg)` }}
        >
          <RefreshCw 
            className={`w-6 h-6 ${refreshing ? 'animate-spin text-primary' : pullDistance > THRESHOLD * 0.7 ? 'text-primary' : 'text-white/50'}`} 
          />
        </div>
      </motion.div>

      {/* The App Content */}
      <motion.div 
        animate={controls} 
        initial={{ y: 0 }} 
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
