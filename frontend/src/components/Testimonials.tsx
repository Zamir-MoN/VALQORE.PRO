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
    <section ref={containerRef} className="py-24 relative z-10 overflow-hidden border-y border-white/5 bg-background" id="community">
      <div className="container mx-auto px-6 lg:px-12 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Player <span className="text-accent">Acclaim</span></h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Don't just take our word for it. Here's what the community is saying about Valqore.</p>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

        <div ref={trackRef} className="flex gap-6 px-3 w-max">
          {items.map((testimonial, idx) => (
            <div 
              key={`${testimonial.id}-${idx}`}
              className="w-[350px] sm:w-[400px] flex-shrink-0 p-8 rounded-2xl glass hover:border-accent/50 transition-colors duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 text-white/5 group-hover:text-accent/20 w-12 h-12 transition-colors duration-500" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < testimonial.rating ? 'text-accent' : 'text-white/10'}`}>★</span>
                ))}
              </div>
              
              <p className="text-white/80 leading-relaxed mb-6 italic">"{testimonial.comment}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border border-white/20">
                  {/* Fallback avatar if image fails */}
                  {testimonial.user.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{testimonial.user}</h4>
                  <p className="text-xs text-text-secondary">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
