import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Plus, Minus } from 'lucide-react';
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
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
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
    <section ref={containerRef} className="py-24 px-6 lg:px-12 relative z-10" id="support">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
          <p className="text-text-secondary">Everything you need to know about the Valqore experience.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                ref={el => { itemsRef.current[index] = el; }}
                className={clsx(
                  "border border-white/10 rounded-2xl overflow-hidden transition-colors duration-300",
                  isOpen ? "bg-cards/80 border-primary/30" : "bg-cards/30 hover:bg-cards/50"
                )}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={clsx("font-bold text-lg transition-colors duration-300", isOpen ? "text-primary" : "text-white")}>
                    {faq.question}
                  </span>
                  <div className={clsx("flex-shrink-0 ml-4 p-1 rounded-full transition-colors duration-300", isOpen ? "bg-primary/20 text-primary" : "text-text-secondary")}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <div 
                  className={clsx(
                    "overflow-hidden transition-all duration-500 ease-in-out px-6",
                    isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
