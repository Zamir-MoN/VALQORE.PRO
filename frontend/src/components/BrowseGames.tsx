import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ArrowLeft } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { GameCard } from './GameCard';

const GENRES = ['All', 'Action', 'Action RPG', 'Adventure', 'RPG', 'Horror', 'Fighting', 'Racing', 'Rentals'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Newest'];

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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

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
    if (game.isGiveaway) return false;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the game's genre contains the active genre (case-insensitive)
    let matchesGenre = false;
    if (activeGenre === 'All') {
      matchesGenre = true;
    } else if (activeGenre === 'Rentals') {
      matchesGenre = !!game.isRentable;
    } else {
      matchesGenre = game.genre.toLowerCase().includes(activeGenre.toLowerCase());
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
    const finalPriceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
    const finalPriceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;

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

  const displayGames = sortedGames.slice(0, 50); // Show up to 50 games when filtering

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
            <div className="w-full bg-[#22242a] border border-white/10 rounded-lg shadow-2xl overflow-hidden text-white flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
              
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
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-[3/4] bg-white/10 rounded-2xl"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-5 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : displayGames.length > 0 ? (
            displayGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-white/50">
              No games found matching your search.
            </div>
          )}
        </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};
