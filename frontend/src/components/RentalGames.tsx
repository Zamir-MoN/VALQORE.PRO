import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useCurrency } from '../context/CurrencyContext';

export const RentalGames = () => {
  const { games, loading } = useGames();
  const { formatPrice } = useCurrency();
  const [startIndex, setStartIndex] = useState(0);
  
  // Filter games to only show ones that are rentable and not giveaways
  const rentalGamesData = games.filter(game => game.isRentable && !game.isGiveaway);

  if (loading || rentalGamesData.length === 0) return null;

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 3 >= rentalGamesData.length ? 0 : prev + 3));
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 3 < 0 ? Math.max(0, rentalGamesData.length - (rentalGamesData.length % 3 === 0 ? 3 : rentalGamesData.length % 3)) : prev - 3));
  };

  const visibleGames = rentalGamesData.slice(startIndex, startIndex + 3);

  return (
    <section className="pt-20 pb-4 px-6 lg:px-12 relative z-10" id="rental">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold font-heading">Rental Games</h3>
          </div>
          <Link to="/store" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors group">
            <span>View Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={prevSlide} 
            className="hidden md:block absolute -left-5 top-[40%] -translate-y-1/2 z-20 p-3 bg-cards/90 backdrop-blur-md border border-white/10 rounded-full hover:bg-primary hover:text-background hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-2xl"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleGames.map((game) => (
              <Link to={`/game/${game.id}`} key={`rental-${game.id}`} className="group flex bg-cards/40 hover:bg-cards border border-white/5 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-lg">
                <div className="w-1/3 min-w-[100px] aspect-[3/4] sm:aspect-square md:aspect-[3/4] overflow-hidden relative">
                  <img src={game.coverImage || '/images/hero-artwork.png'} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60"></div>
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-center">
                  <h4 className="font-heading font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-1">{game.title}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-1">{game.genre}, {game.developer}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-primary font-black text-lg">{formatPrice(game.price * 0.15)}</span>
                    <button className="text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-primary hover:text-black px-3 py-1.5 rounded transition-colors text-white">
                      Rent
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={nextSlide} 
            className="hidden md:block absolute -right-5 top-[40%] -translate-y-1/2 z-20 p-3 bg-cards/90 backdrop-blur-md border border-white/10 rounded-full hover:bg-primary hover:text-background hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-2xl"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden justify-center items-center gap-6 mt-8">
          <button 
            onClick={prevSlide}
            className="p-3 bg-cards border border-white/10 rounded-full text-white hover:text-black hover:bg-primary transition-colors shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 bg-cards border border-white/10 rounded-full text-white hover:text-black hover:bg-primary transition-colors shadow-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
