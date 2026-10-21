import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Package, Coins, Users, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';

export const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const originalTitle = document.title;
    document.title = 'About Us | VALQORE.PRO';
    
    // Optional: update meta description if the element exists
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalMeta = metaDescription ? metaDescription.getAttribute('content') : null;
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover the story behind VALQORE.PRO, our mission to make gaming more affordable, and the gaming experiences and bundles we offer.');
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription && originalMeta) {
        metaDescription.setAttribute('content', originalMeta);
      }
    };
  }, []);

  return (
    <>
      <div className="pt-28 pb-20 px-4 md:px-6 lg:px-12 relative z-10" id="about-us">
        <div className="container mx-auto max-w-[1200px] flex flex-col gap-24">
          
          {/* SECTION 1: HERO */}
          <section className="flex flex-col items-center text-center space-y-6 pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide uppercase">
              <Sparkles size={16} />
              <span>About Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tighter text-white uppercase drop-shadow-md">
              Your Next Gaming <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Adventure Starts Here.</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-gray-200">
              More games. More adventures. More value.
            </p>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed mt-2">
              At VALQORE.PRO, we believe that great gaming experiences should be accessible to more players. Discover exciting games, explore affordable gaming options, and find your next adventure without stretching your budget.
            </p>
            <div className="pt-6">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 bg-primary hover:bg-white text-background font-black text-sm px-8 py-4 rounded-xl transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(220,248,54,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105"
              >
                <span>Explore Games</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>

          {/* SECTION 2: WHO WE ARE */}
          <section className="flex flex-col lg:flex-row gap-12 items-center bg-white/[0.02] border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex-1 space-y-6 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">
                Built by a Gamer, <br /><span className="text-primary">for Gamers.</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  VALQORE.PRO was created by a gamer who understood how expensive gaming can become. With so many incredible games to experience, the cost of playing shouldn't always stand between gamers and their next adventure.
                </p>
                <p>
                  That idea inspired VALQORE.PRO — a gaming-focused platform built to help players explore more games. We provide access to genuine games through Steam accounts where the purchased game is already available in the account's Steam library.
                </p>
                <p>
                  Customers receive the relevant Steam account login credentials needed to access the purchased game, and some products may use Steam Family Sharing. Whether you're looking for your next story-driven adventure or want to discover something new, we're here to make exploring the world of gaming more accessible.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center relative z-10">
              <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl group-hover:border-primary/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <Gamepad2 size={120} className="text-primary opacity-80" strokeWidth={1} />
              </div>
            </div>
          </section>

          {/* SECTION 3: WHAT WE OFFER */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">What We Offer</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Steam Access / Family Sharing',
                  desc: 'We provide Steam account login credentials to give you access to genuine games. Some products may use Steam Family Sharing.',
                  icon: <img src="/steam-logo-neon.png" alt="Steam Logo" className="w-8 h-8 object-contain transition-all duration-300 group-hover:brightness-0" />
                },
                {
                  title: 'Discover Game Bundles',
                  desc: 'Get more gaming experiences together with selected bundles that bring multiple games into one package at an affordable combined price.',
                  icon: <Package size={32} />
                },
                {
                  title: 'Affordable Gaming',
                  desc: 'Explore a wide range of PC games at budget-friendly prices, with a focus on story-driven adventures and immersive single-player experiences.',
                  icon: <Coins size={32} />
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group shadow-lg">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          {/* SECTION: WHAT YOU GET */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">What You Get</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Genuine Games',
                  desc: 'All games provided are genuine titles available directly through the Steam platform.',
                  icon: <Gamepad2 size={24} />
                },
                {
                  title: 'Ready in Library',
                  desc: 'The purchased game is already present and waiting in the provided Steam account\'s library.',
                  icon: <Package size={24} />
                },
                {
                  title: 'Login Credentials',
                  desc: 'You receive the necessary Steam account login credentials to access the purchased game.',
                  icon: <ShieldCheck size={24} />
                },
                {
                  title: 'Family Shared Accounts',
                  desc: 'Where applicable, access may be provided through convenient Steam Family Sharing.',
                  icon: <Users size={24} />
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          {/* SECTION 4: OUR MISSION */}
          <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-primary opacity-[0.03]"></div>
            <div className="relative z-10 px-6 py-16 sm:p-20 text-center flex flex-col items-center">
              <Heart size={48} className="text-primary mb-6" />
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase mb-6">
                More Gaming. <br className="sm:hidden" /><span className="text-primary">Fewer Barriers.</span>
              </h2>
              <div className="space-y-6 max-w-3xl mx-auto text-gray-300 text-lg sm:text-xl leading-relaxed">
                <p>
                  Our mission is to help gamers experience more of the games they love by making gaming access more affordable.
                </p>
                <p>
                  We want players to spend less time worrying about the cost of their next game and more time discovering new worlds, experiencing unforgettable stories, and enjoying the adventures that make gaming special.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: WHY VALQORE.PRO? */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">Why VALQORE.PRO?</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Gamer-founded',
                  desc: 'Created from a genuine understanding of the gaming community and the cost of gaming.',
                  icon: <Users size={24} />
                },
                {
                  title: 'Value-focused',
                  desc: 'Affordable options for players looking to explore more games within their budget.',
                  icon: <Coins size={24} />
                },
                {
                  title: 'Bundles for more adventures',
                  desc: 'Discover selected collections of games together.',
                  icon: <Package size={24} />
                },
                {
                  title: 'Purchase-related support',
                  desc: 'Our support is available to help customers with purchase-related issues.',
                  icon: <ShieldCheck size={24} />
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: FINAL CTA */}
          <section className="flex flex-col items-center text-center space-y-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
              Your next favorite game could be just around the corner. Explore our collection, discover available bundles, and find your next gaming experience with VALQORE.PRO.
            </p>
            
            <Link
              to="/store"
              className="inline-flex items-center gap-2 bg-primary hover:bg-white text-background font-black text-sm px-8 py-4 rounded-xl transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(220,248,54,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105"
            >
              <span>Explore Games</span>
              <ArrowRight size={18} />
            </Link>

            <div className="pt-8 flex flex-col items-center opacity-60">
              <span className="font-heading font-black text-xl tracking-widest uppercase">VALQORE.PRO</span>
              <span className="text-xs font-bold tracking-[0.3em] text-primary mt-1">PLAY MORE. EXPLORE MORE.</span>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};
