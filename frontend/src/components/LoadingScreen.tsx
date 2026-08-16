import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const percentRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // Logo appear and glow
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
    })
    .to(logoRef.current, {
      textShadow: '0 0 35px rgba(230,255,0,0.8)',
      duration: 0.5,
    });



    // Simulate loading percentage
    tl.to({ val: 0 }, {
      val: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: function() {
        setPercent(Math.floor(this.targets()[0].val));
      }
    }, '-=1.5');

    // Logo scales and screen fades
    tl.to(logoRef.current, {
      scale: 20,
      opacity: 0,
      duration: 1,
      ease: 'power4.in',
    }, '+=0.2')
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
    }, '-=0.5');

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background Particles could go here */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div 
          ref={logoRef} 
          className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-primary opacity-0 scale-75 tracking-tighter text-center"
        >
          VALQORE.PRO
        </div>

        <div 
          ref={percentRef}
          className="mt-6 sm:mt-8 text-xl sm:text-2xl font-mono text-text-secondary"
        >
          {percent}%
        </div>
      </div>
    </div>
  );
};
