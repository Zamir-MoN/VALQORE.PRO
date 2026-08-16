import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Timer, Gift } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !bannerRef.current || !textRef.current) return;

    // Parallax effect on banner image
    gsap.to(bannerRef.current, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Fade in text
    gsap.fromTo(textRef.current.children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-20 px-6 lg:px-12 relative z-10 overflow-hidden" id="deals">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center shadow-2xl border border-white/10">
          
          {/* Parallax Background */}
          <div 
            ref={bannerRef}
            className="absolute inset-0 -top-[20%] -bottom-[20%] z-0"
            style={{
              backgroundImage: 'url(/images/hero-artwork.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.4) saturate(1.2)'
            }}
          ></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-0"></div>

          {/* Content */}
          <div ref={textRef} className="relative z-10 p-10 md:p-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/50 text-secondary font-bold text-sm mb-6 uppercase tracking-wider backdrop-blur-md">
              <Gift size={16} />
              Weekend Publisher Sale
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-4 text-shadow-lg">
              Save up to <span className="text-primary">80%</span> on <br/> Square Enix Titles
            </h2>
            
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Final Fantasy, Tomb Raider, Life is Strange and more. Expand your library with these critically acclaimed hits.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-primary transition-colors duration-300 transform hover:scale-105 active:scale-95">
                Shop The Sale
              </button>
              
              <div className="flex items-center gap-3 text-white/90 font-mono bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                <Timer size={20} className="text-primary" />
                <div className="flex gap-2 text-lg font-bold">
                  <span>48<span className="text-xs text-white/50 ml-1">H</span></span>:
                  <span>12<span className="text-xs text-white/50 ml-1">M</span></span>:
                  <span className="text-primary">59<span className="text-xs text-white/50 ml-1">S</span></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative neon accents */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/20 to-transparent mix-blend-overlay z-0 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};
