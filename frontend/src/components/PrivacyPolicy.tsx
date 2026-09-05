import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Eye, Database, 
  Server, UserCheck, Bell, ChevronRight,
  FileCheck, KeyRound, Smartphone, HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-12 relative z-10 min-h-screen w-full overflow-x-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[850px] h-[350px] bg-primary/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute top-[40%] left-[-100px] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(220,248,54,0.2)]">
            <Lock size={15} />
            <span>Data Security & Trust</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white mb-3 sm:mb-5">
            PRIVACY <span className="text-primary drop-shadow-[0_0_20px_rgba(220,248,54,0.4)]">POLICY</span>
          </h1>

          <p className="text-text-secondary text-xs sm:text-base max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Last updated: <strong className="text-white">September 2026</strong>. Learn how VALQORE.PRO securely collects, processes, and protects your personal information.
          </p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8 mb-16"
        >
          {/* 1. Overview Card */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">1. Our Commitment to Privacy</h2>
                <p className="text-xs text-text-secondary">Your data privacy is our highest priority</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              At <strong className="text-white">VALQORE.PRO</strong>, we value the trust you place in us when purchasing games and accessing our services. This Privacy Policy outlines what data we collect, why we need it, and the industry-standard security protocols we use to ensure your data is never sold, traded, or improperly shared.
            </p>
          </motion.div>

          {/* 2. Information We Collect */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">2. Information We Collect</h2>
                <p className="text-xs text-text-secondary">Data gathered during registration, checkout, and usage</p>
              </div>
            </div>
            <ul className="space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5">
              <li><strong className="text-white">Account Information:</strong> When you register, we collect your username, email address, and encrypted password hash (via <code className="text-primary font-mono text-xs">bcryptjs</code>).</li>
              <li><strong className="text-white">Transaction & Payment Data:</strong> When purchasing, we record your Order ID (<code className="text-primary font-mono text-xs">VP-XXXXXXXX</code>), items purchased, order totals, and the 12-digit bank UTR reference number for automatic UPI reconciliation. We do <em>not</em> store bank account login details or debit/credit card pins.</li>
              <li><strong className="text-white">Launcher Credentials:</strong> Auto-generated STe-MoN launcher usernames and encrypted access tokens associated with your purchased games.</li>
              <li><strong className="text-white">Creator Applications:</strong> Information voluntarily submitted when applying for the Creator Program (channel URLs, content details, and social links).</li>
            </ul>
          </motion.div>

          {/* 3. How We Use Your Information */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <FileCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">3. How We Use Your Data</h2>
                <p className="text-xs text-text-secondary">Purpose of data collection</p>
              </div>
            </div>
            <div className="space-y-3 text-text-secondary text-sm sm:text-base leading-relaxed">
              <p>We use your information strictly for legitimate operational purposes:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>To process and instantly fulfill your digital game orders through the STe-MoN launcher.</li>
                <li>To verify bank UPI payment receipts and match 12-digit reference UTR numbers.</li>
                <li>To maintain your game library, order history, and discount coupon validations.</li>
                <li>To send critical transactional notifications (such as OTP logins and account security alerts).</li>
                <li>To prevent fraudulent chargebacks, double-spending, or abusive bot attacks.</li>
              </ul>
            </div>
          </motion.div>

          {/* 4. Data Security & Storage */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <KeyRound size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">4. Encryption & Data Security</h2>
                <p className="text-xs text-text-secondary">Enterprise-grade security standards</p>
              </div>
            </div>
            <div className="space-y-3 text-text-secondary text-sm sm:text-base leading-relaxed">
              <p>
                We implement robust security measures to safeguard your personal information:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm list-none pt-2">
                <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Bcrypt Hashing:</strong> Passwords are one-way hashed with salted bcrypt rounds.</span></li>
                <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">SSL / TLS Encryption:</strong> All client-server traffic is encrypted using HTTPS.</span></li>
                <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Isolated Database:</strong> PostgreSQL runs in a firewalled environment on private VPS networks.</span></li>
                <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span><strong className="text-white">Stateless JWTs:</strong> Secure JSON Web Tokens with strict expiration limits.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* 5. Third-Party Sharing & Cookies */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <HeartHandshake size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">5. Third-Party Services & No Selling Policy</h2>
                <p className="text-xs text-text-secondary">We never sell your personal information</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              <strong className="text-white">VALQORE.PRO will NEVER sell, rent, or monetize your personal information to third-party advertisers.</strong> We only interface with essential infrastructure providers required to operate our service (such as Google OAuth APIs for payment receipts and Resend for transactional email delivery).
            </p>
          </motion.div>

          {/* 6. User Rights & Account Deletion */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">6. Your Rights & Data Requests</h2>
                <p className="text-xs text-text-secondary">Full control over your personal data</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              You have the right to access, export, modify, or permanently delete your account data at any time. If you wish to request complete account or data deletion, simply contact our support team on Discord or Telegram.
            </p>
          </motion.div>
        </motion.div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/20 via-cards/60 to-primary/5 backdrop-blur-xl border border-primary/30 rounded-3xl p-6 sm:p-10 text-center shadow-[0_0_30px_rgba(220,248,54,0.1)]"
        >
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white mb-2">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-xl mx-auto mb-6">
            Our team is committed to transparency. If you have any questions or data inquiries, reach out to us directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/support"
              className="inline-flex items-center gap-2 bg-primary text-background font-bold text-sm px-8 py-3.5 rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(220,248,54,0.4)] transition-all duration-300 font-heading tracking-wide"
            >
              <span>Contact Support</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
