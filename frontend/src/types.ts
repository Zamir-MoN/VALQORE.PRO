export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Game {
  id: string;
  slug?: string;
  title: string;
  developer: string;
  rating: number;
  genre: string;
  price: number;
  discount: number;
  coverImage: string;
  releaseDate: string;
  platforms: string[];
  isRentable?: boolean;
  outOfStock?: boolean;
  isGiveaway?: boolean;
  giveawayRules?: string;
  rentPrice?: number | null;
  rentDurationDays?: number;
  rentRules?: string;
  minRequirements?: string;
  recRequirements?: string;
  trailerUrl?: string;
  screenshots?: string;
  tagImage?: string;
  steamAppId?: string;
  steamPrice?: number | null;
  creatorAccess?: boolean;
  isBundle?: boolean;
  bundleGames?: string | null;
}


export interface Testimonial {
  id: string;
  user: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
