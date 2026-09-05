import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, ExternalLink, Copy, Check, Clock, ShieldCheck, 
  Sparkles, HelpCircle, ChevronRight, Zap
} from 'lucide-react';
import { FaDiscord, FaTelegramPlane, FaInstagram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface SupportChannel {
  id: string;
  name: string;
  icon: typeof FaDiscord;
  handle: string;
  link: string;
  badge: string;
  badgeColor: string;
  description: string;
  responseSpeed: string;
  features: string[];
  themeColor: string;
  glowColor: string;
  accentBg: string;
  borderHover: string;
  actionText: string;
}

const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'discord',
    name: 'Discord Community & Tickets',
    icon: FaDiscord,
    handle: 'discord.gg/WKWqt7DGAd',
    link: 'https://discord.gg/WKWqt7DGAd',
    badge: 'Recommended • Fastest Response',
    badgeColor: 'bg-[#5865F2]/20 text-[#8ea1e1] border-[#5865F2]/40',
    description: 'Open instant 1-on-1 private support tickets with our staff, get real-time game delivery assistance, and chat with fellow gamers.',
    responseSpeed: '< 5 Minutes Average Response',
    features: [
      'Private 1-on-1 Staff Tickets',
      'Automated Order & Steam Account Help',
      'Community Announcements & Giveaways',
      'Direct Voice & Text Support'
    ],
    themeColor: '#5865F2',
    glowColor: 'rgba(88, 101, 242, 0.4)',
    accentBg: 'from-[#5865F2]/20 via-[#5865F2]/5 to-transparent',
    borderHover: 'hover:border-[#5865F2]/60 hover:shadow-[0_0_30px_rgba(88,101,242,0.3)]',
    actionText: 'Join Discord Server'
  },
  {
    id: 'telegram',
    name: 'Telegram Direct Support',
    icon: FaTelegramPlane,
    handle: '@valqore_support',
    link: 'https://t.me/+T-Bi0njiKPo2M2U1',
    badge: '24/7 Mobile Support',
    badgeColor: 'bg-[#24A1DE]/20 text-[#68c5f5] border-[#24A1DE]/40',
    description: 'Direct messaging channel for payment verifications, UPI transaction inquiries, fast issue resolution, and live stock updates.',
    responseSpeed: '< 15 Minutes Response',
    features: [
      'Direct 1-on-1 Admin Chat',
      'Instant Payment Receipt Verification',
      'Urgent Account Unlocks',
      'Fast Stock & Price Queries'
    ],
    themeColor: '#24A1DE',
    glowColor: 'rgba(36, 161, 222, 0.4)',
    accentBg: 'from-[#24A1DE]/20 via-[#24A1DE]/5 to-transparent',
    borderHover: 'hover:border-[#24A1DE]/60 hover:shadow-[0_0_30px_rgba(36,161,222,0.3)]',
    actionText: 'Open Telegram'
  },
  {
    id: 'instagram',
    name: 'Instagram Direct (DM)',
    icon: FaInstagram,
    handle: '@valqore.pro',
    link: 'https://www.instagram.com/valqore.pro/',
    badge: 'Social & Brand Help',
    badgeColor: 'bg-[#E1306C]/20 text-[#f5759f] border-[#E1306C]/40',
    description: 'Connect with our official Instagram team for general store inquiries, creator partnerships, feedback, and customer assistance.',
    responseSpeed: '< 1 Hour Response',
    features: [
      'Creator & Collaboration Inquiries',
      'Store Announcements & Highlights',
      'Customer DM Support',
      'Community Updates'
    ],
    themeColor: '#E1306C',
    glowColor: 'rgba(225, 48, 108, 0.4)',
    accentBg: 'from-[#E1306C]/20 via-[#833AB4]/5 to-transparent',
    borderHover: 'hover:border-[#E1306C]/60 hover:shadow-[0_0_30px_rgba(225,48,108,0.3)]',
    actionText: 'Message on Instagram'
  }
];

const QUICK_FAQS = [
  {
    q: 'How do I receive my game after purchasing?',
    a: 'Once your UPI transaction / 12-digit UTR is verified, your order automatically unlocks. Head to your Profile or Library to access your STe-MoN launcher credentials and start playing instantly.'
  },
  {
    q: 'My payment went through, but order status is still pending?',
    a: 'UPI payments usually verify automatically within 10-30 seconds. If your payment receipt takes longer, copy your Order ID (VP-XXXXXXXX) and message us on Discord or Telegram for instant 1-minute manual approval.'
  },
  {
    q: 'How does the STe-MoN launcher access work?',
    a: 'STe-MoN delivers dedicated Steam launcher credentials tied to your purchased games with cloud sync and offline mode support. Check the Steam Launcher guide in your Profile for setup steps.'
  },
  {
    q: 'Can I apply for the Creator Program?',
    a: 'Yes! If you create content on YouTube, Twitch, or Instagram, visit our Creator Guidelines page and submit your application to claim games for your streams and videos.'
  }
];

export const Support = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-12 relative z-10 min-h-screen w-full overflow-x-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] bg-primary/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] bg-[#5865F2]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-[60%] left-[-100px] w-[400px] h-[400px] bg-[#24A1DE]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(220,248,54,0.2)]">
            <Headphones size={15} className="animate-pulse" />
            <span>Valqore Customer Support</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white mb-3 sm:mb-5">
            WE'RE HERE TO <span className="text-primary drop-shadow-[0_0_20px_rgba(220,248,54,0.4)]">HELP YOU</span>
          </h1>
          
          <p className="text-text-secondary text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Need assistance with an order, payment verification, game activation, or launcher setup? Connect with our team directly through your preferred channel.
          </p>

          {/* Real-time Status Indicator Banner */}
          <div className="mt-6 sm:mt-8 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-5 py-3 rounded-2xl bg-cards/60 backdrop-blur-md border border-white/10 shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-bold text-white">Support Status:</span>
              <span className="text-primary font-black uppercase tracking-wider">Online & Active</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock size={15} className="text-primary" />
              <span>Typical Response Time: <strong className="text-white">&lt; 5 mins</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Support Channels Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16"
        >
          {SUPPORT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isCopied = copiedId === channel.id;

            return (
              <motion.div
                key={channel.id}
                variants={itemVariants}
                className={`bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 group relative overflow-hidden ${channel.borderHover}`}
              >
                {/* Top Subtle Gradient Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${channel.accentBg}`}></div>

                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div 
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg"
                      style={{ 
                        backgroundColor: `${channel.themeColor}15`, 
                        color: channel.themeColor,
                        border: `1px solid ${channel.themeColor}30`
                      }}
                    >
                      <Icon size={28} />
                    </div>

                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${channel.badgeColor} tracking-wide text-right`}>
                      {channel.badge}
                    </span>
                  </div>

                  {/* Channel Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-white mb-2 group-hover:text-primary transition-colors">
                    {channel.name}
                  </h3>
                  
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                    {channel.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6 pt-4 border-t border-white/5">
                    {channel.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
                        <Sparkles size={13} className="text-primary shrink-0" />
                        <span className="font-medium text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {/* Speed Badge */}
                  <div className="flex items-center justify-between text-xs text-text-secondary bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Zap size={13} className="text-primary" />
                      Speed:
                    </span>
                    <span className="font-bold text-white">{channel.responseSpeed}</span>
                  </div>

                  {/* Handle & Quick Copy */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-secondary font-mono truncate">
                      {channel.handle}
                    </div>
                    <button
                      onClick={() => handleCopy(channel.id, channel.link, channel.name)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 hover:border-primary/40 transition-all duration-300 flex items-center justify-center shrink-0"
                      title="Copy Link"
                      aria-label="Copy Channel Link"
                    >
                      {isCopied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                    </button>
                  </div>

                  {/* Primary Join / Chat Button */}
                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 text-sm sm:text-base font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-white shadow-lg group/btn font-heading tracking-wide"
                    style={{
                      backgroundColor: channel.themeColor,
                      boxShadow: `0 0 20px ${channel.glowColor}`
                    }}
                  >
                    <span>{channel.actionText}</span>
                    <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Helpful Support Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/10 via-cards/60 to-primary/5 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 sm:p-10 mb-16 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Fast Resolution Tip</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                Have your Order ID (`VP-XXXXXXXX`) Ready
              </h2>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                When reaching out regarding an order or payment verification, sending your 8-digit Order ID and transaction reference helps our team resolve your query in seconds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                to="/profile"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-background font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(220,248,54,0.4)] transition-all duration-300 whitespace-nowrap"
              >
                <span>View My Orders</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
              <HelpCircle size={15} />
              <span>Common Questions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-white">
              FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {QUICK_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-cards/30 hover:bg-cards/60 backdrop-blur-md border border-white/10 hover:border-primary/30 rounded-2xl p-5 sm:p-6 transition-all duration-300"
              >
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-start gap-2.5">
                  <span className="text-primary font-black">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
