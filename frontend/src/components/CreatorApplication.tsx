import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User, Link as LinkIcon, MessageSquare, Mail, Send, Loader2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { FaYoutube as Youtube, FaInstagram as Instagram, FaFacebook as Facebook } from 'react-icons/fa';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
const INSTAGRAM_REGEX = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i;
const FACEBOOK_REGEX = /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i;

export const CreatorApplication = () => {
  const { user, token, loading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [intent, setIntent] = useState('');
  
  // Social Links
  const [youtubeLink, setYoutubeLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [otherLink, setOtherLink] = useState('');

  // Contact Platforms
  const [contactPlatforms, setContactPlatforms] = useState({
    Instagram: false,
    WhatsApp: false,
    Facebook: false,
    Discord: false,
    Telegram: false,
    Email: false
  });
  const [contactValues, setContactValues] = useState({
    Instagram: '',
    WhatsApp: '',
    Facebook: '',
    Discord: '',
    Telegram: ''
  });

  // Email Selection
  const [emailOption, setEmailOption] = useState<'existing' | 'another'>('existing');
  const [customEmail, setCustomEmail] = useState('');

  const isYoutubeInvalid = youtubeLink.length > 0 && !YOUTUBE_REGEX.test(youtubeLink);
  const isInstagramInvalid = instagramLink.length > 0 && !INSTAGRAM_REGEX.test(instagramLink);
  const isFacebookInvalid = facebookLink.length > 0 && !FACEBOOK_REGEX.test(facebookLink);

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal();
      navigate(-1);
    }
  }, [user, loading, navigate, openAuthModal]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !token) return;
      try {
        const response = await axios.get(`${API_URL}/creators/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicationStatus(response.data.status);
      } catch (err) {
        console.error('Failed to fetch application status', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkStatus();
  }, [user, token]);

  if (loading || !user || isCheckingStatus) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleContactPlatformChange = (platform: keyof typeof contactPlatforms) => {
    setContactPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) {
      toast.error('Please provide your name or moniker.');
      return;
    }

    const hasSocialLink = youtubeLink || instagramLink || facebookLink || otherLink;
    if (!hasSocialLink) {
      toast.error('You must provide at least one social media or creator platform where you can promote Valqore.', { duration: 5000 });
      return;
    }

    if (youtubeLink && !YOUTUBE_REGEX.test(youtubeLink)) {
      toast.error('Please provide a valid YouTube link.');
      return;
    }

    if (instagramLink && !INSTAGRAM_REGEX.test(instagramLink)) {
      toast.error('Please provide a valid Instagram link.');
      return;
    }

    if (facebookLink && !FACEBOOK_REGEX.test(facebookLink)) {
      toast.error('Please provide a valid Facebook link.');
      return;
    }

    if (intent.trim().length < 20) {
      toast.error('Please provide a more detailed explanation of why you want to become a creator.');
      return;
    }

    const selectedContacts = Object.entries(contactPlatforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform);
      
    if (selectedContacts.length === 0) {
      toast.error('You must provide at least one contact method.');
      return;
    }

    const finalContactPlatforms: Record<string, string | boolean> = {};
    for (const platform of selectedContacts) {
      if (platform === 'Email') {
        finalContactPlatforms[platform] = true;
      } else {
        const val = contactValues[platform as keyof typeof contactValues];
        if (!val || !val.trim()) {
          toast.error(`Please provide your ${platform} details.`);
          return;
        }
        finalContactPlatforms[platform] = val.trim();
      }
    }

    const finalEmail = user.email;
    
    if (!finalEmail) {
      toast.error('No account email found. Please ensure your account has a valid email.');
      return;
    }


    // Build payload
    const payload = {
      name,
      youtubeLink,
      instagramLink,
      facebookLink,
      otherLink,
      intent,
      contactPlatforms: finalContactPlatforms,
      creatorEmail: finalEmail,
      agreedToGuidelines: true
    };

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/creators/apply`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto bg-cards/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-12 shadow-[0_0_50px_rgba(220,248,54,0.1)] relative overflow-hidden">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
            <Sparkles size={40} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-wider uppercase text-white mb-6">
            Application Submitted
          </h1>
          <p className="text-text-secondary text-lg mb-10">
            Thank you for applying to the Valqore Creator Program! Our team will review your application and contact you via the methods you provided.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary text-background hover:bg-white hover:scale-105 transition-all font-black uppercase px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(220,248,54,0.2)]"
          >
            <ArrowLeft size={20} /> Return Home
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'PENDING') {
    return (
      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto bg-cards/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-12 shadow-[0_0_50px_rgba(220,248,54,0.1)] relative overflow-hidden">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
            <Loader2 size={40} className="text-primary animate-spin" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-wider uppercase text-white mb-6">
            Application Under Review
          </h1>
          <p className="text-text-secondary text-lg mb-10">
            Your Creator Application is currently under review. You cannot submit another application until a decision has been made.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary text-background hover:bg-white hover:scale-105 transition-all font-black uppercase px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(220,248,54,0.2)]"
          >
            <ArrowLeft size={20} /> Return Home
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'APPROVED') {
    return (
      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto bg-cards/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-12 shadow-[0_0_50px_rgba(220,248,54,0.1)] relative overflow-hidden">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
            <Sparkles size={40} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-wider uppercase text-white mb-6">
            Already Approved
          </h1>
          <p className="text-text-secondary text-lg mb-10">
            Your Creator application has already been approved! Welcome to the Valqore Creator Program.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary text-background hover:bg-white hover:scale-105 transition-all font-black uppercase px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(220,248,54,0.2)]"
          >
            <ArrowLeft size={20} /> Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-12 relative z-10 min-h-screen">
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-white font-bold text-sm tracking-wider uppercase mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-wider uppercase text-white mb-4">
            Creator Application
          </h1>
          <p className="text-text-secondary text-lg">
            Complete the form below to apply for the Valqore Creator Program.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-cards/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
            <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span> Basic Information
            </h2>
            <div className="space-y-4 group">
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-widest group-focus-within:text-white transition-colors">
                What should we call you? *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name or Creator Moniker"
                  className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Social Links */}
          <div className="bg-cards/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
            <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span> Social Media / Promotion Platforms
            </h2>
            <p className="text-sm text-text-secondary mb-6 bg-white/5 p-4 rounded-xl border border-white/5 flex gap-3 items-start">
              <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
              You must provide at least one social media or creator platform where you can promote Valqore.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Youtube size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                  <input 
                    type="url" 
                    value={youtubeLink}
                    onChange={e => setYoutubeLink(e.target.value)}
                    placeholder="YouTube Channel Link"
                    className={clsx(
                      "w-full bg-background/50 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-background/80 outline-none transition-all",
                      isYoutubeInvalid ? "border-2 border-red-500" : "border border-white/10 focus:border-red-500"
                    )}
                  />
                </div>
                {isYoutubeInvalid && <p className="text-red-500 text-xs font-bold pl-2 animate-in fade-in">Please enter a valid YouTube URL</p>}
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                  <input 
                    type="url" 
                    value={instagramLink}
                    onChange={e => setInstagramLink(e.target.value)}
                    placeholder="Instagram Account Link"
                    className={clsx(
                      "w-full bg-background/50 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-background/80 outline-none transition-all",
                      isInstagramInvalid ? "border-2 border-red-500" : "border border-white/10 focus:border-pink-500"
                    )}
                  />
                </div>
                {isInstagramInvalid && <p className="text-red-500 text-xs font-bold pl-2 animate-in fade-in">Please enter a valid Instagram URL</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input 
                    type="url" 
                    value={facebookLink}
                    onChange={e => setFacebookLink(e.target.value)}
                    placeholder="Facebook Page Link"
                    className={clsx(
                      "w-full bg-background/50 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-background/80 outline-none transition-all",
                      isFacebookInvalid ? "border-2 border-red-500" : "border border-white/10 focus:border-blue-500"
                    )}
                  />
                </div>
                {isFacebookInvalid && <p className="text-red-500 text-xs font-bold pl-2 animate-in fade-in">Please enter a valid Facebook URL</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input 
                    type="url" 
                    value={otherLink}
                    onChange={e => setOtherLink(e.target.value)}
                    placeholder="Other Platform Link (e.g. Twitch, TikTok)"
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Intent */}
          <div className="bg-cards/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
            <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span> Creator Intent
            </h2>
            <div className="space-y-4 group">
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-widest group-focus-within:text-white transition-colors">
                Why do you want to become a Valqore Creator, and what would you like to do for Valqore? What can we build together? *
              </label>
              <textarea 
                value={intent}
                onChange={e => setIntent(e.target.value)}
                placeholder="Share your vision for our partnership..."
                className="w-full bg-background/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all min-h-[150px] resize-y"
                required
              />
            </div>
          </div>

          {/* Section 4: Contact */}
          <div className="bg-cards/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
            <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span> Contact Platforms
            </h2>
            <p className="text-sm text-text-secondary mb-6">Select all the ways our team can reach out to you.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {Object.keys(contactPlatforms).map((platform) => (
                <label 
                  key={platform} 
                  className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-300",
                    contactPlatforms[platform as keyof typeof contactPlatforms] 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background/50 border-white/5 text-text-secondary hover:border-white/20 hover:text-white"
                  )}
                >
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={contactPlatforms[platform as keyof typeof contactPlatforms]}
                    onChange={() => handleContactPlatformChange(platform as keyof typeof contactPlatforms)}
                  />
                  <MessageSquare size={24} className="mb-2 opacity-70" />
                  <span className="font-bold text-sm">{platform}</span>
                </label>
              ))}
            </div>

            {/* Conditional Inputs for Contact Platforms */}
            <div className="space-y-4 mb-8">
              {contactPlatforms.Instagram && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={contactValues.Instagram} 
                    onChange={e => setContactValues(prev => ({...prev, Instagram: e.target.value}))} 
                    placeholder="Instagram Handle (e.g. @username)" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              )}
              {contactPlatforms.WhatsApp && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={contactValues.WhatsApp} 
                    onChange={e => setContactValues(prev => ({...prev, WhatsApp: e.target.value}))} 
                    placeholder="WhatsApp Number (with country code)" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              )}
              {contactPlatforms.Facebook && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={contactValues.Facebook} 
                    onChange={e => setContactValues(prev => ({...prev, Facebook: e.target.value}))} 
                    placeholder="Facebook Profile Link or Name" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              )}
              {contactPlatforms.Discord && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={contactValues.Discord} 
                    onChange={e => setContactValues(prev => ({...prev, Discord: e.target.value}))} 
                    placeholder="Discord Username (e.g. user#1234)" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              )}
              {contactPlatforms.Telegram && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={contactValues.Telegram} 
                    onChange={e => setContactValues(prev => ({...prev, Telegram: e.target.value}))} 
                    placeholder="Telegram Username (@username) or Number" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:bg-background/80 outline-none transition-all"
                  />
                </div>
              )}
            </div>
            
            {/* Section 5: Creator Email (Existing Account Email) */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-heading font-bold text-white mb-2">Creator Account Email</h3>
              <p className="text-sm text-text-secondary mb-4">Official creator communications and approval decisions will be sent to your account email:</p>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{user.email || 'Not provided'}</div>
                  <div className="text-xs text-text-secondary">Primary account email</div>
                </div>
              </div>
            </div>
          </div>


          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-background font-black text-lg py-5 rounded-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary shadow-[0_0_20px_rgba(220,248,54,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] uppercase tracking-wide"
          >
            {isSubmitting ? (
              <><Loader2 size={24} className="animate-spin" /> Submitting Application...</>
            ) : (
              <>Submit Application <Send size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
