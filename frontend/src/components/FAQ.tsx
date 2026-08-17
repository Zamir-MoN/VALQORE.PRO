import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/mockData';
import clsx from 'clsx';

gsap.registerPlugin(ScrollTrigger);

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      itemsRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      }
    );
  }, { scope: containerRef });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={containerRef} className="py-32 px-6 lg:px-12 relative z-10" id="support">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-16">
          
          {/* Header Column */}
          <div className="md:w-1/3">
            <div className="sticky top-32">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                <HelpCircle size={18} className="text-primary" />
                <span className="text-sm font-bold tracking-wider text-white uppercase">Support</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Got Questions?<br /><span className="text-primary">We've Got Answers.</span></h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">Can't find what you're looking for? Reach out to our legendary support team for assistance.</p>
              <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 backdrop-blur-md">
                Contact Support
              </button>
            </div>
          </div>

          {/* Accordion Column */}
          <div className="md:w-2/3 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              
              return (
                <div 
                  key={index}
                  ref={el => { itemsRef.current[index] = el; }}
                  className={clsx(
                    "border rounded-2xl overflow-hidden transition-all duration-500 glass",
                    isOpen ? "bg-white/[0.05] border-primary/40 shadow-[0_10px_30px_rgba(var(--primary),0.1)]" : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                  )}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className={clsx("font-bold text-xl md:text-2xl transition-colors duration-300 pr-8", isOpen ? "text-primary" : "text-white group-hover:text-primary/80")}>
                      {faq.question}
                    </span>
                    <div className={clsx("flex-shrink-0 p-2 rounded-full transition-all duration-500", isOpen ? "bg-primary text-background rotate-180" : "bg-white/5 text-white group-hover:bg-white/10")}>
                      {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                    </div>
                  </button>
                  
                  <div 
                    className={clsx(
                      "grid transition-all duration-500 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="text-text-secondary text-lg leading-relaxed px-8 pb-8 pt-2">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
