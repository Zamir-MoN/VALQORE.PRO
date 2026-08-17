import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGames } from '../context/GameContext';
import { getImageUrl } from '../utils/image';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const HeroCardStack = () => {
  const { games } = useGames();
  const [cards, setCards] = useState<number[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await axios.get(`${API_URL}/posters`);
        if (res.data && res.data.length > 0) {
          setImages(res.data.map((p: any) => p.imageUrl));
          setCards(res.data.map((_: any, i: number) => i));
        } else {
          setImages([]);
          setCards([]);
        }
      } catch (err) {
        console.error("Failed to fetch posters", err);
        setImages([]);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  useEffect(() => {
    if (loading || images.length <= 1) return;

    const timer = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const first = newCards.shift();
        if (first !== undefined) newCards.push(first);
        return newCards;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [loading, images.length]);

  if (loading || images.length === 0) {
    return <div className="w-[65%] sm:w-full max-w-[280px] sm:max-w-lg aspect-[4/5]"></div>;
  }

  return (
    <div className="relative w-[65%] sm:w-full max-w-[280px] sm:max-w-lg aspect-[4/5] flex items-center justify-center">
      {cards.map((cardIndex, i) => {
        // If there are many cards, we cap the visible stack effect to the top 3-4 cards
        const isHidden = i > 3;
        if (isHidden) return null;

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
              src={images[cardIndex]} 
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
