import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Shield, Scale, 
  Gamepad2, RefreshCw, Lock, 
  ChevronRight, Ban, ShieldAlert,
  Laptop, WifiOff, AlertTriangle, CheckCircle2,
  HelpCircle, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const originalTitle = document.title;
    document.title = 'Terms of Service & Warranty Policy | VALQORE.PRO';

    const metaDescription = document.querySelector('meta[name="description"]');
    const originalMeta = metaDescription ? metaDescription.getAttribute('content') : null;
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'VALQORE.PRO Terms of Service and Warranty Policy. Learn about account usage rules, offline gameplay requirements, payment verification, and warranty coverage.'
      );
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonicalLink ? canonicalLink.getAttribute('href') : null;
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://valqore.pro/terms-of-service');
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription && originalMeta) {
        metaDescription.setAttribute('content', originalMeta);
      }
      if (canonicalLink && originalCanonical) {
        canonicalLink.setAttribute('href', originalCanonical);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
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
            Last updated: <strong className="text-white">September 2026</strong>. Please read these terms and warranty conditions carefully before accessing or purchasing from VALQORE.PRO.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-text-secondary">
            <span>Related:</span>
            <Link to="/privacy" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">
              Privacy Policy <ChevronRight size={12} />
            </Link>
          </div>
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
              <li><strong className="text-white">Account Usage & Warranty Integration:</strong> Detailed account operation guidelines, offline requirements, and warranty coverage terms are set out in Section 3 below.</li>
            </ul>
          </motion.div>

          {/* 3. Account Usage, Warranty & Support Policy */}
          <motion.div variants={itemVariants} id="warranty-policy" className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">3. Account Usage, Warranty & Support Policy</h2>
                <p className="text-xs text-text-secondary">Mandatory operational rules for Steam accounts, warranty limitations, and customer responsibilities</p>
              </div>
            </div>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
              Please read the following usage rules, offline requirements, and warranty terms carefully before purchasing or accessing a game through VALQORE.PRO:
            </p>

            {/* Subsection A: Account Usage Rules */}
            <div className="mb-8">
              <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Account Usage Rules</span>
              </h3>
              <div className="space-y-3.5">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LogOut size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">Do Not Log Out:</strong>
                    Do not manually log out of the provided Steam account, as this may interrupt your access to the game. If you need to use your personal Steam account, use Steam’s Change Account option instead of removing or resetting the provided account setup.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Laptop size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">Do Not Reset Your PC:</strong>
                    Do not reset your PC, perform a factory reset, or reinstall Windows while using the provided account unless explicitly instructed by our support team.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <WifiOff size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">Stay Offline:</strong>
                    After downloading the game, keep Steam in Offline Mode. Do not switch to Online Mode.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">No Online Play:</strong>
                    Online gameplay and online-only features are not supported. These products are intended for offline, single-player gameplay.
                  </div>
                </div>
              </div>
            </div>

            {/* Subsection B: Warranty & Support Policy */}
            <div className="mb-8">
              <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Warranty & Support Policy</span>
              </h3>
              <div className="space-y-3.5">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">No Warranty for Accidental Logout:</strong>
                    VALQORE.PRO does not provide warranty coverage or guarantee account recovery if you accidentally log out of the provided account.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">No Warranty for PC Reset:</strong>
                    VALQORE.PRO does not provide warranty coverage or guarantee access restoration if you reset your PC, reinstall Windows, or remove the provided account setup.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">Customer Responsibility:</strong>
                    Customers are responsible for following the provided setup instructions and maintaining the required account and offline configuration.
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle size={16} />
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-text-secondary">
                    <strong className="text-white font-semibold block sm:inline sm:mr-1">Support:</strong>
                    If you encounter a problem, contact VALQORE.PRO support. We will review the issue and determine what assistance is available under the applicable product terms.
                  </div>
                </div>
              </div>
            </div>

            {/* Subsection C: Customer Acknowledgment */}
            <div className="pt-2">
              <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Customer Acknowledgment</span>
              </h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-5">
                By purchasing or accessing a game through VALQORE.PRO, you acknowledge that you have read and understood these usage rules and warranty limitations.
              </p>
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-center text-center">
                <span className="font-heading font-black tracking-wider text-primary text-sm sm:text-base md:text-lg drop-shadow-[0_0_15px_rgba(220,248,54,0.3)]">
                  VALQORE.PRO — PLAY MORE. EXPLORE MORE.
                </span>
              </div>
            </div>

            {/* Statutory Consumer Rights Footnote */}
            <p className="text-xs text-text-secondary/70 text-center max-w-2xl mx-auto mt-6 px-2 leading-relaxed">
              Nothing in this policy limits, excludes, or purports to override any mandatory statutory rights or consumer protections that cannot be waived or limited under applicable law.
            </p>
          </motion.div>

          {/* 4. Payments, UPI & Order Verification */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">4. Payments, UPI Verification & Order IDs</h2>
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

          {/* 5. Refunds & Replacement Policy */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">5. Refund & Replacement Policy</h2>
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

          {/* 6. User Conduct & Security */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Ban size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">6. Prohibited Activities</h2>
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

          {/* 7. Limitation of Liability */}
          <motion.div variants={itemVariants} className="bg-cards/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">7. Limitation of Liability</h2>
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
            Questions About Our Terms or Warranty?
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-xl mx-auto mb-6">
            If you have questions regarding legal compliance, payment disputes, account setup, or warranty terms, reach out to our dedicated support team on Discord or Telegram.
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
