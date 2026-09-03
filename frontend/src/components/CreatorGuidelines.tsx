import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, ArrowRight, 
  Gamepad2, Megaphone, Coins, Unlock, CheckSquare, AlertTriangle, Rocket 
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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
      toast('Please log in to apply.', { icon: '🚧' });
      openAuthModal();
      return;
    }
    
    navigate('/creator/apply');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-12 relative z-10 min-h-screen w-full overflow-x-hidden">
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-14"
        >
          <h1 className="text-2xl sm:text-5xl font-heading font-black tracking-wider uppercase text-white mb-2.5 sm:mb-4 drop-shadow-md">
            Creator Guidelines
          </h1>
          <p className="text-text-secondary text-xs sm:text-lg max-w-2xl mx-auto font-medium px-2 leading-relaxed">
            Join the Valqore creator program. Review our community standards and expectations before applying.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="space-y-4 sm:space-y-6 mb-8 sm:mb-12"
        >
          
          {/* Intro Card */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-10 shadow-xl relative overflow-hidden group hover:bg-cards/60 hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-white mb-3 sm:mb-4">
              Collaborate with Valqore
            </h2>
            <p className="text-text-secondary text-sm sm:text-lg leading-relaxed mb-3 sm:mb-4 max-w-4xl">
              Are you a content creator, streamer, or gaming influencer? Partner with Valqore to access games for your content while helping your audience discover great gaming deals.
            </p>
            <p className="text-primary text-sm sm:text-lg leading-relaxed font-bold">
              Our Creator Program is designed to be simple, transparent, and rewarding.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Section 1 */}
            <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-xl hover:bg-cards/60 hover:border-white/20 transition-all duration-500 group flex flex-col">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 flex-shrink-0">
                  <Gamepad2 className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-lg sm:text-2xl font-heading font-bold text-white leading-tight">
                  1. Get a Game for Your Content
                </h2>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5 flex-grow">
                <li><strong className="text-white">Approved creators</strong> can receive one game at a time for creating a YouTube video or livestream.</li>
                <li>The provided game is intended specifically for <strong className="text-white">promotional content</strong> and remains available to you for the duration of the collaboration.</li>
                <li>Once the agreed promotional content is completed, access to the promotional game may be revoked.</li>
              </ul>
            </motion.div>

            {/* Section 2 */}
            <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-xl hover:bg-cards/60 hover:border-white/20 transition-all duration-500 group flex flex-col">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 flex-shrink-0">
                  <Megaphone className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-lg sm:text-2xl font-heading font-bold text-white leading-tight">
                  2. Promote Valqore in Your Content
                </h2>
              </div>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                Creators must promote Valqore during the video or livestream in the following ways:
              </p>
              <ul className="space-y-2.5 sm:space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5 flex-grow">
                <li><strong className="text-white">On-screen / Stream Overlay</strong> - Display branding during content.</li>
                <li><strong className="text-white">Video Description</strong> - Include Valqore link and info.</li>
                <li><strong className="text-white">Verbal Promotion</strong> - Mention Valqore naturally.</li>
                <li><strong className="text-white">Promo Code</strong> - Share your unique creator code.</li>
              </ul>
              <p className="text-text-secondary/60 text-xs mt-3 sm:mt-4 italic">
                *The promotional requirements may vary depending on the specific collaboration.
              </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-xl hover:bg-cards/60 hover:border-white/20 transition-all duration-500 group flex flex-col">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 flex-shrink-0">
                  <Coins className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-lg sm:text-2xl font-heading font-bold text-white leading-tight">
                  3. Earn Credits Through Your Audience
                </h2>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5 flex-grow">
                <li>Every approved creator receives a <strong className="text-white">unique promo code</strong>.</li>
                <li>When someone uses your promo code and successfully purchases a game from Valqore, you <strong className="text-white">earn Creator Credits</strong>.</li>
                <li>Your credits can accumulate over time and may be redeemed for eligible rewards.</li>
              </ul>
            </motion.div>

            {/* Section 4 */}
            <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-xl hover:bg-cards/60 hover:border-white/20 transition-all duration-500 group flex flex-col">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 flex-shrink-0">
                  <Unlock className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-lg sm:text-2xl font-heading font-bold text-white leading-tight">
                  4. Unlock Permanent Game Bundles
                </h2>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5 flex-grow">
                <li>As you earn more Creator Credits, you can work toward unlocking a <strong className="text-white">Permanent Game Bundle</strong>.</li>
                <li>Once you reach the required credit threshold, you can redeem your accumulated credits for an eligible bundle and <strong className="text-white">keep those games permanently</strong>, subject to the applicable redemption terms.</li>
              </ul>
            </motion.div>
          </div>

          {/* Section 5 */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-xl hover:bg-cards/60 hover:border-white/20 transition-all duration-500 group">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 flex-shrink-0">
                <CheckSquare className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-white">
                5. Creator Responsibilities
              </h2>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              To remain part of the Creator Program, creators are expected to:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-text-secondary text-sm sm:text-base list-none">
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Create genuine gaming content</strong> featuring the provided game.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Follow the agreed <strong className="text-white">promotional requirements</strong>.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Clearly display and mention Valqore as required.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Use their assigned promo code when promoting Valqore.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Avoid misleading claims</strong> about Valqore, its products, or pricing.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Not share, resell, transfer, or distribute</strong> promotional game access.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Follow applicable platform rules and advertising/disclosure requirements.</span></li>
            </ul>
          </motion.div>

          {/* Section 6 */}
          <motion.div variants={itemVariants} className="bg-red-500/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-red-500/20 p-5 sm:p-8 shadow-xl hover:bg-red-500/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-error/10 flex items-center justify-center text-error group-hover:scale-110 group-hover:bg-error group-hover:text-background transition-all duration-500 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-white">
                6. Important Conditions
              </h2>
            </div>
            <ul className="space-y-3 sm:space-y-4 text-red-200/80 text-xs sm:text-base list-none relative z-10">
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Promotional game access is <strong className="text-red-100">temporary</strong> unless otherwise stated.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Games provided for promotional purposes may be <strong className="text-red-100">revoked</strong> after the collaboration or promotional period ends.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Creator Credits are earned only from <strong className="text-red-100">eligible, completed purchases</strong> made using the creator's promo code.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Credits may not be transferable, sold, or exchanged for cash unless explicitly stated.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Valqore reserves the right to review transactions and <strong className="text-red-100">remove credits</strong> associated with fraudulent, refunded, cancelled, or abusive purchases.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Failure to follow the Creator Guidelines may result in <strong className="text-red-100">suspension or removal</strong> from the Creator Program.</span></li>
              <li className="flex items-start gap-2.5"><AlertTriangle size={15} className="mt-1 text-error/60 shrink-0" /> <span>Specific campaigns may have additional requirements communicated to the creator before participation.</span></li>
            </ul>
          </motion.div>

          {/* Section 7 - CTA */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/20 to-primary/5 backdrop-blur-md border border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center mt-6 sm:mt-12 shadow-[0_0_40px_rgba(220,248,54,0.15)] hover:shadow-[0_0_60px_rgba(220,248,54,0.25)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white mb-3 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-background group-hover:-translate-y-2 group-hover:shadow-[0_10px_20px_rgba(220,248,54,0.3)] transition-all duration-500">
                  <Rocket className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                Ready to Collaborate?
              </h2>
              <p className="text-lg sm:text-2xl text-primary font-black mb-2 sm:mb-4 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(220,248,54,0.5)]">
                Create. Promote. Earn.
              </p>
              <p className="text-text-secondary text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                Join the Valqore Creator Program and turn your gaming audience into rewards while helping gamers discover their next game.
              </p>
            </div>
          </motion.div>

        </motion.div>

        {/* Agreement Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6"
        >
          <div className="w-full lg:w-[70%] bg-cards/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-6 flex items-center gap-3 sm:gap-5 cursor-pointer hover:bg-cards/80 transition-all duration-300 group" onClick={() => setAgreed(!agreed)}>
            <div className={clsx(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 shadow-lg",
              agreed ? "bg-primary border-primary shadow-[0_0_15px_rgba(220,248,54,0.4)]" : "bg-transparent border-white/20 group-hover:border-primary/50"
            )}>
              {agreed && <CheckCircle2 size={20} className="text-background" />}
            </div>
            <p className="text-white font-bold select-none text-sm sm:text-lg">
              I have read and agree to the Valqore Creator Guidelines.
            </p>
          </div>

          <div className="w-full lg:w-[30%] flex">
            <button 
              onClick={handleContinue}
              className={clsx(
                "w-full h-full flex items-center justify-center gap-2 sm:gap-3 font-black text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase tracking-wider transition-all duration-300",
                agreed 
                  ? "bg-primary text-background hover:bg-white hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(220,248,54,0.5)]" 
                  : "bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
              )}
            >
              Apply <ArrowRight size={20} className="flex-shrink-0" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
