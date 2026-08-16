import { prisma } from './prismaClient';

const GAMES = [
  {
    title: 'Cyber Strike 2077',
    developer: 'Neon Studios',
    rating: 4.8,
    genre: 'RPG',
    price: 59.99,
    discount: 20,
    coverImage: 'https://rukmini1.flixcart.com/image/1500/1500/xif0q/code-in-the-box-game/d/p/1/pc-black-myth-wukong-steam-pc-digital-download-offline-no-cd-dvd-original-imah4ybjza9m9ygn.jpeg?q=70',
    releaseDate: '2025-10-12',
    platforms: ['Windows', 'PlayStation'].join(', ')
  },
  {
    title: 'Stellar Frontiers',
    developer: 'Cosmic Games',
    rating: 4.9,
    genre: 'Open World',
    price: 69.99,
    discount: 0,
    coverImage: 'https://static0.hardcoregamerimages.com/wordpress/wp-content/uploads/sharedimages/2025/06/resident-evil-requiem-tag-page-cover-art.jpg',
    releaseDate: '2026-01-15',
    platforms: ['Windows'].join(', ')
  },
  {
    title: 'Abyssal Horrors',
    developer: 'Dark Matter Inc',
    rating: 4.6,
    genre: 'Horror',
    price: 39.99,
    discount: 15,
    coverImage: 'https://image.api.playstation.com/vulcan/ap/rnd/202507/0215/f98041a10ccc22d45fc2f6eded09eec50abd106d01547a5d.png',
    releaseDate: '2024-05-20',
    platforms: ['Windows', 'Xbox'].join(', ')
  },
  {
    title: 'Velocity X',
    developer: 'Redline',
    rating: 4.5,
    genre: 'Sports',
    price: 29.99,
    discount: 50,
    coverImage: 'https://store-images.s-microsoft.com/image/apps.52140.13968428294873536.e5281c0f-8823-4c6a-bff5-d25bd8c68e21.6cf5f0cd-f499-4617-86b4-cb1816447d28',
    releaseDate: '2023-11-10',
    platforms: ['Windows', 'PlayStation', 'Xbox'].join(', ')
  },
  {
    title: 'Neon Drift',
    developer: 'Cyber Racing',
    rating: 4.7,
    genre: 'Racing',
    price: 49.99,
    discount: 10,
    coverImage: 'https://store-images.s-microsoft.com/image/apps.52140.13968428294873536.e5281c0f-8823-4c6a-bff5-d25bd8c68e21.6cf5f0cd-f499-4617-86b4-cb1816447d28',
    releaseDate: '2025-05-10',
    platforms: ['Windows', 'PlayStation'].join(', ')
  },
  {
    title: 'Shadow Tactics',
    developer: 'Stealth Inc',
    rating: 4.8,
    genre: 'Action',
    price: 39.99,
    discount: 0,
    coverImage: 'https://static0.hardcoregamerimages.com/wordpress/wp-content/uploads/sharedimages/2025/06/resident-evil-requiem-tag-page-cover-art.jpg',
    releaseDate: '2024-08-20',
    platforms: ['Windows', 'Xbox'].join(', ')
  },
  {
    title: 'Galactic Empire',
    developer: 'Nova Studios',
    rating: 4.4,
    genre: 'Strategy',
    price: 59.99,
    discount: 0,
    coverImage: 'https://store-images.s-microsoft.com/image/apps.52140.13968428294873536.e5281c0f-8823-4c6a-bff5-d25bd8c68e21.6cf5f0cd-f499-4617-86b4-cb1816447d28',
    releaseDate: '2024-11-05',
    platforms: ['Windows'].join(', ')
  },
  {
    title: 'Phantom Protocol',
    developer: 'Ghost Games',
    rating: 4.7,
    genre: 'Action RPG',
    price: 49.99,
    discount: 25,
    coverImage: 'https://rukmini1.flixcart.com/image/1500/1500/xif0q/code-in-the-box-game/d/p/1/pc-black-myth-wukong-steam-pc-digital-download-offline-no-cd-dvd-original-imah4ybjza9m9ygn.jpeg?q=70',
    releaseDate: '2025-02-14',
    platforms: ['Windows', 'PlayStation'].join(', ')
  },
  {
    title: 'God of War Ragnarök',
    developer: 'Santa Monica Studio',
    rating: 4.9,
    genre: 'Action',
    price: 59.99,
    discount: 15,
    coverImage: 'https://gmedia.playstation.com/is/image/SIEPDC/god-of-war-ragnarok-store-art-01-10sep21$ru?$native$',
    releaseDate: '2022-11-09',
    platforms: ['PlayStation', 'Windows'].join(', ')
  },
  {
    title: "Assassin's Creed Shadows",
    developer: 'Ubisoft',
    rating: 4.6,
    genre: 'Action RPG',
    price: 69.99,
    discount: 0,
    coverImage: 'https://sm.ign.com/t/ign_in/screenshot/default/ac-shadows-fan-kit-key-art-standard-wide_3cqz.1200.jpg',
    releaseDate: '2024-11-15',
    platforms: ['PlayStation', 'Xbox', 'Windows'].join(', ')
  },
  {
    title: "Marvel's Spider-Man 2",
    developer: 'Insomniac Games',
    rating: 4.8,
    genre: 'Action',
    price: 69.99,
    discount: 10,
    coverImage: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/60eca3ac155247e21850c7d075d01ebf0f3f5dbf19ccd2a1.jpg',
    releaseDate: '2023-10-20',
    platforms: ['PlayStation'].join(', ')
  },
  {
    title: 'Epic Showcase 2025',
    developer: 'Various Studios',
    rating: 4.7,
    genre: 'Adventure',
    price: 49.99,
    discount: 0,
    coverImage: 'https://static0.srcdn.com/wordpress/wp-content/uploads/sharedimages/2025/02/mixcollage-13-feb-2025-11-12-am-5132.jpg',
    releaseDate: '2025-02-13',
    platforms: ['Windows', 'PlayStation'].join(', ')
  },
  {
    title: 'Eldoria',
    developer: 'Mythic Forge',
    rating: 4.9,
    genre: 'Adventure',
    price: 69.99,
    discount: 0,
    coverImage: 'https://static0.hardcoregamerimages.com/wordpress/wp-content/uploads/sharedimages/2025/06/resident-evil-requiem-tag-page-cover-art.jpg',
    releaseDate: '2025-11-20',
    platforms: ['Windows', 'PlayStation', 'Xbox'].join(', ')
  },
  {
    title: 'Circuit Breaker',
    developer: 'Neon Studios',
    rating: 4.3,
    genre: 'Racing',
    price: 29.99,
    discount: 10,
    coverImage: 'https://store-images.s-microsoft.com/image/apps.52140.13968428294873536.e5281c0f-8823-4c6a-bff5-d25bd8c68e21.6cf5f0cd-f499-4617-86b4-cb1816447d28',
    releaseDate: '2023-09-01',
    platforms: ['Windows'].join(', ')
  }
];

async function main() {
  console.log('Clearing existing games...');
  await prisma.game.deleteMany();
  
  console.log('Seeding new games...');
  const result = await prisma.game.createMany({
    data: GAMES
  });
  
  console.log(`Successfully seeded ${result.count} games!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
