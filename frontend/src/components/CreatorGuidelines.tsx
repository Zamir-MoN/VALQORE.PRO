import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, Gamepad2, Megaphone } from 'lucide-react';
import clsx from 'clsx';

export const CreatorGuidelines = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const handleContinue = () => {
    if (!agreed) {
      toast.error('You must agree to the guidelines to continue.');
      return;
    }
    
    if (!user) {
      toast('Please log in to apply.', { icon: '🔒' });
      openAuthModal();
      return;
    }
    
    navigate('/creator/apply');
  };

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen">
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-wider uppercase text-white mb-4 drop-shadow-md">
            Creator Guidelines
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium">
            Join the Valqore creator program. Review our community standards and expectations before applying.
          </p>
        </div>

        <div className="bg-cards/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          <div className="space-y-12">
            
            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <Gamepad2 className="text-primary" /> What is a Valqore Creator?
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                A Valqore Creator is an ambassador for our platform. You are a content creator, streamer, or community leader who loves gaming and wants to share the best premium titles with your audience. Valqore Creators gain access to exclusive perks, revenue sharing, and early access to upcoming features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-primary" /> Expected Behavior
              </h2>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li>Maintain a positive, inclusive environment in your community.</li>
                <li>Accurately represent Valqore products and services.</li>
                <li>Respect intellectual property rights and only share content you own or have permission to use.</li>
                <li>Adhere to all applicable laws and platform-specific terms of service (e.g., Twitch, YouTube guidelines).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <Megaphone className="text-primary" /> Promotion Expectations & Authenticity
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We value authenticity. When promoting Valqore, clearly disclose your relationship with us in accordance with FTC guidelines (or your local equivalent). Never use deceptive marketing practices, botting, or spam to artificially inflate your metrics or referral counts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <ShieldAlert className="text-error" /> Prohibited Behavior
              </h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <p className="text-red-200 mb-4 font-bold">Engaging in any of the following will result in immediate termination from the program:</p>
                <ul className="space-y-2 text-red-200/80 list-disc pl-5">
                  <li>Hate speech, harassment, or bullying.</li>
                  <li>Promoting illegal activities, piracy, or unauthorized game key reselling.</li>
                  <li>Purchasing fake followers, views, or engagement.</li>
                  <li>Misusing Valqore branding or passing yourself off as an official Valqore employee.</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-heading font-bold text-white mb-3">Application Review</h2>
              <p className="text-text-secondary leading-relaxed">
                Valqore reserves the right to review, accept, or reject any application at our sole discretion. Meeting the minimum requirements does not guarantee acceptance into the program.
              </p>
            </section>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="bg-cards/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 mb-8 flex items-center gap-4 cursor-pointer hover:bg-cards/60 transition-colors" onClick={() => setAgreed(!agreed)}>
          <div className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0",
            agreed ? "bg-primary border-primary" : "bg-transparent border-white/20"
          )}>
            {agreed && <CheckCircle2 size={20} className="text-background" />}
          </div>
          <p className="text-white font-bold select-none">
            I have read and agree to the Valqore Creator Guidelines.
          </p>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleContinue}
            className={clsx(
              "flex items-center gap-3 font-black text-lg px-8 py-4 rounded-xl uppercase tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(220,248,54,0.15)]",
              agreed 
                ? "bg-primary text-background hover:bg-white hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]" 
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
            )}
          >
            Continue to Creator Application <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};
