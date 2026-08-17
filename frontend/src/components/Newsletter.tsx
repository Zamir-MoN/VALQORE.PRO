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
      y: 50,
      duration: 1,
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
    <section className="py-32 px-6 lg:px-12 relative z-10" id="newsletter">
      <div className="container mx-auto">
        <div 
          ref={containerRef}
          className="relative max-w-5xl mx-auto rounded-[3rem] overflow-hidden glass p-12 md:p-24 border border-white/10 text-center shadow-2xl hover:shadow-[0_20px_60px_rgba(var(--primary),0.15)] transition-shadow duration-700 bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(var(--primary),0.15)_0%,_transparent_50%)] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-bold tracking-wider text-primary uppercase">Stay Updated</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Never Miss A <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00F0FF]">Drop</span></h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Subscribe to the Valqore newsletter for exclusive deals, early access to beta tests, and weekly free game drops.
            </p>
            
            <form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto relative flex items-center group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-[#00F0FF]/30 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                disabled={status !== 'idle'}
                className="w-full bg-background/80 backdrop-blur-xl border-2 border-white/10 focus:border-primary text-white rounded-full py-5 pl-8 pr-40 outline-none transition-all duration-300 disabled:opacity-50 font-medium text-lg relative z-10 placeholder:text-white/30"
              />
              
              <button 
                type="submit"
                disabled={status !== 'idle'}
                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-white text-background hover:text-black font-black uppercase tracking-wider px-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed group/btn z-20 shadow-lg"
              >
                {status === 'idle' && (
                  <>
                    <span className="mr-2">Join</span>
                    <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </>
                )}
                {status === 'submitting' && (
                  <div className="w-6 h-6 border-4 border-background/20 border-t-background rounded-full animate-spin"></div>
                )}
                {status === 'success' && (
                  <CheckCircle2 size={24} className="text-background" />
                )}
              </button>
            </form>
            
            <p className="text-sm text-text-secondary mt-8 font-medium">
              By subscribing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
