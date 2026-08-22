import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState("");
  const fullText = "VALQORE.PRO";

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // 1. Type In
    tl.to({ val: 0 }, {
      val: fullText.length,
      duration: 1.2,
      ease: 'power1.inOut',
      onUpdate: function() {
        setDisplayText(fullText.slice(0, Math.round(this.targets()[0].val)));
      }
    })
    
    // 2. Pause
    .to({}, { duration: 0.6 })
    
    // 3. Type Out
    .to({ val: fullText.length }, {
      val: 0,
      duration: 0.8,
      ease: 'power1.inOut',
      onUpdate: function() {
        setDisplayText(fullText.slice(0, Math.round(this.targets()[0].val)));
      }
    })
    
    // 4. Fade Screen Out
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-16">
        <div className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-primary tracking-widest text-center flex items-center shadow-primary drop-shadow-[0_0_20px_rgba(220,248,54,0.6)]">
          {displayText}
          <span className="w-4 h-[1em] bg-primary ml-2 animate-pulse opacity-80 shadow-[0_0_15px_rgba(220,248,54,0.8)]"></span>
        </div>
      </div>
    </div>
  );
};
