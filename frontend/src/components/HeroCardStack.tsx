import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGames } from '../context/GameContext';
import { getImageUrl } from '../utils/image';

export const HeroCardStack = () => {
  const { games } = useGames();
  const [cards, setCards] = useState([0, 1, 2]);

  // Use cover images from the first 3 games, or fallback to default
  const IMAGES = games.length >= 3 
    ? games.slice(0, 3).map(g => getImageUrl(g.coverImage))
    : [
        "https://gamegpu.com/images/1_2026/NEWS/Q2/june/Image_jyeghbjyeghbjyeg_ggpu.webp",
        "https://m.media-amazon.com/images/M/MV5BM2E1YjYzMjQtNDM0YS00OWYwLTk1ZDMtMTEzNTdjMDUzMDBiXkEyXkFqcGc@._V1_.jpg",
        "https://static0.hardcoregamerimages.com/wordpress/wp-content/uploads/sharedimages/2025/06/resident-evil-requiem-tag-page-cover-art.jpg"
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const first = newCards.shift();
        if (first !== undefined) newCards.push(first);
        return newCards;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[65%] sm:w-full max-w-[280px] sm:max-w-lg aspect-[4/5] flex items-center justify-center">
      {cards.map((cardIndex, i) => {
        return (
          <motion.div
            key={cardIndex}
            className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl origin-bottom cursor-pointer"
            animate={{
              y: i * -25,
              scale: 1 - i * 0.06,
              zIndex: cards.length - i,
              rotateZ: i === 0 ? 0 : i === 1 ? -3 : 3,
              opacity: 1 - i * 0.15,
              x: i === cards.length - 1 ? [200, 0] : 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1], // Custom smooth ease out
            }}
          >
            <img 
              src={IMAGES[cardIndex]} 
              alt="Featured Game Poster" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none"></div>
          </motion.div>
        );
      })}
    </div>
  );
};
