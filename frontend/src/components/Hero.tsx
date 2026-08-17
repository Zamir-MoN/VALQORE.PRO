import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { HeroCardStack } from './HeroCardStack';

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;

    // Split text for animation
    const splitTitle = new SplitType(titleRef.current, { types: 'words,chars' });
    const splitSubtitle = new SplitType(subtitleRef.current, { types: 'lines' });

    const tl = gsap.timeline({ delay: 0.5 }); // Delay for loading screen finish

    // Title characters reveal
    tl.fromTo(
      splitTitle.chars,
      { y: 100, opacity: 0, rotateX: -90 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.02, ease: 'back.out(1.7)' }
    )
    // Subtitle lines reveal
    .fromTo(
      splitSubtitle.lines,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      '-=0.5'
    )
    // Buttons slide up
    .fromTo(
      buttonsRef.current?.children || [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
      '-=0.4'
    );

    return () => {
      splitTitle.revert();
      splitSubtitle.revert();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] pt-20 sm:pt-24 pb-8 sm:pb-12 px-6 lg:px-12 flex items-center perspective-1000 overflow-hidden"
      id="home"
    >


      <div className="container mx-auto grid lg:grid-cols-2 gap-4 sm:gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Side Content */}
        <div className="flex flex-col items-start order-2 lg:order-1">

          
          <h1 
            ref={titleRef}
            className="text-5xl sm:text-6xl lg:text-8xl leading-[1.1] pb-2"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 120%, 0% 120%)' }}
          >
            Play Beyond<br />Reality
          </h1>
          
          <p 
            ref={subtitleRef}
            className="mt-4 text-base sm:text-xl text-text-secondary max-w-md sm:max-w-lg leading-relaxed"
          >
            Discover premium PC games, AAA titles, indie gems, and exclusive deals in the most advanced digital marketplace.
          </p>
          
          <div ref={buttonsRef} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link to="/store" className="group relative flex items-center justify-center gap-2 bg-primary text-background font-bold text-base sm:text-lg px-6 py-3 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto">
              <span className="relative z-10">Explore Store</span>
              <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </Link>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                // @ts-expect-error lenis is attached to window
                if (window.lenis) {
                  const element = document.getElementById('trending');
                  if (element) {
                    // @ts-expect-error lenis is attached to window
                    window.lenis.scrollTo(element, { offset: -50, duration: 1.2 });
                  }
                }
              }}
              className="flex items-center justify-center gap-2 bg-cards border border-white/10 hover:border-white/30 text-white font-semibold text-base sm:text-lg px-6 py-3 rounded-full transition-all duration-300 w-full sm:w-auto group"
            >
              <PlayCircle size={18} className="text-secondary group-hover:text-primary transition-colors" />
              <span>Trending Games</span>
            </button>
          </div>
        </div>

        {/* Right Side Poster */}
        <div className="flex justify-center items-center relative perspective-1000 px-4 sm:px-0 order-1 lg:order-2">
          


          <HeroCardStack />
        </div>

      </div>
    </section>
  );
};
