import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Shield, Globe, Clock, ArrowLeft, Play, ShoppingCart, Gift, CheckCircle2, Package, FileText, Gamepad2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getYouTubeVideoId } from '../utils/youtube';
import { getImageUrl } from '../utils/image';


const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

const BundlePosterCarousel = ({ posters }: { posters: { url: string; title: string; slug?: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (posters.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [posters.length, isPaused]);

  if (posters.length === 0) return null;

  const currentPoster = posters[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden bg-cards/60 border border-white/10 shadow-2xl backdrop-blur-md group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-video overflow-hidden bg-black/80 flex items-center justify-center">
        {/* Full Landscape Art Images */}
        {posters.map((poster, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
              idx === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Ambient Blurred Background (fills borders seamlessly if image is not exactly 16:9) */}
            <img
              src={getImageUrl(poster.url) || '/images/hero-artwork.png'}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
            />

            {/* Crisp Foreground Artwork - fits properly without cropping any edges or logos */}
            <img
              src={getImageUrl(poster.url) || '/images/hero-artwork.png'}
              alt={poster.title}
              className="relative w-full h-full object-contain transition-all duration-500"
            />
          </div>
        ))}

        {/* Subtle Bottom Gradient Overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-[1]" />

        {/* Navigation Arrows (visible on hover) */}
        {posters.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
              title="Previous poster"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
              title="Next poster"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Bottom Title & Indicators */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 z-10">
          <div className="min-w-0">
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-0.5">
              Included Title
            </span>
            {currentPoster.slug ? (
              <Link
                to={`/game/${currentPoster.slug}`}
                className="text-white hover:text-[#A855F7] font-heading font-black text-base sm:text-xl truncate drop-shadow-md block transition-colors"
              >
                {currentPoster.title}
              </Link>
            ) : (
              <h3 className="text-white font-heading font-black text-base sm:text-xl truncate drop-shadow-md">
                {currentPoster.title}
              </h3>
            )}
          </div>

          {/* Dots Indicator */}
          {posters.length > 1 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {posters.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex 
                      ? 'w-6 bg-[#A855F7]' 
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  title={`Go to game ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GameDetails = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  const { addToCart, isInCart, isOwned } = useCart();
  const { user, token, openAuthModal } = useAuth();
  
  const { id } = useParams();
  const navigate = useNavigate();

  const game = games.find(g => g.id === id || g.slug === id);
  const hasTrailer = !!(game?.trailerUrl && getYouTubeVideoId(game.trailerUrl));
  const [activeMedia, setActiveMedia] = useState<number>(hasTrailer ? -1 : 0);

  // Real reaction state
  const [userReaction, setUserReaction] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [dislikesCount, setDislikesCount] = useState<number>(0);
  const [isReacting, setIsReacting] = useState(false);

  // Creator status state
  const [creatorStatus, setCreatorStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      const fetchCreatorStatus = async () => {
        try {
          const res = await axios.get(`${API_URL}/creators/status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCreatorStatus(res.data.status);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCreatorStatus();
    }
  }, [user, token]);

  useEffect(() => {
    const createdElements: HTMLElement[] = [];

    if (game) {
      const originalTitle = document.title;
      document.title = `${game.title} | VALQORE`;

      const gameImage = game.coverImage ? getImageUrl(game.coverImage) : 'https://valqore.pro/images/hero-artwork.png';
      const gameDesc = `Check out ${game.title} on VALQORE!`;
      const canonicalUrl = `https://valqore.pro/game/${game.slug || game.id}`;

      const setMetaTag = (selector: string, attribute: string, value: string) => {
        let el = document.querySelector(selector);
        let created = false;
        if (!el) {
          el = document.createElement('meta');
          const [key, val] = selector.replace(/[\[\]"]/g, '').split('=');
          el.setAttribute(key, val);
          document.head.appendChild(el);
          created = true;
        }
        el.setAttribute(attribute, value);
        if (created) createdElements.push(el as HTMLElement);
      };

      const setLinkTag = (rel: string, href: string) => {
        let el = document.querySelector(`link[rel="${rel}"]`);
        let created = false;
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('rel', rel);
          document.head.appendChild(el);
          created = true;
        }
        el.setAttribute('href', href);
        if (created) createdElements.push(el as HTMLElement);
      };

      setMetaTag('meta[name="description"]', 'content', gameDesc);
      
      setMetaTag('meta[property="og:title"]', 'content', `${game.title} - VALQORE`);
      setMetaTag('meta[property="og:description"]', 'content', gameDesc);
      setMetaTag('meta[property="og:image"]', 'content', gameImage);
      setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
      setMetaTag('meta[property="og:type"]', 'content', 'website');

      setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMetaTag('meta[name="twitter:title"]', 'content', `${game.title} - VALQORE`);
      setMetaTag('meta[name="twitter:description"]', 'content', gameDesc);
      setMetaTag('meta[name="twitter:image"]', 'content', gameImage);
      setMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);

      setLinkTag('canonical', canonicalUrl);

      let jsonLdScript = document.querySelector('script[type="application/ld+json"][id="product-jsonld"]');
      let jsonLdCreated = false;
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.setAttribute('type', 'application/ld+json');
        jsonLdScript.setAttribute('id', 'product-jsonld');
        document.head.appendChild(jsonLdScript);
        jsonLdCreated = true;
      }
      
      const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": game.title,
        "image": gameImage,
        "description": gameDesc,
        "url": canonicalUrl,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": game.price
        }
      };
      jsonLdScript.textContent = JSON.stringify(jsonLdData);
      if (jsonLdCreated) createdElements.push(jsonLdScript as HTMLElement);

      return () => {
        document.title = originalTitle;
        createdElements.forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      };
    } else {
      document.title = 'VALQORE';
    }
  }, [game]);


  useEffect(() => {
    if (game?.id) {
      // Fetch public reactions or user reaction if logged in
      const fetchReaction = async () => {
        try {
          if (token) {
            const res = await axios.get(`${API_URL}/games/${game.id}/reaction`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserReaction(res.data.userReaction);
            setLikesCount(res.data.likesCount || 0);
            setDislikesCount(res.data.dislikesCount || 0);
          } else {
            const res = await axios.get(`${API_URL}/games/${game.id}`);
            setLikesCount(res.data.likesCount || 0);
            setDislikesCount(res.data.dislikesCount || 0);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchReaction();
    }
  }, [game?.id, token]);


  const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
    if (!user || !token) {
      toast.error('Please log in to like or dislike this game');
      openAuthModal();
      return;
    }

    if (isReacting || !game?.id) return;
    setIsReacting(true);

    try {
      const res = await axios.post(`${API_URL}/games/${game.id}/react`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserReaction(res.data.userReaction);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
      if (res.data.userReaction === type) {
        toast.success(type === 'LIKE' ? 'Liked!' : 'Disliked');
      } else {
        toast.success('Reaction removed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update reaction');
    } finally {
      setIsReacting(false);
    }
  };



  const inCart = game ? isInCart(game.id) : false;

  const handleAddToCart = () => {
    if (game && !inCart) {
      addToCart(game.id);
    } else {
      navigate('/cart');
    }
  };



  const handleShareGame = async () => {
    if (!game) return;

    // Use the backend share-meta endpoint which guarantees Instagram, WhatsApp, Discord, iMessage crawlers get the exact poster image
    const apiUrl = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';
    const shareUrl = `${apiUrl}/games/share-meta/${game.slug || game.id}`;

    const shareData = {
      title: game.title,
      text: `Check out ${game.title} on VALQORE for ${formatPrice(game.price)}!`,
      url: shareUrl,
    };

    const copyToClipboardFallback = (text: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          toast.success('Game link copied to clipboard!');
        }).catch(() => {
          toast.error('Failed to copy link');
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast.success('Game link copied to clipboard!');
          } else {
            toast.error('Failed to copy link');
          }
        } catch (err) {
          toast.error('Failed to copy link');
        }
        document.body.removeChild(textArea);
      }
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboardFallback(shareUrl);
        }
      }
    } else {
      copyToClipboardFallback(shareUrl);
    }
  };

  useEffect(() => {
    setActiveMedia(hasTrailer ? -1 : 0);
  }, [game?.id, hasTrailer]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10" id="game-details">
        <div className="container mx-auto max-w-[1400px] animate-pulse">
          <div className="flex flex-col gap-6">
            <div className="w-20 h-6 bg-white/5 rounded"></div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary rotate-45 flex-shrink-0"></div>
              <div className="h-8 w-64 bg-white/10 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="w-full aspect-video bg-white/5 rounded-2xl border border-white/5"></div>
                <div className="flex gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-1/4 aspect-video bg-white/5 rounded-xl border border-white/5"></div>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <div className="w-full aspect-[3/4] bg-white/5 rounded-2xl hidden lg:block border border-white/5"></div>
                <div className="bg-cards/40 p-6 rounded-2xl space-y-4 border border-white/5">
                  <div className="h-8 w-32 bg-white/10 rounded mb-6"></div>
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                  <div className="h-12 w-full bg-white/10 rounded-xl mt-8"></div>
                  <div className="h-12 w-full bg-white/10 rounded-xl mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold mb-4 text-primary">Game Not Found</h1>
          <Link to="/" className="text-white hover:text-primary transition-colors">Return to Home</Link>
        </div>
      </div>
    );
  }

  const screenshots = game.screenshots ? game.screenshots.split(',').map(s => s.trim()) : [];
  const platformsList = Array.isArray(game.platforms) 
    ? game.platforms 
    : (typeof game.platforms === 'string' ? (game.platforms as string).split(',').map(p => p.trim()) : ['PC']);

  // DEDICATED BUNDLE PAGE REDESIGN
  if (game.isBundle) {
    const hasSavings = game.steamPrice != null && game.steamPrice > game.price && game.price > 0;
    const savingsPercent = hasSavings ? Math.round(((game.steamPrice! - game.price) / game.steamPrice!) * 100) : 0;
    const gamesList = game.bundleGames 
      ? game.bundleGames.split(/[,+]/).map(g => g.trim()).filter(Boolean)
      : [];

    // Match games with website catalog to get real posters
    const matchedWebsiteGames = gamesList.map(item => {
      return games.find(g => 
        g.id === item || 
        g.title.toLowerCase() === item.toLowerCase() ||
        (g.slug && g.slug.toLowerCase() === item.toLowerCase())
      );
    }).filter(Boolean) as typeof games;

    // Build included games posters list for auto-switching carousel
    // Use the game's No. 2 media image (first landscape screenshot/artwork), falling back to coverImage
    const bundlePosters: { url: string; title: string; slug?: string }[] = matchedWebsiteGames
      .map(bg => {
        const bgScreenshots = bg.screenshots 
          ? bg.screenshots.split(',').map(s => s.trim()).filter(Boolean) 
          : [];
        // No. 2 media image (first landscape artwork/screenshot), fallback to coverImage
        const heroArt = bgScreenshots[0] || bg.coverImage;
        return {
          url: heroArt,
          title: bg.title,
          slug: bg.slug || bg.id
        };
      })
      .filter(p => !!p.url);

    if (bundlePosters.length === 0) {
      if (screenshots.length > 0) {
        screenshots.forEach((url, idx) => {
          bundlePosters.push({
            url,
            title: gamesList[idx] || `Game #${idx + 1}`,
            slug: undefined
          });
        });
      } else if (game.coverImage) {
        bundlePosters.push({
          url: game.coverImage,
          title: game.title,
          slug: undefined
        });
      }
    }

    return (
      <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10" id="bundle-details">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group cursor-pointer"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold tracking-wider uppercase text-sm">Back</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  <Package size={14} />
                  <span>Bundle Pack</span>
                </span>
                {hasSavings && (
                  <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 text-xs font-black rounded-lg shadow-[0_0_12px_rgba(220,248,54,0.2)]">
                    SAVE {savingsPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white">
                {game.title}
              </h1>
            </div>

            {/* Two Column Layout: Left 68% / Right 32% */}
            <div className="flex flex-col lg:flex-row gap-8 mt-2">
              
              {/* Left Column: Poster Carousel + Bundle Description */}
              <div className="w-full lg:w-[68%] flex flex-col gap-8">

                {/* Auto-Switching Included Games Poster */}
                <BundlePosterCarousel posters={bundlePosters} />

                {/* Bundle Description Section */}
                <div className="bg-cards/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-white/10 pb-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-heading font-black text-white">Bundle Description</h2>
                  </div>

                  {game.description ? (
                    <div className="text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line font-normal">
                      {game.description}
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary leading-relaxed space-y-2">
                      <p>
                        Get the complete collection with the <strong className="text-white">{game.title}</strong> pack. This bundle delivers full digital access to all included games at a major discount.
                      </p>
                      <p>
                        All games are provided with instant digital delivery, verified accounts, and 24/7 dedicated support.
                      </p>
                    </div>
                  )}

                  {/* Included Games Breakdown */}
                  {gamesList.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-white/10">
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                        Games Included in this Pack:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {matchedWebsiteGames.length > 0 ? (
                          matchedWebsiteGames.map((gItem, idx) => (
                            <Link 
                              to={`/game/${gItem.slug || gItem.id}`}
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#A855F7]/40 hover:bg-white/[0.06] transition-all group/item"
                            >
                              <img
                                src={getImageUrl(gItem.coverImage) || '/images/hero-artwork.png'}
                                alt={gItem.title}
                                className="w-10 h-12 object-cover rounded-lg flex-shrink-0 border border-white/10 group-hover/item:scale-105 transition-transform"
                              />
                              <span className="text-sm font-bold text-white truncate group-hover/item:text-[#A855F7] transition-colors">
                                {gItem.title}
                              </span>
                            </Link>
                          ))
                        ) : (
                          gamesList.map((gName, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                            >
                              <div className="w-6 h-6 rounded-lg bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center text-xs font-black flex-shrink-0">
                                {idx + 1}
                              </div>
                              <span className="text-sm font-bold text-white truncate">{gName}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Details / Guarantees */}
                <div className="bg-cards/30 border border-white/5 rounded-2xl p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Shield size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Instant Delivery</h4>
                        <p className="text-text-secondary text-xs leading-relaxed">All bundle games delivered immediately to your account & email.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Globe size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Global Region Free</h4>
                        <p className="text-text-secondary text-xs leading-relaxed">Play seamlessly from any country without VPN restrictions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><CheckCircle2 size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Lifetime Guarantee</h4>
                        <p className="text-text-secondary text-xs leading-relaxed">100% verified working digital copies with permanent ownership.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Buy Box & Specs */}
              <div className="w-full lg:w-[32%] flex flex-col gap-6">

                {/* Buy Box */}
                <div className="bg-cards border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 sticky top-28">
                  {/* Subtle Background Art */}
                  <div
                    className="absolute inset-0 z-0 opacity-25 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${getImageUrl(game.coverImage)})` }}
                  />
                  <div className="absolute inset-0 z-0 bg-gradient-to-t from-cards via-cards/90 to-cards/70 pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-[#A855F7]/20 border border-[#A855F7]/30 text-[#A855F7] text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Package size={12} /> Bundle
                      </span>
                      <span className="text-xs text-text-secondary font-bold">
                        {platformsList.join(', ')}
                      </span>
                    </div>

                    {/* Price Section */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Total Price</span>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl sm:text-4xl font-heading font-black text-primary">
                          {formatPrice(game.price)}
                        </span>
                        {hasSavings && game.steamPrice && (
                          <>
                            <span className="text-base text-text-secondary/80 line-through">
                              {formatPrice(game.steamPrice)}
                            </span>
                            <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-black px-2 py-0.5 rounded shadow">
                              SAVE {savingsPercent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isOwned(game.id) ? (
                      <div className="flex flex-col gap-2">
                        <Link 
                          to="/library"
                          className="w-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-heading font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                          <CheckCircle2 size={18} className="text-emerald-400" />
                          Already In Library
                        </Link>
                      </div>
                    ) : game.outOfStock ? (
                      <button 
                        disabled
                        className="w-full bg-red-600/50 text-white/50 cursor-not-allowed font-black text-sm px-4 py-3.5 rounded-xl uppercase tracking-wider"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <button 
                          onClick={() => {
                            if (!inCart) addToCart(game.id);
                            navigate('/cart');
                          }}
                          className="w-full bg-primary hover:bg-white text-background font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(220,248,54,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-pointer active:scale-95"
                        >
                          <ShoppingCart size={16} />
                          <span>Buy Now</span>
                        </button>

                        <button 
                          onClick={() => addToCart(game.id)}
                          disabled={inCart}
                          className={`w-full font-bold text-xs py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            inCart
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle2 size={14} className="text-primary" />
                              <span>In Cart</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={14} />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Secure Payments Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Secure Checkout</span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-10 rounded bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="UPI">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-2.5 object-contain" />
                        </div>
                        <div className="h-6 w-10 rounded bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="USDT">
                          <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032" alt="USDT" className="h-3 object-contain" />
                        </div>
                      </div>
                    </div>

                    {/* Bundle Specs */}
                    <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-text-secondary">Publisher / Dev</span>
                        <span className="font-bold text-white text-right">{game.developer}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-text-secondary">Release Date</span>
                        <span className="font-bold text-white text-right">{new Date(game.releaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-text-secondary">Product Type</span>
                        <span className="font-bold text-[#A855F7] text-right">Game Bundle</span>
                      </div>
                      <div className="flex justify-between items-start py-1">
                        <span className="text-text-secondary">Platforms</span>
                        <div className="flex flex-col items-end gap-1">
                          {platformsList.map(p => (
                            <span key={p} className="text-white text-right font-bold">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Social Reactions & Share */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleReaction('LIKE')}
                          disabled={isReacting}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold cursor-pointer ${
                            userReaction === 'LIKE' 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'bg-white/5 border-white/10 hover:border-primary/40 text-text-secondary hover:text-white'
                          }`}
                        >
                          <ThumbsUp size={14} className={userReaction === 'LIKE' ? 'fill-primary/30' : ''} />
                          <span>{likesCount}</span>
                        </button>
                        <button 
                          onClick={() => handleReaction('DISLIKE')}
                          disabled={isReacting}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold cursor-pointer ${
                            userReaction === 'DISLIKE' 
                              ? 'bg-red-500/20 border-red-500 text-red-400' 
                              : 'bg-white/5 border-white/10 hover:border-red-500/40 text-text-secondary hover:text-white'
                          }`}
                        >
                          <ThumbsDown size={14} className={userReaction === 'DISLIKE' ? 'fill-red-500/30' : ''} />
                          <span>{dislikesCount}</span>
                        </button>
                      </div>
                      <button 
                        onClick={handleShareGame}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                        title="Share bundle"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* Related Bundles */}
            {(() => {
              const otherBundles = games.filter(g => g.id !== game.id && g.isBundle).slice(0, 4);
              const relatedList = otherBundles.length > 0 
                ? otherBundles 
                : games.filter(g => g.id !== game.id && !g.isGiveaway).slice(0, 4);

              if (relatedList.length === 0) return null;

              return (
                <div className="col-span-full mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#A855F7] rotate-45"></div>
                      <h2 className="text-xl font-heading font-black tracking-widest uppercase text-white">
                        {otherBundles.length > 0 ? 'More Bundles & Special Packs' : 'You May Also Like'}
                      </h2>
                    </div>
                    <Link to="/store" className="text-xs font-bold text-primary hover:text-white transition-colors">
                      Explore Store &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {relatedList.map(relGame => (
                      <Link 
                        to={`/game/${relGame.slug || relGame.id}`} 
                        key={relGame.id}
                        className="group bg-cards/40 hover:bg-cards/80 border border-white/10 hover:border-[#A855F7]/50 rounded-xl p-2.5 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col cursor-pointer"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-2.5 bg-black/40">
                          <img 
                            src={relGame.coverImage ? getImageUrl(relGame.coverImage) : '/images/hero-artwork.png'} 
                            alt={relGame.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-black/80 text-[#A855F7] border border-[#A855F7]/40 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            Bundle
                          </div>
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate mb-1">
                          {relGame.title}
                        </h3>
                        <p className="text-text-secondary text-xs truncate mb-2">{relGame.bundleGames || relGame.developer}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2">
                          <span className="text-base font-heading font-black text-primary">{formatPrice(relGame.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 md:px-6 lg:px-12 relative z-10" id="game-details">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-6">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors w-fit -mb-2 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wider uppercase text-sm">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-primary rotate-45 flex-shrink-0"></div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-normal text-white">
              {game.title}
            </h1>
          </div>


          {/* EPIC GAMES LAYOUT: Top Split (70/30) */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">

            {/* Left Column (70%): Media Carousel */}
            <div className="w-full lg:w-[70%] flex flex-col gap-4">
              {/* Main Player Area */}
              <div className="w-full aspect-video bg-black/80 rounded-xl border border-white/10 overflow-hidden relative shadow-2xl">
                {activeMedia === -1 && hasTrailer ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(game.trailerUrl!)}?autoplay=1&mute=1`}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : activeMedia >= 0 && activeMedia < screenshots.length ? (
                  <img 
                    src={getImageUrl(screenshots[activeMedia])} 
                    alt="Gameplay Screenshot" 
                    className="w-full h-full object-contain bg-black/90" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-white/30 bg-cards">
                    <span className="text-xl font-bold">No Media Available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {hasTrailer && (
                  <div 
                    onClick={() => setActiveMedia(-1)}
                    className={`relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${activeMedia === -1 ? 'border-primary shadow-[0_0_15px_rgba(220,248,54,0.3)]' : 'border-transparent hover:border-white/30'} bg-black`}
                  >
                    <img 
                      src={`https://i.ytimg.com/vi/${getYouTubeVideoId(game.trailerUrl!)}/hqdefault.jpg`} 
                      alt="Trailer Thumbnail" 
                      className="w-full h-full object-cover opacity-70" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 p-2 rounded-full backdrop-blur-sm border border-white/20">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}
                {screenshots.map((url, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveMedia(i)}
                    className={`w-32 sm:w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${activeMedia === i ? 'border-primary shadow-[0_0_15px_rgba(220,248,54,0.3)]' : 'border-transparent hover:border-white/30'} bg-white/5`}
                  >
                    <img src={getImageUrl(url)} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {!hasTrailer && screenshots.length === 0 && (
                  <div className="text-white/30 text-sm px-4">No screenshots available.</div>
                )}
              </div>
            </div>

            {/* Right Column (30%): Box Art & Buy Box */}
            <div className="w-full lg:w-[30%] flex flex-col gap-6">

              {/* Buy Box with Background Image */}
              <div className="flex flex-col gap-4 bg-cards border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {/* Background Image Layer */}
                <div
                  className="absolute inset-0 z-0 opacity-70 bg-cover bg-top mix-blend-overlay"
                  style={{ backgroundImage: `url(${getImageUrl(game.coverImage)})` }}
                ></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-cards via-cards/80 to-transparent"></div>

                    <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/10 text-text-secondary text-[10px] font-bold rounded uppercase tracking-wider">{game.genre}</span>
                    {platformsList.length > 0 && (
                      <span className="px-2 py-1 bg-white/10 text-text-secondary text-[10px] font-bold rounded uppercase tracking-wider">{platformsList[0]}</span>
                    )}

                  </div>


                  {game.isGiveaway ? (
                    <div className="flex flex-col gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Gift className="text-[#00F0FF]" size={24} />
                        <span className="text-2xl font-heading font-black text-white">GIVEAWAY EVENT</span>
                      </div>
                      
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                        {game.giveawayRules || "No specific rules have been provided for this giveaway. Please check back later!"}
                      </div>

                      <button 
                        className="w-full mt-2 bg-[#00F0FF] hover:bg-white text-black font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2"
                      >
                        Participate Now
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
                        <span className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">Your Price</span>
                        {(() => {
                          const finalPrice = game.price;
                          const hasSteamSavings = game.steamPrice != null && game.steamPrice > finalPrice && finalPrice > 0;
                          const savingsPercent = hasSteamSavings ? Math.round(((game.steamPrice! - finalPrice) / game.steamPrice!) * 100) : 0;
                          
                          return (
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className="text-3xl font-heading font-black text-white">{formatPrice(finalPrice)}</span>
                              
                              {hasSteamSavings && isFinite(savingsPercent) ? (
                                <>
                                  <span className="text-text-secondary line-through text-sm">{formatPrice(game.steamPrice!)}</span>
                                  <span className="bg-primary/20 text-primary text-[10px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">SAVE {savingsPercent}%</span>
                                </>
                              ) : null}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Creator Access Promotion & Claim */}
                      {game.creatorAccess && creatorStatus === 'APPROVED' && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/40 flex flex-col gap-2 shadow-[0_0_15px_rgba(220,248,54,0.15)]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                              ★ Creator Free Pass Available
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-tight">
                            Approved content creators can claim this title for streams & videos.
                          </p>
                          <button
                            onClick={() => {
                              const creatorName = user?.username || 'Valqore Creator';
                              const message = encodeURIComponent(`Hi Valqore! I want to claim Creator Access for "${game.title}". My creator account name is "${creatorName}".`);
                              toast.success(`Redirecting to Instagram to claim ${game.title}!`, { icon: '🚀' });
                              window.open(`https://ig.me/m/valqore.pro?text=${message}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="w-full mt-1 bg-gradient-to-r from-primary to-[#c4e320] hover:from-white hover:to-white text-black font-black text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(220,248,54,0.3)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                          >
                            Claim Creator Access (Instagram DM)
                          </button>
                        </div>
                      )}

                      {isOwned(game.id) ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <Link 
                            to="/library"
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-heading font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          >
                            <CheckCircle2 size={18} className="text-emerald-400" />
                            Already In Your Library
                          </Link>
                          <p className="text-[11px] text-text-secondary text-center">
                            You already own this game. Access your launcher account in Library.
                          </p>
                        </div>
                      ) : game.outOfStock ? (
                        <button 
                          disabled
                          className="w-full mt-2 bg-red-600/50 text-white/50 cursor-not-allowed font-black text-sm px-4 py-3.5 rounded-xl uppercase tracking-wider flex justify-center items-center gap-2"
                        >
                          OUT OF STOCK
                        </button>
                      ) : game.isRentable ? (
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-2">
                          <button 
                            onClick={handleAddToCart}
                            className="w-full bg-primary hover:bg-white text-background font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2"
                          >
                            {inCart ? 'Go to Cart' : 'Buy Now'}
                            <ShoppingCart size={16} className={inCart ? 'hidden' : ''} />
                          </button>
                          <button className="w-full bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2">
                            Rent ({game.rentDurationDays} Days) <span className="text-primary font-bold normal-case text-xs">{formatPrice(game.rentPrice || 0)}</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleAddToCart}
                          className="w-full mt-2 bg-primary hover:bg-white text-background font-black text-sm px-4 py-3.5 rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2"
                        >
                          {inCart ? 'Go to Cart' : 'Buy Now'}
                          <ShoppingCart size={16} className={inCart ? 'hidden' : ''} />
                        </button>
                      )}

                      <div className="mt-3 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Secure Payments</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-10 rounded bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="UPI">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-2.5 object-contain" />
                          </div>
                          <div className="h-6 w-10 rounded bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="USDT">
                            <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032" alt="USDT" className="h-3 object-contain" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Epic Layout Game Details moved here */}
                  <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-text-secondary">Developer</span>
                      <span className="font-bold text-white text-right">{game.developer}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-text-secondary">Release Date</span>
                      <span className="font-bold text-white text-right">{new Date(game.releaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-start py-1">
                      <span className="text-text-secondary">Platform</span>
                      <div className="flex flex-col items-end gap-1">
                        {platformsList.map(p => (
                          <span key={p} className="text-white text-right font-bold">{p}</span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-cards/40 border border-white/5 rounded-2xl p-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReaction('LIKE')}
                    disabled={isReacting}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                      userReaction === 'LIKE' 
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(220,248,54,0.3)]' 
                        : 'bg-cards border-white/10 hover:bg-primary/10 hover:border-primary/40 text-text-secondary hover:text-white'
                    }`}
                    title="Like this game"
                  >
                    <ThumbsUp size={16} className={userReaction === 'LIKE' ? 'text-primary fill-primary/30' : ''} />
                    <span className="text-xs font-bold font-mono">{likesCount}</span>
                  </button>

                  <button 
                    onClick={() => handleReaction('DISLIKE')}
                    disabled={isReacting}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                      userReaction === 'DISLIKE' 
                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-cards border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-text-secondary hover:text-white'
                    }`}
                    title="Dislike this game"
                  >
                    <ThumbsDown size={16} className={userReaction === 'DISLIKE' ? 'text-red-400 fill-red-500/30' : ''} />
                    <span className="text-xs font-bold font-mono">{dislikesCount}</span>
                  </button>
                </div>
                <button 
                  onClick={handleShareGame}
                  className="p-2 rounded-lg bg-cards border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Share game"
                >
                  <Share2 size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* System Requirements Section */}
          {(game.minRequirements || game.recRequirements) && (
            <div className="mt-8 bg-cards/40 border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-3 h-3 bg-primary rotate-45 flex-shrink-0"></div>
                <h2 className="text-2xl font-heading font-bold text-white">System Requirements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Minimum */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-text-secondary font-bold uppercase tracking-wider text-sm mb-2 border-b border-white/10 pb-2">Minimum</h3>
                  <div className="text-sm text-white font-medium whitespace-pre-line leading-relaxed">
                    {game.minRequirements || 'Not specified.'}
                  </div>
                </div>

                {/* Recommended */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-2 border-b border-white/10 pb-2">Recommended</h3>
                  <div className="text-sm text-white font-medium whitespace-pre-line leading-relaxed">
                    {game.recRequirements || 'Not specified.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account/Game Details Section */}
          <div className="mt-4 bg-cards/40 border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-primary rotate-45 flex-shrink-0"></div>
              <h2 className="text-2xl font-heading font-bold text-white">Account Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Shield size={20} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Instant Delivery</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">Your account credentials will be emailed to you immediately after verification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Globe size={20} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Global Access</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">Play from anywhere in the world without region restrictions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Share2 size={20} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Family Sharing</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">Available for offline mode and family sharing features.</p>
                </div>
              </div>
            </div>
          </div>


          {/* Related Games */}
          {(() => {
            const relatedGames = games
              .filter(g => g.id !== game.id && !g.isGiveaway && (g.genre === game.genre || g.developer === game.developer))
              .slice(0, 4);

            // If no genre match, fallback to other available games
            const displayGames = relatedGames.length > 0 
              ? relatedGames 
              : games.filter(g => g.id !== game.id && !g.isGiveaway).slice(0, 4);

            if (displayGames.length === 0) return null;

            return (
              <div className="col-span-full mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rotate-45"></div>
                    <h2 className="text-xl font-heading font-black tracking-widest uppercase text-white">Related Games</h2>
                  </div>
                  <Link to="/store" className="text-xs font-bold text-primary hover:text-white transition-colors">
                    Explore Store &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {displayGames.map(relGame => {
                    const discountedPrice = relGame.price;

                    return (
                      <Link 
                        to={`/game/${relGame.slug || relGame.id}`} 
                        key={relGame.id}
                        className="group bg-cards/40 hover:bg-cards/80 border border-white/5 hover:border-primary/40 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col cursor-pointer"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-3">
                          <img 
                            src={relGame.coverImage ? getImageUrl(relGame.coverImage) : '/images/hero-artwork.png'} 
                            alt={relGame.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {(() => {
                             const hasSteamSavings = relGame.steamPrice != null && relGame.steamPrice > relGame.price && relGame.price > 0;
                             const savingsPercent = hasSteamSavings ? Math.round(((relGame.steamPrice! - relGame.price) / relGame.steamPrice!) * 100) : 0;
                             if (hasSteamSavings && isFinite(savingsPercent)) {
                               return (
                                 <div className="absolute top-2 right-2 bg-primary/90 text-background font-black text-[10px] px-2 py-0.5 rounded shadow">
                                   SAVE {savingsPercent}%
                                 </div>
                               );
                             }
                             return null;
                          })()}
                        </div>

                        <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate mb-1">
                          {relGame.title}
                        </h3>
                        <p className="text-text-secondary text-xs truncate mb-2">{relGame.developer}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-primary font-black text-sm">{formatPrice(discountedPrice)}</span>
                          {(() => {
                             const hasSteamSavings = relGame.steamPrice != null && relGame.steamPrice > relGame.price && relGame.price > 0;
                             if (hasSteamSavings) {
                               return <span className="text-text-secondary line-through text-[11px]">{formatPrice(relGame.steamPrice!)}</span>;
                             }
                             return null;
                          })()}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

