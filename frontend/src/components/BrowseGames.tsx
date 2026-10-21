import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { GameCard } from './GameCard';

const GENRES = ['All', 'Exclusives', 'Deals', 'Rentals', 'Action', 'Action RPG', 'Adventure', 'RPG', 'Horror', 'Fighting', 'Racing'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Newest'];
const GAMES_PER_PAGE = 24;

const getPaginationRange = (current: number, total: number): (number | string)[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
};

export const BrowseGames = () => {
  const { games, loading } = useGames();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const activeGenre = searchParams.get('genre') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'Relevance';

  const setActiveGenre = (genre: string) => {
    setSearchParams(prev => { prev.set('genre', genre); return prev; });
  };
  
  const setSearchQuery = (q: string) => {
    setSearchParams(prev => { prev.set('q', q); return prev; });
  };
  
  const setSortBy = (sort: string) => {
    setSearchParams(prev => { prev.set('sort', sort); return prev; });
  };

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDrmOpen, setIsDrmOpen] = useState(true);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [activeDrms, setActiveDrms] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'VALQORE';
  }, [searchQuery, activeGenre]);

  // Reset pagination when search, genre, DRM, or sort filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeGenre, activeDrms, sortBy]);


  // Close dropdowns when clicking outside
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = games.filter(game => {
    if (game.isGiveaway || game.isBundle) return false;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the game's genre contains the active genre (case-insensitive)
    let matchesGenre = false;
    const lowerGenre = activeGenre.toLowerCase();
    
    if (lowerGenre === 'all') {
      matchesGenre = true;
    } else if (lowerGenre === 'rentals') {
      matchesGenre = !!game.isRentable;
    } else if (lowerGenre === 'exclusives' || lowerGenre === 'deals' || lowerGenre === 'discounted' || lowerGenre === 'discounts') {
      // Strictly show ONLY discounted games
      matchesGenre = game.steamPrice != null && game.steamPrice > game.price && game.price > 0;
    } else {
      matchesGenre = (game.genre || '').toLowerCase().includes(lowerGenre);
    }

    // Check DRM/Platform
    let matchesDrm = true;
    if (activeDrms.length > 0) {
      matchesDrm = activeDrms.some(drm => {
        const inPlatforms = game.platforms?.map(p => p.toLowerCase()).includes(drm.toLowerCase());
        const inTagImage = game.tagImage?.toLowerCase().includes(drm.toLowerCase());
        return inPlatforms || inTagImage;
      });
    }
    
    return matchesSearch && matchesGenre && matchesDrm;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    const finalPriceA = a.price;
    const finalPriceB = b.price;

    switch (sortBy) {
      case 'Price: Low to High':
        return finalPriceA - finalPriceB;
      case 'Price: High to Low':
        return finalPriceB - finalPriceA;
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Newest':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      default:
        return 0; // Relevance / Original Order
    }
  });

  const totalPages = Math.ceil(sortedGames.length / GAMES_PER_PAGE);

  // If a filter change reduces total pages, ensure current page never exceeds totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const displayGames = sortedGames.slice(startIndex, startIndex + GAMES_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    if (containerRef.current) {
      const win = window as any;
      if (win.lenis) {
        win.lenis.scrollTo(containerRef.current, { offset: -30, duration: 0.8 });
      } else {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section ref={containerRef} className="pt-32 pb-20 px-6 lg:px-12 relative z-10" id="store">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* Header Section */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors mb-6 group w-max cursor-pointer"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm tracking-wide">Back</span>
          </button>
          <p className="text-primary font-bold text-sm mb-2 uppercase tracking-widest">DISCOVERY</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold">Browse Games</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-8" ref={filterRef}>
          <div className="flex flex-row gap-2 md:gap-4 w-full">
            <div className="relative flex-[4] md:flex-grow md:max-w-2xl">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 md:w-5 md:h-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, genres or titles..." 
                className="w-full bg-cards/50 border border-white/10 text-white rounded-lg py-3 md:py-3.5 pl-10 md:pl-12 pr-3 md:pr-4 outline-none focus:border-primary/50 transition-colors text-sm md:text-base"
              />
            </div>
            <div className="flex-[1] md:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1 md:gap-2 bg-cards border border-white/10 hover:border-white/30 text-white text-[10px] sm:text-xs md:text-sm font-semibold px-2 md:px-6 py-3 md:py-3.5 rounded-lg transition-colors w-full h-full justify-center"
              >
                <Filter size={16} className="flex-shrink-0 md:w-[18px] md:h-[18px]" />
                <span className="truncate">Filters {activeGenre !== 'All' && `(${activeGenre})`}</span>
                <ChevronDown size={14} className={`hidden sm:block ml-1 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="w-full bg-cards border border-white/10 rounded-lg shadow-2xl overflow-hidden text-white flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 animate-slide-down">
              
              {/* Platform Section */}
              <div className="flex-1 p-5">
                <span className="font-bold tracking-widest text-sm text-white/90 block mb-4">PLATFORM</span>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                    <button 
                      onClick={() => setActiveDrms(prev => prev.includes('Steam') ? [] : ['Steam'])}
                      className={`w-full py-2.5 border flex items-center justify-center gap-2 transition-colors ${activeDrms.includes('Steam') ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
                    >
                      <span className="font-semibold tracking-wide text-xs">STEAM</span>
                    </button>
                    <button 
                      onClick={() => setActiveDrms(prev => prev.includes('Ubisoft') ? [] : ['Ubisoft'])}
                      className={`w-full py-2.5 border flex items-center justify-center gap-2 transition-colors ${activeDrms.includes('Ubisoft') ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
                    >
                      <span className="font-semibold tracking-wide text-xs">UBISOFT</span>
                    </button>
                    <button 
                      onClick={() => setActiveDrms(prev => prev.includes('Epic') ? [] : ['Epic'])}
                      className={`w-full py-2.5 border flex items-center justify-center gap-2 transition-colors ${activeDrms.includes('Epic') ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
                    >
                      <span className="font-semibold tracking-wide text-xs">EPIC GAMES</span>
                    </button>
                    <button 
                      onClick={() => setActiveDrms(prev => prev.includes('Rockstar') ? [] : ['Rockstar'])}
                      className={`w-full py-2.5 border flex items-center justify-center gap-2 transition-colors ${activeDrms.includes('Rockstar') ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
                    >
                      <span className="font-semibold tracking-wide text-xs">ROCKSTAR</span>
                    </button>
                </div>
              </div>

              {/* Genre Section */}
              <div className="flex-[2] p-5">
                <span className="font-bold tracking-widest text-sm text-white/90 block mb-4">GENRE</span>
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${activeGenre === genre ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-white/70 hover:border-white/30'}`}
                        onClick={() => setActiveGenre(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="w-full">
          
          {/* Trending Games */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold font-heading">
                {searchQuery || activeGenre !== 'All' ? 'Search Results' : 'Trending Now'}
              </h3>
              <div 
                ref={sortRef}
                className="relative"
              >
                <div 
                  className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-white transition-colors"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>Sort by: <span className="font-semibold text-white">{sortBy}</span></span>
                  <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-cards border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    {SORT_OPTIONS.map(option => (
                      <div 
                        key={option}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/5 ${sortBy === option ? 'text-primary font-medium' : 'text-text-primary'}`}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortOpen(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 gap-y-8 sm:gap-y-12">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="flex flex-col bg-cards/40 border border-white/5 rounded-2xl p-2.5">
                    <div className="w-full aspect-[3/4] skeleton-shimmer rounded-xl mb-3"></div>
                    <div className="flex flex-col gap-2 px-1">
                      <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="h-3 skeleton-shimmer rounded w-1/2"></div>
                        <div className="h-4 skeleton-shimmer rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : displayGames.length > 0 ? (
                displayGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-white/50 bg-cards/30 border border-white/5 rounded-2xl">
                  No games found matching your search.
                </div>
              )}
            </div>

            {/* Numbered Pagination */}
            {totalPages > 1 && !loading && (
              <nav 
                aria-label="Store pagination"
                className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 select-none"
              >
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-cards/70 hover:bg-cards text-xs sm:text-sm font-semibold text-white/80 hover:text-white hover:border-primary/50 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 mr-1 sm:mr-2"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {/* Page Numbers and Ellipses */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {getPaginationRange(currentPage, totalPages).map((item, index) => {
                    if (typeof item === 'string') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="w-7 sm:w-8 h-9 sm:h-10 flex items-center justify-center text-white/40 text-xs sm:text-sm font-bold"
                          aria-hidden="true"
                        >
                          {item}
                        </span>
                      );
                    }

                    const isCurrent = item === currentPage;

                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          isCurrent
                            ? 'bg-primary text-black border border-primary shadow-[0_0_15px_rgba(220,248,54,0.4)] scale-105'
                            : 'bg-cards/60 hover:bg-cards text-white/80 hover:text-white border border-white/10 hover:border-white/30 hover:scale-105'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-cards/70 hover:bg-cards text-xs sm:text-sm font-semibold text-white/80 hover:text-white hover:border-primary/50 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ml-1 sm:ml-2"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
};

