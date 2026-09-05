import { motion } from 'framer-motion';
import { 
  FileText, Shield, Scale, AlertCircle, 
  Gamepad2, UserCheck, RefreshCw, Lock, 
  HelpCircle, ChevronRight, Ban, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
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
      <div className="absolute top-[45%] right-[-100px] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(220,248,54,0.2)]">
            <Scale size={15} />
            <span>Legal & Agreements</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white mb-3 sm:mb-5">
            TERMS OF <span className="text-primary drop-shadow-[0_0_20px_rgba(220,248,54,0.4)]">SERVICE</span>
          </h1>

          <p className="text-text-secondary text-xs sm:text-base max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Last updated: <strong className="text-white">September 2026</strong>. Please read these terms carefully before accessing or purchasing from VALQORE.PRO.
          </p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8 mb-16"
        >
          {/* 1. Introduction Card */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">1. Acceptance of Terms</h2>
                <p className="text-xs text-text-secondary">Binding legal contract between you and VALQORE.PRO</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              By accessing, browsing, creating an account, or purchasing digital goods on <strong className="text-white">VALQORE.PRO</strong>, you agree to be bound by these Terms of Service, our Privacy Policy, and applicable community guidelines. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.
            </p>
          </motion.div>

          {/* 2. Digital Accounts & Launcher Delivery */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">2. Digital Game & Launcher Access</h2>
                <p className="text-xs text-text-secondary">Fulfillment mechanism and access privileges</p>
              </div>
            </div>
            <ul className="space-y-3 text-text-secondary text-sm sm:text-base list-disc pl-5">
              <li><strong className="text-white">Fulfillment Architecture:</strong> Games purchased through Valqore are delivered digitally via the STe-MoN desktop launcher system.</li>
              <li><strong className="text-white">License & Access:</strong> Access credentials provided are strictly for personal use by the purchasing account holder. Sharing, renting, reselling, or redistributing account credentials without express written permission is strictly prohibited.</li>
              <li><strong className="text-white">Rental Titles:</strong> Rental game access is granted for the specific period purchased. Upon expiration, access automatically concludes unless renewed.</li>
            </ul>
          </motion.div>

          {/* 3. Payments, UPI & Order Verification */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">3. Payments, UPI Verification & Order IDs</h2>
                <p className="text-xs text-text-secondary">Transaction integrity and automated verification</p>
              </div>
            </div>
            <div className="space-y-3 text-text-secondary text-sm sm:text-base leading-relaxed">
              <p>
                All transactions on VALQORE.PRO are processed in Indian Rupees (₹) via Peer-to-Peer UPI QR transfers and verified using our automated payment reconciliation system (matching the 12-digit bank UTR or Order ID reference <code className="text-primary bg-white/5 px-1.5 py-0.5 rounded font-mono">VP-XXXXXXXX</code>).
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Orders are confirmed immediately upon verified bank receipt match or manual admin approval.</li>
                <li>Users are responsible for ensuring accurate entry of the 12-digit bank UTR reference number.</li>
                <li>Submitting fraudulent, recycled, or fabricated transaction references is a violation of our terms and will lead to permanent account suspension.</li>
              </ul>
            </div>
          </motion.div>

          {/* 4. Refunds & Replacement Policy */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">4. Refund & Replacement Policy</h2>
                <p className="text-xs text-text-secondary">Digital goods delivery guarantees</p>
              </div>
            </div>
            <div className="space-y-3 text-text-secondary text-sm sm:text-base leading-relaxed">
              <p>
                Due to the immediate digital fulfillment nature of gaming credentials and launcher access:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong className="text-white">Non-Refundable Once Delivered:</strong> Once digital game credentials have been issued and unlocked in your Library/Profile, orders are generally non-refundable.</li>
                <li><strong className="text-white">Technical Replacement Guarantee:</strong> If an account credential experiences technical errors, authentication lockouts, or delivery delays on our end, our support team will provide a 100% replacement or fix within 24 hours.</li>
                <li><strong className="text-white">Duplicate Payments:</strong> Accidental duplicate payments for the same order will be refunded in full upon verification with our support team on Discord or Telegram.</li>
              </ul>
            </div>
          </motion.div>

          {/* 5. User Conduct & Security */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Ban size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">5. Prohibited Activities</h2>
                <p className="text-xs text-text-secondary">Community protection and account safety</p>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-text-secondary text-xs sm:text-sm list-none">
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Attempting to alter account security credentials or passwords.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Exploiting vulnerabilities, botting, or scraping website data.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Reselling or commercial distribution of private game access.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">✦</span> <span>Filing fraudulent bank chargebacks or payment disputes.</span></li>
            </ul>
          </motion.div>

          {/* 6. Limitation of Liability */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">6. Limitation of Liability</h2>
                <p className="text-xs text-text-secondary">Service availability and third-party platforms</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              VALQORE.PRO is provided on an "as is" and "as available" basis. While we strive for 99.9% uptime and immediate delivery, we are not liable for third-party publisher maintenance, Steam network outages, or hardware incompatibilities on the user's PC.
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
            Questions About Our Terms?
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-xl mx-auto mb-6">
            If you have questions regarding legal compliance, payment disputes, or order terms, reach out to our dedicated support team on Discord or Telegram.
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
