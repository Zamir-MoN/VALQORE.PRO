import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Send, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Newsletter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.from(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
      }
    });
  }, { scope: containerRef });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      
      // Reset after showing success
      setTimeout(() => {
        setStatus('idle');
        if (formRef.current) formRef.current.reset();
      }, 3000);
    }, 1500);
  };

  return (
    <section className="py-24 px-6 lg:px-12 relative z-10" id="newsletter">
      <div className="container mx-auto">
        <div 
          ref={containerRef}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden glass p-10 md:p-16 border border-secondary/30 text-center"
        >
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-60"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-black mb-4">Never Miss A <span className="text-primary">Drop</span></h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
              Subscribe to the Valqore newsletter for exclusive deals, early access to beta tests, and weekly free game drops.
            </p>
            
            <form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="max-w-md mx-auto relative flex items-center"
            >
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                disabled={status !== 'idle'}
                className="w-full bg-background/50 border border-white/20 focus:border-primary/50 text-white rounded-full py-4 pl-6 pr-32 outline-none transition-all duration-300 disabled:opacity-50"
              />
              
              <button 
                type="submit"
                disabled={status !== 'idle'}
                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-black font-bold px-6 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed group"
              >
                {status === 'idle' && (
                  <>
                    <span className="mr-2 hidden sm:inline">Join</span>
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                {status === 'submitting' && (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                )}
                {status === 'success' && (
                  <CheckCircle2 size={20} className="text-black" />
                )}
              </button>
            </form>
            
            <p className="text-xs text-text-secondary/60 mt-6">
              By subscribing, you agree to our Terms of Service and Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
