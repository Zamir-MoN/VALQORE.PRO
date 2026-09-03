import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export const PullToRefresh = ({ children }: { children: React.ReactNode }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const startY = useRef(0);
  const isPulling = useRef(false);
  const THRESHOLD = 85;

  useEffect(() => {
    // Only enable on mobile/touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull-to-refresh if strictly at the top of the page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      // Dragging down at the top of the page
      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default native reload to take smooth control
        if (e.cancelable && diff > 10) e.preventDefault();
        
        const distance = Math.min(diff * 0.35, THRESHOLD + 20);
        setPullDistance(distance);
      } else if (diff < 0) {
        isPulling.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current || refreshing) return;
      isPulling.current = false;
      
      if (pullDistance >= THRESHOLD * 0.75) {
        setRefreshing(true);
        setPullDistance(50);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, pullDistance]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Lightweight GPU-accelerated Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-start pointer-events-none transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(0, ${pullDistance}px, 0)` }}
      >
        <div 
          className={`mt-[-45px] flex items-center justify-center w-10 h-10 rounded-full bg-cards/95 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-opacity duration-200 ${
            pullDistance > 0 || refreshing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <RefreshCw 
            className={`w-5 h-5 ${
              refreshing ? 'animate-spin text-primary' : pullDistance > THRESHOLD * 0.7 ? 'text-primary' : 'text-white/60'
            }`} 
          />
        </div>
      </div>

      {/* Render children without continuous Framer Motion transform overhead */}
      {children}
    </div>
  );
};
