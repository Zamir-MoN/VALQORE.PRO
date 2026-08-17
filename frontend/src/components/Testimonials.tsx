import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

export const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !trackRef.current) return;

    // Infinite marquee effect
    gsap.to(trackRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 30,
      repeat: -1,
    });
    
    // Fade in
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  // Duplicate items for seamless infinite scroll
  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section ref={containerRef} className="py-32 relative z-10 overflow-hidden bg-background" id="community">
      <div className="container mx-auto px-6 lg:px-12 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-300% animate-gradient">Acclaim</span></h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium">Don't just take our word for it. Here's what the community is saying about Valqore.</p>
      </div>

      <div className="relative w-full overflow-hidden flex py-4">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        <div ref={trackRef} className="flex gap-6 px-3 w-max">
          {items.map((testimonial, idx) => (
            <div 
              key={`${testimonial.id}-${idx}`}
              className="w-[350px] sm:w-[450px] flex-shrink-0 p-8 sm:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500 relative group hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(var(--primary),0.1)]"
            >
              <Quote className="absolute top-8 right-8 text-white/5 group-hover:text-primary/20 w-16 h-16 transition-colors duration-500" />
              
              <div className="flex items-center gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xl drop-shadow-md ${i < testimonial.rating ? 'text-yellow-500' : 'text-white/10'}`}>★</span>
                ))}
              </div>
              
              <p className="text-white/80 text-lg leading-relaxed mb-8 font-medium">"{testimonial.comment}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-black text-background shadow-lg overflow-hidden border border-white/20">
                  {/* Fallback avatar if image fails */}
                  {testimonial.user.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.user}</h4>
                  <p className="text-sm text-primary font-bold">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
