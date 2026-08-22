import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, ArrowRight, 
  Gamepad2, Megaphone, Coins, Unlock, CheckSquare, AlertTriangle, Rocket 
} from 'lucide-react';
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
      toast('Please log in to apply.', { icon: 'dY"'' });
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
              <h2 className="text-2xl font-heading font-bold text-white mb-4">
                Collaborate with Valqore
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Are you a content creator, streamer, or gaming influencer? Partner with Valqore to access games for your content while helping your audience discover great gaming deals.
              </p>
              <p className="text-text-secondary leading-relaxed font-bold text-white">
                Our Creator Program is designed to be simple, transparent, and rewarding.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><Gamepad2 className="text-primary" /></span> 1. Get a Game for Your Content
              </h2>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li><strong className="text-white">Approved creators</strong> can receive one game at a time for creating a YouTube video or livestream.</li>
                <li>The provided game is intended specifically for <strong className="text-white">promotional content</strong> and remains available to you for the duration of the collaboration.</li>
                <li>Once the agreed promotional content is completed, access to the promotional game may be revoked.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><Megaphone className="text-primary" /></span> 2. Promote Valqore in Your Content
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Creators must promote Valqore during the video or livestream in the following ways:
              </p>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li><strong className="text-white">On-screen / Stream Overlay</strong> — Display the Valqore promotion or required branding during the content.</li>
                <li><strong className="text-white">Video Description</strong> — Include the provided Valqore link and promotional information in the description.</li>
                <li><strong className="text-white">Verbal Promotion</strong> — Mention Valqore naturally during the video or livestream.</li>
                <li><strong className="text-white">Promo Code</strong> — Share your unique Valqore creator promo code with your audience.</li>
              </ul>
              <p className="text-text-secondary text-sm mt-4 italic">
                *The promotional requirements may vary depending on the specific collaboration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><Coins className="text-primary" /></span> 3. Earn Credits Through Your Audience
              </h2>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li>Every approved creator receives a <strong className="text-white">unique promo code</strong>.</li>
                <li>When someone uses your promo code and successfully purchases a game from Valqore, you <strong className="text-white">earn Creator Credits</strong>.</li>
                <li>Your credits can accumulate over time and may be redeemed for eligible rewards.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><Unlock className="text-primary" /></span> 4. Unlock Permanent Game Bundles
              </h2>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li>As you earn more Creator Credits, you can work toward unlocking a <strong className="text-white">Permanent Game Bundle</strong>.</li>
                <li>Once you reach the required credit threshold, you can redeem your accumulated credits for an eligible bundle and <strong className="text-white">keep those games permanently</strong>, subject to the applicable redemption terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><CheckSquare className="text-primary" /></span> 5. Creator Responsibilities
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                To remain part of the Creator Program, creators are expected to:
              </p>
              <ul className="space-y-3 text-text-secondary list-disc pl-5">
                <li><strong className="text-white">Create genuine gaming content</strong> featuring the provided game.</li>
                <li>Follow the agreed <strong className="text-white">promotional requirements</strong>.</li>
                <li>Clearly display and mention Valqore as required.</li>
                <li>Use their assigned promo code when promoting Valqore.</li>
                <li><strong className="text-white">Avoid misleading claims</strong> about Valqore, its products, or pricing.</li>
                <li><strong className="text-white">Not share, resell, transfer, or distribute</strong> promotional game access.</li>
                <li>Follow applicable platform rules and advertising/disclosure requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="animate-pulse"><AlertTriangle className="text-error" /></span> 6. Important Conditions
              </h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <ul className="space-y-3 text-red-200/80 list-disc pl-5">
                  <li>Promotional game access is <strong className="text-red-100">temporary</strong> unless otherwise stated.</li>
                  <li>Games provided for promotional purposes may be <strong className="text-red-100">revoked</strong> after the collaboration or promotional period ends.</li>
                  <li>Creator Credits are earned only from <strong className="text-red-100">eligible, completed purchases</strong> made using the creator's promo code.</li>
                  <li>Credits may not be transferable, sold, or exchanged for cash unless explicitly stated.</li>
                  <li>Valqore reserves the right to review transactions and <strong className="text-red-100">remove credits</strong> associated with fraudulent, refunded, cancelled, or abusive purchases.</li>
                  <li>Failure to follow the Creator Guidelines may result in <strong className="text-red-100">suspension or removal</strong> from the Creator Program.</li>
                  <li>Specific campaigns may have additional requirements communicated to the creator before participation.</li>
                </ul>
              </div>
            </section>

            <section className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center mt-12 shadow-[0_0_30px_rgba(220,248,54,0.1)]">
              <h2 className="text-3xl font-heading font-black text-white mb-4 flex items-center justify-center gap-3">
                <span className="animate-bounce"><Rocket className="text-primary w-8 h-8" /></span> Ready to Collaborate?
              </h2>
              <p className="text-xl text-primary font-bold mb-4 uppercase tracking-wider">
                Create. Promote. Earn.
              </p>
              <p className="text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Join the Valqore Creator Program and turn your gaming audience into rewards while helping gamers discover their next game.
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
