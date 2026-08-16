import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useGames } from '../context/GameContext';
import { GameCard } from './GameCard';

const GENRES = ['All', 'Action', 'Action RPG', 'Adventure', 'RPG', 'Horror', 'Fighting', 'Racing'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Newest'];

export const BrowseGames = () => {
  const { games, loading } = useGames();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the game's genre contains the active genre (case-insensitive)
    const matchesGenre = activeGenre === 'All' || game.genre.toLowerCase().includes(activeGenre.toLowerCase());
    
    return matchesSearch && matchesGenre;
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
          <p className="text-primary font-bold text-sm mb-2 uppercase tracking-widest">DISCOVERY</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold">Browse Games</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, genres or titles..." 
              className="w-full bg-cards/50 border border-white/10 text-white rounded-lg py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-cards border border-white/10 hover:border-white/30 text-white text-sm font-semibold px-6 py-3.5 rounded-lg transition-colors">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeGenre === genre 
                  ? 'bg-primary text-background' 
                  : 'bg-cards/30 text-white/70 hover:bg-cards hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-12">
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
