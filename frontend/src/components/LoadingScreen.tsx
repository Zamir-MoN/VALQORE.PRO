import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState("");
  const fullText = "VALQORE";

  useEffect(() => {
    // Check if user already saw the intro animation this session
    const hasSeenIntro = sessionStorage.getItem('valqore_intro_seen');
    if (hasSeenIntro) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('valqore_intro_seen', 'true');
        onComplete();
      }
    });

    // Snappy Type In (0.35s)
    tl.to({ val: 0 }, {
      val: fullText.length,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: function() {
        setDisplayText(fullText.slice(0, Math.round(this.targets()[0].val)));
      }
    })
    // Brief Pause (0.2s)
    .to({}, { duration: 0.2 })
    // Fast Fade Screen Out (0.3s)
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
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
