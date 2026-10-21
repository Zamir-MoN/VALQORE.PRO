--
-- PostgreSQL database dump
--

\restrict Vyljs8eciQjMVsUWjcV2g5IsXCf0PKR95GO7wkhCd0ixsOvlzVCnqcn2vgvGQZS

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "gameId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO valqore_app;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    discount double precision NOT NULL,
    "createdBy" text NOT NULL,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "creatorId" text,
    "commissionRate" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO valqore_app;

--
-- Name: CreatorApplication; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."CreatorApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "youtubeLink" text,
    "instagramLink" text,
    "facebookLink" text,
    "otherLink" text,
    intent text NOT NULL,
    "contactPlatforms" text NOT NULL,
    "creatorEmail" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "agreedToGuidelines" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CreatorApplication" OWNER TO valqore_app;

--
-- Name: Game; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."Game" (
    id text NOT NULL,
    title text NOT NULL,
    developer text NOT NULL,
    rating double precision NOT NULL,
    genre text NOT NULL,
    price double precision NOT NULL,
    discount double precision NOT NULL,
    "coverImage" text NOT NULL,
    "releaseDate" text NOT NULL,
    platforms text NOT NULL,
    "isRentable" boolean DEFAULT false NOT NULL,
    "outOfStock" boolean DEFAULT false NOT NULL,
    "isGiveaway" boolean DEFAULT false NOT NULL,
    "giveawayRules" text,
    "rentPrice" double precision,
    "rentDurationDays" integer DEFAULT 7,
    "rentRules" text,
    "minRequirements" text,
    "recRequirements" text,
    "trailerUrl" text,
    screenshots text,
    "tagImage" text,
    "steamAppId" text,
    "creatorAccess" boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "steamPrice" double precision,
    "internalCost" double precision,
    slug text,
    "isBundle" boolean DEFAULT false NOT NULL,
    "bundleGames" text,
    description text
);


ALTER TABLE public."Game" OWNER TO valqore_app;

--
-- Name: GameReaction; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."GameReaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "gameId" text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GameReaction" OWNER TO valqore_app;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "totalAmount" double precision NOT NULL,
    "couponCode" text,
    "couponDiscount" double precision,
    "commissionEarned" double precision,
    purpose text,
    "submittedUtr" text,
    "paymentMethod" text DEFAULT 'DELTA_PAY'::text NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO valqore_app;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "gameId" text NOT NULL,
    "pricePaid" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO valqore_app;

--
-- Name: OtpVerification; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."OtpVerification" (
    id text NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    purpose text DEFAULT 'general'::text NOT NULL
);


ALTER TABLE public."OtpVerification" OWNER TO valqore_app;

--
-- Name: ParsedEmail; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."ParsedEmail" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    status text DEFAULT 'PROCESSED'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ParsedEmail" OWNER TO valqore_app;

--
-- Name: Poster; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."Poster" (
    id text NOT NULL,
    "imageUrl" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Poster" OWNER TO valqore_app;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    utr text NOT NULL,
    amount double precision NOT NULL,
    "transactionId" text NOT NULL,
    sender text NOT NULL,
    date text NOT NULL,
    "orderId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO valqore_app;

--
-- Name: TrustedDevice; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."TrustedDevice" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "userAgent" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastUsedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TrustedDevice" OWNER TO valqore_app;

--
-- Name: User; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text,
    "steamMonUsername" text,
    "steamMonPassword" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO valqore_app;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "gameId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO valqore_app;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: valqore_app
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO valqore_app;

--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."CartItem" (id, "userId", "gameId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Coupon" (id, code, discount, "createdBy", "usageLimit", "usageCount", "isActive", "creatorId", "commissionRate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CreatorApplication; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."CreatorApplication" (id, "userId", name, "youtubeLink", "instagramLink", "facebookLink", "otherLink", intent, "contactPlatforms", "creatorEmail", status, "agreedToGuidelines", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Game" (id, title, developer, rating, genre, price, discount, "coverImage", "releaseDate", platforms, "isRentable", "outOfStock", "isGiveaway", "giveawayRules", "rentPrice", "rentDurationDays", "rentRules", "minRequirements", "recRequirements", "trailerUrl", screenshots, "tagImage", "steamAppId", "creatorAccess", "position", "createdAt", "updatedAt", "steamPrice", "internalCost", slug, "isBundle", "bundleGames", description) FROM stdin;
c00cd98b-9113-4a6f-92ac-4e62a38891e7	Wuchang: Fallen Feathers	Leenzee Games	3.8	Role-playing (RPG), Hack and slash/Beat 'em up, Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/co9xif.jpg	2025-07-24	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	OS: Windows10 64bit\nProcessor: Intel Core i5-8400/AMD Ryzen 5 1600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 6GB/AMD Radeon RX 580 8GB\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: HDD Supported, SSD Recommended. The above specifications were tested with DLSS/FSR enabled.	OS: Windows10/11 64bit\nProcessor: Intel Core i7-9700/AMD Ryzen 5 5500\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2070/AMD Radeon RX 5700 XT/INTEL Arc A750\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: SSD Required. The above specifications were tested with DLSS/FSR enabled.	https://youtu.be/tZ_JjhLdlwk?si=ng6k4ZDdOjVR4Ejo	https://i.ytimg.com/vi/qvVvxr7fMhE/maxresdefault.jpg,https://cdn.alza.cz/Foto/ImgGalery/Image/wuchang-fallen-feathers-boss.jpg,https://505games.com/wp-content/uploads/2024/10/Wuchang-Trailer-Image.jpg,https://wuchanggame.com/wp-content/uploads/2024/05/Wuchang_Screenshot_3.jpg,https://images.hdqwalls.com/wallpapers/wuchang-fallen-feathers-4k-fv.jpg,https://static0.polygonimages.com/wordpress/wp-content/uploads/2025/07/SHARE_20250722_0729032.jpeg?q=49&fit=crop&w=825&dpr=2,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjDSTZdU-fDdR_-GO5R-Dbg8DEWiwcREjo-bNlW7X6QBII__KPyUPxuQY&s=10	/badges/STEAM.png	2277560	f	0	2026-09-25 07:37:25.467	2026-09-25 07:37:25.467	2599	\N	\N	f	\N	\N
964cf478-9f8e-437f-93a8-9550c54db149	Forza Horizon 5	Playground Games	0	Racing, Sport	149	0	https://m.media-amazon.com/images/M/MV5BZDA5M2M4YmEtMDMxYy00ZTk5LWIwNGYtNDRmMjI2OTA3OGNiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	2021-11-05	Xbox Series X|S, PC (Microsoft Windows),  Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 version 18362.0 or higher\nPROCESSOR: Intel i5-4460 or AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVidia GTX 970, AMD RX 470, OR Intel Arc A380\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 110 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 version 18362.0 or higher\nPROCESSOR: Intel i5-8400 or AMD Ryzen 5 1500X\nMEMORY: 16 GB RAM\nGRAPHICS: NVidia GTX 1070, AMD RX 590, OR Intel Arc A750\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 110 GB available space	https://youtu.be/YY2GX_7wR7Y?si=f31lZofpxXWhTNEa	https://www.dsogaming.com/wp-content/uploads/2021/06/Forza-Horizon-5.jpg,https://wallpaperaccess.com/full/166193.jpg,https://wallpapers.com/images/hd/forza-horizon-5-4k-3wsh8omuls2xhprl.jpg,https://traxion.gg/wp-content/uploads/2025/01/Forza-Horizon-5-playlist-voting-2.jpg,https://images.wallpapersden.com/image/download/forza-horizon-5-hd-gaming_bW5pbWaUmZqaraWkpJRmbmdlrWZlbWU.jpg,https://c.wallhere.com/photos/29/be/Forza_Horizon_5_sports_car_landscape_blurred_McLaren_P1_car_McLaren_P1_GTR_video_games-2174525.jpg!d,https://images.hdqwalls.com/download/forza-horizon-5-8k-gf-1920x1080.jpg,https://wallpapercave.com/wp/wp9351523.jpg,https://cdn.forza.net/strapi-uploads/assets/xlarge_Forza_Horizon6_Pre_Order_02_Festival_Drift_16x9_838fd3e6b1.jpg,https://cdn.gamertweak.com/wp-content/uploads/2021/11/telemetry-guide-768x432.jpg,https://i.ibb.co/cg81QXm/20240425183706-1.jpg	/badges/STEAM.png	1551360	f	0	2026-09-25 07:37:25.474	2026-09-25 07:37:25.474	\N	\N	\N	f	\N	\N
3ba6285d-dc2e-402a-810f-2ce469708d65	Dying Light: The Beast	Techland	3.8	Role-playing (RPG), Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocmja.jpg	2025-09-18	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 or newer\nPROCESSOR: Intel i5-9600K / AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce 1060 / AMD Radeon 5500 XT / Intel ARC A750\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10 or newer\nPROCESSOR: Intel i5-13400F / AMD Ryzen 7 7700\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3070 TI / AMD Radeon 6750 XT / Intel ARC B580\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/qsqBCs7o5go?si=RD1No6Powt9G0D3s	https://dyinglightgame.com/img/share_thebeast.jpg,https://www.denofgeek.com/wp-content/uploads/2025/07/Dying-Light_-The-Beast-Screenshot-20.jpg?fit=1920%2C1080,https://kotaku.com/app/uploads/2025/09/ss_50a84a957ec4fcd627c75692fb50123bb6d799b3.1920x1080.jpg,https://sm.pcmag.com/pcmag_me/photo/d/dying-ligh/dying-light-the-beast_5ggq.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVgomjzE6oPGercjy5ah7fKFEUUgloHDW65oS9usF_wSx20s47yhL1cn3B&s=10,https://sm.ign.com/t/ign_nl/video/d/dying-ligh/dying-light-the-beast-official-launch-trailer_rk8r.1280.png,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgK4H-pObmN-baN9bZ82c8lP0QjBvh-lwiN_KiXBEYvBaZMCPKZeGGaYwo&s=10,https://cdn2.unrealengine.com/dying-light-the-beast-chimera-bosses-guide-4-3840x2160-521ffd3f6f47.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScK6oXmGEbul9sXKgRSzCGYgdWUIcPQe6boao6BeZX4eKI7olbmH9TO2w&s=10,https://cdn2.unrealengine.com/dying-light-the-beast-tips-beginners-guide-6-3840x2160-bf684ff8499d.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGkuapx1ciEI0VmL5Y4qyAoeeOkHtbZeCijgwhiArj2CxXblweFSzJDt8&s=10,https://staticdelivery.nexusmods.com/images/8178/105761968-1759211247.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR67vPGzf5nwog8BU_Zvi8vx8z5HahN-1aOv096detJDBkCipFOs15zsdPV&s=10,https://sm.ign.com/ign_in/video/d/dying-ligh/dying-light-the-beast-x-pubg-mobile-official-collaboration-t_6ruu.png	/badges/STEAM.png	3008130	f	0	2026-09-25 07:37:25.482	2026-09-25 07:37:25.482	\N	\N	\N	f	\N	\N
23a9c326-88dd-4a21-b794-680cbec69935	DEATH STRANDING 2	Kojima Productions	4.6	Shooter, Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/co9ipx.jpg	2025-06-26	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	OS: Windows 10/11 Version 1909 or newer\nPROCESSOR: Intel Core i3-10100, AMD Ryzen 3 3100\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660, AMD Radeon RX 5500 XT 8GB\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	OS: Windows 10/11 Version 1909 or newer\nPROCESSOR: Intel Core i7-11700, AMD Ryzen 7 5700X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3070, AMD Radeon RX 6800\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/etOOO9Sq7u8?si=nnEEC_K0jZvP2aNZ	https://www.well-played.com.au/wp-content/uploads/2025/06/Death-Stranding-2-Review-Feature-Image.jpg,https://w.wallhaven.cc/full/d6/wallhaven-d68kdl.png,https://gamingbolt.com/wp-content/uploads/2025/06/Death-Stranding-2-On-the-Beach.jpg,https://www.kojimaproductions.jp/sites/default/files/2022-12/ds2_tga2022_screenshot001_2k.jpg,https://cdn.neowin.com/news/images/uploaded/2025/03/1741562564_ds2_sxsw2025_screenshots004.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBBGq67TxGJ87NwRmo56sXlTH1ssFs5rdmmJ6TMxeW6kJ2v6aEwCf5cEMh&s=10,https://cdn.mos.cms.futurecdn.net/5kBG9meFVq7gt3Rs7ndggj.jpg,https://blog.playstation.com/uploads/2025/05/9098f6c4ce886d5c7c5212f48a9a932c2d27def6.jpg	/badges/STEAM.png	3280350	f	0	2026-09-25 07:37:25.486	2026-09-25 07:37:25.486	\N	\N	\N	f	\N	\N
2a0f7b09-f4f3-4c8e-b436-529b32712965	Elden Ring	FromSoftware	4.1	Role-playing (RPG), Hack and slash/Beat 'em up	99	0	https://cdng.europosters.eu/pod_public/750/216712.jpg	2025-05-30	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10\nPROCESSOR: INTEL CORE I5-8400 or AMD RYZEN 3 3300X\nMEMORY: 12 GB RAM\nGRAPHICS: NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB\nDIRECTX: Version 12\nSTORAGE: 60 GB available space\nSOUND CARD: Windows Compatible Audio Device	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: INTEL CORE I7-8700K or AMD RYZEN 5 3600X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB\nDIRECTX: Version 12\nSTORAGE: 60 GB available space\nSOUND CARD: Windows Compatible Audio Device	https://youtu.be/E3Huy2cdih0?si=ACejWW5e5t2Al44H	https://images.wallpapersden.com/image/download/elden-ring-4k-hd-gaming_bWVnameUmZqaraWkpJRmbmdlrWZlbWU.jpg,https://images.wallpapersden.com/image/download/new-elden-ring-2022_bWdlZm6UmZqaraWkpJRmbmdlrWZlbWU.jpg,https://images.hdqwalls.com/wallpapers/elden-ring-nightreign-4k-ro.jpg,https://wallpapers.com/images/hd/elden-ring-erdtree-v8p2ufggfmpds1em.jpg,https://img.uhdpaper.com/wallpaper/elden-ring-godrick-boss-fight-465@5@k,https://images.wallpapersden.com/image/download/shadow-of-the-erdtree-hd-elden-ring_bmdnbmmUmZqaraWkpJRmbmdprWZlbWU.jpg,https://wallpapers.com/images/hd/elden-ring-nightreign-boss-fight-794wyw6wh033a7jw.jpg,https://wallpapers.com/images/hd/elden-ring-battle-scene-jnyufh05lejpvxgu.jpg	/badges/STEAM.png	1245620	f	0	2026-09-25 07:37:25.495	2026-09-25 07:37:25.495	\N	\N	\N	f	\N	\N
238b2f46-ff26-4bc9-b3c6-0de106bbb187	Euro Truck Simulator 2	SCS Software	0	Simulator	149	0	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0pE-02Xrir2TP7Izg7nYH71fLFusRbGtdXWxV3v0ob9N0o0_bHm43HN4&s=10	2013-12-31	PC (Microsoft Windows)	f	f	f	\N	\N	7	\N	OS: Windows 10 64-bit\nPROCESSOR: Intel Core i5-6400 or AMD Ryzen 3 1200 or similar\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 660 or AMD Radeon RX 460 or Intel HD 630 (2GB VRAM)\nHARD DRIVE: 25 GB available space (Euro Truck Simulator 2 base game)	OS: Windows 10 64-bit\nPROCESSOR: Intel Core i5-9600 or AMD Ryzen 5 3600 or similar\nMEMORY: 12 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 or AMD Radeon RX 590 (2GB VRAM)\nHARD DRIVE: 25 GB available space (Euro Truck Simulator 2 base game)	https://youtu.be/5uvwfskYwl0?si=a2YeU36U4B5mwbfs	\N	/badges/STEAM.png	227300	f	0	2026-09-25 07:37:25.506	2026-09-25 07:37:25.506	\N	\N	\N	f	\N	\N
ef92f72c-4015-4ac5-aa06-d8117860ed5b	God Of War Ragnarok	Animoca XL	0	Role-playing (RPG)	149	0	https://i.pinimg.com/736x/f6/41/61/f6416126cfbb5e17b0d8a66897337e19.jpg	2013-09-12	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 20H1\nPROCESSOR: Intel i5-4670k or AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 1060 (6GB) or AMD RX 5500 XT (8GB) or Intel Arc A750\nDIRECTX: Version 12\nSTORAGE: 190 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 20H1\nPROCESSOR: Intel i5-8600 or AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA RTX 2060 Super or AMD RX 5700 or Intel Arc A770\nDIRECTX: Version 12\nSTORAGE: 190 GB available space	https://youtu.be/hfJ4Km46A-0?si=12zxoreiUM5XlezS	https://images.wallpapersden.com/image/download/god-of-war-ragnaroek-4k-gaming-poster_bWtpbG2UmZqaraWkpJRobWllrWdma2U.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe3OpfHqEfAnE3bEQEzTl1XxQFmatm7LuPyDjl5hqVlMSQnBU3LYu0Y1Tw&s=10,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3KvwtC2moS6-ekSfzlBfUs0pyg9GGXO6keQvdj-UXzdw2wjinocs0DOM&s=10,https://wallpaperbat.com/img/893229-god-of-war-ragnarok.jpg,https://images.hdqwalls.com/wallpapers/god-of-war-ragnarok-8k-4i.jpg,https://a-static.besthdwallpaper.com/god-of-war-ragnarok-kratos-fight-wallpaper-3840x2160-102023_54.jpg,https://wallpaperaccess.com/full/4021922.jpg,https://images.wallpapersden.com/image/download/god-of-war-ragnarok-sled-clash-gaming_bWtrbW6UmZqaraWkpJRobWllrWdma2U.jpg,https://images.wallpapersden.com/image/download/god-of-war-ragnarok-2021-hd-gaming_bG5oZW6UmZqaraWkpJRobWllrWdma2U.jpg	/badges/STEAM.png	2322010	f	0	2026-09-25 07:37:25.499	2026-09-25 08:04:57.798	\N	\N	god-of-war-ragnarok	f	\N	\N
4252580a-18b2-4be0-a004-5fb5c2e61c91	The Last of Us Part II	Naughty Dog	4.6	Shooter, Adventure	179	0	https://images.igdb.com/igdb/image/upload/t_1080p/co5ziw.jpg	2020-06-19	PlayStation 4, PlayStation 5, PC	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit (version 1909 or higher)\nPROCESSOR: Intel Core i3-8100, AMD Ryzen 3 1300X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1650, AMD Radeon RX 5500XT\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit (version 1909 or higher)\nPROCESSOR: Intel Core i5-8600, AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060, AMD Radeon RX 5700\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/btmN-bWwv0A?si=nboiY4khvfdHi4DL	https://images.hdqwalls.com/wallpapers/the-last-of-us-part-2-fanartwork-br.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/04/last-of-us-part-2-remastered-ellie-and-abby.jpg,https://wallpapercave.com/wp/wp9447031.jpg,https://images.wallpapersden.com/image/download/the-last-of-us-part-2-ps5_bGZlbWeUmZqaraWkpJRmbmdlrWZlbWU.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/07/the-last-of-us-part-2-ellie-playing-guitar-1.jpg,https://www.nme.com/wp-content/uploads/2024/01/The-Last-Of-Us-Part-2-Remastered-review-Joel.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/07/the-last-of-us-part-2-ellie-on-a-horse-riding-through-a-destroyed-city.jpg?q=49&fit=contain&w=2200&h=1100&dpr=2,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/04/tlou-2-gameplay.jpg	/badges/STEAM.png	2531310	f	0	2026-09-25 07:37:25.51	2026-09-25 07:37:25.51	\N	\N	\N	f	\N	\N
0fd132a5-7c81-4a51-83a2-e242f9fcc3f4	Dying Light 2: Reloaded Edition	Techland	0	Shooter, Role-playing (RPG)	259	0	https://images.igdb.com/igdb/image/upload/t_1080p/co92fq.jpg	2024-02-22	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows® 10\nPROCESSOR: Intel Core i3-9100 / AMD Ryzen 3 2300X\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA® GeForce® GTX 1050 Ti / AMD Radeon™ RX 560 (4GB VRAM)\nSTORAGE: 60 GB available space	Requires a 64-bit processor and operating system\nOS: Windows® 10\nPROCESSOR: AMD / Intel CPU running at 3.6 GHz or higher: AMD Ryzen 5 3600X or Intel i5-8600K or newer\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA® GeForce RTX™ 2060 6GB or AMD RX Vega 56 8GB or newer\nSTORAGE: 60 GB available space	https://youtu.be/njAOpATG46E?si=k7YOYUf8NqFpAJ9n	https://xboxwire.thesourcemediaassets.com/sites/2/2024/02/Dying-Light-Hero-a274926f1a636f32e041-1024x576.jpg,https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/ss_fe9a52a60f4739a44cbd8b0c0856033ea6996624.jpg,https://cdn.mos.cms.futurecdn.net/DguKPv2KcLQEmKPLhrw3vd.jpg,https://cdn.mos.cms.futurecdn.net/V2XRzXCXdmJ742a6MdBznA.jpg,https://imgproxy.eneba.games/HIi59RmwgKqCeHMoKAcReuy0pvwF0w8wZkerfcHPw4c/rs:fit:1920/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy96/RkNtYlNZVDlhMzRs/S2dlX0Q1dWl2ZEJD/b3lkWUNJU2JXY2FY/WGc5UC1BLmpwZWc,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMF2hgoybBztEb6h3ZcSwHqnZW4yL2-DglsIzn1awP_z6kJYSUQ9LivKQ&s=10,https://i.redd.it/the-game-looks-breathtaking-after-disabling-the-cluttered-v0-fwzr1dqsz6g81.jpg?width=2560&format=pjpg&auto=webp&s=4736904b2577123ed2082b2689e67dbbf94d73bf,https://i.redd.it/the-game-looks-breathtaking-after-disabling-the-cluttered-v0-l1qcac4tz6g81.jpg?width=2560&format=pjpg&auto=webp&s=affb7ce071aad973dc8b9caf0a054bc7654b5f9d,https://cdn.mos.cms.futurecdn.net/J7QJ9yZxuszn2DC2RSHreL-1200-80.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHZEEMDCUygOZgzThaF42pq570wXdpmrrsh6ZI_a8c8Mn0U-DC6p-7WFJT&s=10,https://images.hothardware.com/contentimages/article/3186/content/small_inventory-dyinglight2.jpg,https://cdn2.unrealengine.com/dying-light-2-stay-human-out-now-co-op-1920x1080-165762b78616.jpg,https://i.redd.it/9mk00bpb8f791.jpg	/badges/STEAM.png	534380	f	0	2026-09-25 07:37:25.513	2026-09-25 07:37:25.513	\N	\N	\N	f	\N	\N
8bb13baa-0a39-4737-9f8c-a8af6701d438	007 First Light	IO Interactive	4.1	Shooter, Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/coaoiz.jpg	2026-05-27	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: MICROSOFT WINDOWS 10/11, 64-BIT\nPROCESSOR: INTEL CORE i5 9500, AMD RYZEN 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GFORCE GTX 1660, AMD RX 5700, INTEL DISCRETE GPU EQUIVALENT\nSTORAGE: 80 GB available space\nADDITIONAL NOTES: SSD required	Requires a 64-bit processor and operating system\nOS: MICROSOFT WINDOWS 10/11, 64-BIT\nPROCESSOR: INTEL CORE i5 13500, AMD RYZEN 5 7600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GEFORCE RTX 3060 TI, AMD RX 6700 XT, INTEL DISCRETE GPU EQUIVALENT\nSTORAGE: 80 GB available space\nADDITIONAL NOTES: SSD required	https://youtu.be/gDvbGANDH4E?si=eKTDMInGTwDdGS17	https://sm.pcmag.com/pcmag_me/photo/default/6p9lgt_g4rq.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnnQwrcBykNO6ZzxyGubHGcV5f7Fh-DXZh-8SAPzeVPkIvw3z1kmgc4yw&s=10,https://www.galaxus.be/Files/7/7/0/8/9/5/8/7/James%20Bond%20007%20First%20Light%20Vorschau%20Digitec%20Galaxus%20Magazin%20A21.png,https://cdn.mos.cms.futurecdn.net/ysEswSMartY5Gq7uJDzqMc.jpg,https://media.triumphmotorcycles.co.uk/image/upload/f_auto/q_auto:eco/sitecoremedialibrary/media-library/images/central%20marketing%20team/for%20the%20ride/news/2026/april/triumph-official-motorcycle-partner-for-james-bond-game-007-first-light-1920x1080.jpg,https://gamingbolt.com/wp-content/uploads/2026/02/007-first-light-bawma-scaled.jpg,https://www.topgear.com/sites/default/files/2026/05/007%20First%20Light%20hero%20image.jpg,https://assetsio.gnwcdn.com/007-first-light-review-01.jpg?width=690&quality=85&format=jpg&dpr=3&auto=webp,https://media.overclock3d.net/2026/05/4Sg6QJcn-007-First-Light.jpg	/badges/STEAM.png	3768760	f	0	2026-09-25 07:37:25.517	2026-09-25 07:37:25.517	\N	\N	\N	f	\N	\N
a8706fd5-1442-4b32-b4de-4c72fbe1dcce	Assassin's Creed Shadows	Ubisoft Québec	4	Role-playing (RPG), Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/co87cu.jpg	2025-03-20	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: INTEL® Core TM i7 8700K AMD RYZEN 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA® GEFORCE GTX 1650 4GB / AMD RX-5500 XT 8GB / INTEL® ARC TM A380 6GB (REBAR ON)"\nDIRECTX: Version 12\nSTORAGE: 115 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: Intel® Core™ i5 11600k/AMD Ryzen™ 5 5600x\nMEMORY: 16 GB RAM\nGRAPHICS: Nvidia® GeForce RTX™ 3060Ti 8GB/AMD Radeon™ RX 6700 XT 12GB/Intel® Arc™ B580 12GB (REBAR ON)\nDIRECTX: Version 12\nSTORAGE: 115 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	https://youtu.be/vovkzbtYBC8?si=puQdcGajNkBxP5xU	https://game.intel.com/wp-content/uploads/2025/03/ac-shadows-newsletter01-1920x1080-1.jpg,https://i.redd.it/tzorvqk6dc0f1.png,https://sm.ign.com/ign_in/gallery/a/assassins-/assassins-creed-shadows-exclusive-concept-art_v9sw.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpJT6MHBvNInRUtnKHY07wrOuUe3xot8A4AyucRHTvvJgcm-v14IjcX48x&s=10,https://cdn2.unrealengine.com/header-1-3805x2160-66c78bcda1a7.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/06/assassin-s-creed-shadows-ui.jpg?q=49&fit=contain&w=1920&h=1080&dpr=2	/badges/Ubsoft.png	3159330	f	0	2026-09-25 07:37:25.522	2026-09-25 07:37:25.522	\N	\N	\N	f	\N	\N
1368fc22-e424-4ffc-8b57-08cf091e69a7	Assassin's Creed Black Flag Resynced	Ubisoft Singapore	4.2	Platform, Hack and slash/Beat 'em up, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobyue.jpg	2026-07-09	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit only), Windows 11\nPROCESSOR: Intel Core i7-8700K 3.7 GHz, AMD Ryzen 5 3600 3.6 GHz\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 (6GB), AMD Radeon RX5500XT (8GB) or Intel ARC A580 (8GB)\nDIRECTX: Version 12\nSTORAGE: 65 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit only), Windows 11\nPROCESSOR: Intel Core i5-10600K 4.1 GHz, AMD Ryzen 5 3600 3.6 GHz\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060 (12GB),AMD Radeon RX6600XT (8GB), or Intel ARC B580 (12GB)\nDIRECTX: Version 12\nSTORAGE: 65 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	https://youtu.be/WjsTLe7bBUA?si=mb5VORj-nX9kRDd_	https://image.api.playstation.com/vulcan/ap/rnd/202603/1215/30972495c4d1b567dcd015b80c0d3af9c946efc8822944d7.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2ub4BSZLn2gtJiLGNXNqBkRbUt5wJE9eQ-tcmTK-DDvG04OELn6gZpZL_&s=10,https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3751950/36e3aa0f93c31cae968381adfc6b5d4cd1754910/ss_36e3aa0f93c31cae968381adfc6b5d4cd1754910.1920x1080.jpg?t=1787915122,https://www.topgear.com/sites/default/files/2026/07/Assassin%E2%80%99s%20Creed%20Black%20Flag%20Resynced.jpg,https://gamegpu.com/images/1_2025/NEWS/q4/nov/asus/Resynced_2.jpg,https://cdn.mos.cms.futurecdn.net/njSDhMPf9MSFvUZGRgKunA.jpg,https://insertcoins.press/_next/image?url=%2Fimages%2Fblackflagresynced%2Fscreenshot-1.webp&w=3840&q=75&dpl=dpl_5gSdJmJSQcU6ay1fr2Kavd2tHkBx,https://gamingbolt.com/wp-content/uploads/2026/04/Assassins-Creed-Black-Flag-Resynced-2-scaled.jpg,https://preview.redd.it/assassins-creed-black-flag-resynced-deep-dive-into-hud-v0-at7q5ec966yg1.png?width=3840&format=png&auto=webp&s=5c4fc9707c0d5d284f6bfc0ddf0bac2fbc44b159,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1WKnHDpbhg_25UtG41rtO0ZhYIOaofWZrMTYMm0AoZhrO6RS5A-sPbowf&s=10,https://vulkk.com/wp-content/uploads/2026/07/Black-Flag-Resynced-Simplified.jpg,https://mp1st.com/wp-content/uploads/2026/07/assassins-creed-black-flag-resynced-img2.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFOlnlobjT3q5_zzRjebviukowF7h0x33H-Pcdm4m649KJRah3TTrUEC8&s=10,https://preview.redd.it/assassins-creed-black-flag-resynced-deep-dive-into-the-v0-ydcl331veh3h1.png?width=3840&format=png&auto=webp&s=d31a3fc4635906c2330c6a77c422e5d8367d99e1	/badges/Ubsoft.png	3751950	f	0	2026-09-25 07:37:25.525	2026-09-25 07:37:25.525	\N	\N	\N	f	\N	\N
8f4fbcea-1198-4d72-9633-e3b0d3bd885f	Mortal Shell II	Cold Symmetry	4	Role-playing (RPG), Adventure	250	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocqos.jpg	2026-08-20	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	OS: Windows 10 / 11\nPROCESSOR: Intel Core i7-10700K @ 3.8 GHz or better or AMD Ryzen 5 3600 @ 3.6 GHz or better\nGRAPHICS: NVIDIA GeForce RTX 2060 SUPER 8 GB or AMD Radeon RX 6600 8 GB\nADDITIONAL NOTES: SSD required	\N	https://youtu.be/MIEHUDi6DwU?si=tyjMTYqClwNb8Yho, https://youtu.be/cPSE1yrooT4?t=7	https://assets-mortalshell2.lon1.cdn.digitaloceanspaces.com/2d35bbdf59a6c1dd3368d0ce5758aa4f.png,https://www.playstack.com/_astro/Mortal%20Shell%20II%20In-Game%20Screenshot%2011.CW9rqUUm.jpg,https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4711740/5d8abca2b0c59292425e091aeb013f1eca948cbb/ss_5d8abca2b0c59292425e091aeb013f1eca948cbb.1920x1080.jpg?t=1787154717,https://sm.pcmag.com/pcmag_me/photo/default/ep4qdg_5vfc.jpg,https://assetsio.gnwcdn.com/blackridge-action-mortal-shell-2.jpg?width=2048&height=2048&fit=bounds&quality=85&format=jpg&auto=webp,https://assetsio.gnwcdn.com/mortal-shell-2-walkthrough-desolate-peak-00004.jpg?width=2048&height=2048&fit=bounds&quality=85&format=jpg&auto=webp,https://preview.redd.it/mortal-shell-2-interactive-map-complete-100-guide-v0-12sj6n8wn8kh1.png?width=2550&format=png&auto=webp&s=d44d5f5a7a4d11aa71c91cf3a199657e9cddb179	/badges/STEAM.png	2584270	f	0	2026-09-25 07:37:25.531	2026-09-25 07:37:25.531	\N	\N	\N	f	\N	\N
16dbdeda-c634-4283-853b-9d4a5f94f0eb	Resonance: A Plague Tale Legacy	Asobo Studio	4.2	Adventure	259	0	https://images.igdb.com/igdb/image/upload/t_1080p/coc79u.jpg	2026-08-27	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit\nPROCESSOR: AMD Ryzen 3 3100 / Intel Core i3-12100\nMEMORY: 16 GB RAM\nGRAPHICS: 6 GB VRAM, AMD Radeon RX 5500 XT / Nvidia GeForce GTX 1060\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nADDITIONAL NOTES: SSD Required. CPU with 4 Cores / 8 Threads required. GPU with DX12.1 / Shader Model 6.6 required. 30 FPS in 1920x1080 with "Low" preset.	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit\nPROCESSOR: AMD Ryzen 5 5600X / Intel Core i5-12400F\nMEMORY: 16 GB RAM\nGRAPHICS: 8GB VRAM, AMD Radeon RX 6700 XT / Nvidia GeForce RTX 3060 Ti\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nADDITIONAL NOTES: SSD Required. CPU with 4 Cores / 8 Threads required. GPU with DX12.1 / Shader Model 6.6 required. 60 FPS in 1920x1080 with the "Ultra" preset.	https://youtu.be/hqmiwl2zkko?si=Qb_sIDPPq9zbcDeK	https://i.ytimg.com/vi/SGo2yz_yW5U/maxresdefault.jpg,https://i.redd.it/3-new-screenshots-for-resonance-have-dropped-v0-5c5c2kfpfq0h1.jpg?width=2048&format=pjpg&auto=webp&s=c253e517e71771b40f15196bc13e61ed3da64c2d,https://cdn.mos.cms.futurecdn.net/K5UcMTZ2NeQBRmwbvgEv2S.jpg,https://static0.polygonimages.com/wordpress/wp-content/uploads/2026/06/resonance_screenshot_preview-2_.png,https://static0.polygonimages.com/wordpress/wp-content/uploads/2026/08/resonance_screenshot_4k_06.png?q=49&fit=crop&w=825&dpr=2,https://cdn.mos.cms.futurecdn.net/BXqBjV9QHCgq5tRsbCF92S.jpg,https://cdn.mos.cms.futurecdn.net/87KXMATnTKEsYgx5r4sqvR.jpg,https://cdn.mos.cms.futurecdn.net/pYFKbfafjG96TU9WRVJi3S.jpg	/badges/STEAM.png	2713000	f	0	2026-09-25 07:37:25.533	2026-09-25 07:37:25.533	\N	\N	\N	f	\N	\N
3bc74105-2a80-43ff-9674-47b8d1921aad	Beast of Reincarnation	Game Freak	4.1	Role-playing (RPG), Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobc5q.jpg	2026-08-04	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: Intel Core i5-8400 or AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1070 (8 GB) or AMD Radeon RX 580 (8 GB)\nDIRECTX: Version 12\nSTORAGE: 45 GB available space\nADDITIONAL NOTES: Low 1080p @ 40fps w/ DLSS (RTX 20-50 Series) or FSR1 (Performance). SSD required.	Requires a 64-bit processor and operating system\nOS: Windows 11\nPROCESSOR: Intel Core i7-12700K or AMD Ryzen 7 5800X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060 (12 GB) or AMD Radeon RX 6700 XT (12 GB)\nDIRECTX: Version 12\nSTORAGE: 45 GB available space\nADDITIONAL NOTES: Med 1080p @ 60fps w/ DLSS or FSR3 (Performance). SSD required.	https://youtu.be/H0r-Kap8kWI?si=qW2nwVnbQcchqHDw	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtDjylhuLJ2qy8PZif927qIcrlI6C--MBWNd1AUk9YE44PYgkW2tYq7lU&s=10,https://insertcoins.press/_next/image?url=%2Fimages%2Fbeastofreincarnation%2Fscreenshot-3.webp&w=3840&q=75&dpl=dpl_39d3cnF2X7u6U6jwkkZkmKw7yxrH,https://www.rpgfan.com/wp-content/uploads/2025/06/Beast-of-Reincarnation-Screenshot-020.webp,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/BeastOfReincarnation_35.png,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/BeastOfReincarnation_49.png,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/beast-of-reincarnation-ability-selection.png	/badges/STEAM.png	2001760	f	0	2026-09-25 07:37:25.536	2026-09-25 07:37:25.536	\N	\N	\N	f	\N	\N
dc3dc755-8e3f-4eb6-90e7-c87bd14b9226	Grand Theft Auto V [Online/Offline]	Rockstar North	4.4	Shooter, Racing, Arcade	799	0	https://images.igdb.com/igdb/image/upload/t_1080p/co9751.jpg	2015-04-14	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 64 Bit\nPROCESSOR: Intel Core 2 Quad CPU Q6600 @ 2.40GHz (4 CPUs) / AMD Phenom 9850 Quad-Core Processor (4 CPUs) @ 2.5GHz\nMEMORY: 4 GB RAM\nGRAPHICS: NVIDIA 9800 GT 1GB / AMD HD 4870 1GB (DX 10, 10.1, 11)\nSTORAGE: 125 GB available space\nSOUND CARD: 100% DirectX 10 compatible	Requires a 64-bit processor and operating system\nOS: Windows 10 64 Bit\nPROCESSOR: Intel Core i5 3470 @ 3.2GHz (4 CPUs) / AMD X8 FX-8350 @ 4GHz (8 CPUs)\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 660 2GB / AMD HD 7870 2GB\nSTORAGE: 125 GB available space\nSOUND CARD: 100% DirectX 10 compatible	https://youtu.be/hvoD7ehZPcM?si=WTmZN_bZciCWTEpC	https://wallpapers.com/images/hd/gta-5-landscape-art-2a58lbxzfpa0xjg7.jpg,https://images.alphacoders.com/587/587533.jpg,https://media.gtaboom.com/media/images/2e/a1/Pc-4k-5.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlc-to9x8bYUnCwjMvFuHxjTvxRFsYhZltznXfgbZrqHWP-4mweRLii8Dx&s=10,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/02/gta5-screenshot-cityscape-landscape.jpg,https://m.thegtaplace.com/images/gtav/screenshots/ps4/1014-1920.jpg,https://img.gta5-mods.com/q95/images/realistic-vegetation-new-gen-tree-models-gta-5-legacy/619e21-gta5characters.jpg,https://staticg.sportskeeda.com/editor/2024/05/04c35-17152393925829-1920.jpg,https://cdn.wccftech.com/wp-content/uploads/2015/07/GTA-5-2.jpg	/badges/EPIC_Game.png	271590	f	0	2026-09-25 07:37:25.538	2026-09-25 07:37:25.538	\N	\N	\N	f	\N	\N
5b64bbfb-e89f-4ddc-b48e-c0956afa3e1b	Cyberpunk 2077	CD Projekt RED	4.6	Shooter, Role-playing (RPG), Adventure	120	0	https://images.igdb.com/igdb/image/upload/t_1080p/co7iy1.jpg	2023-09-26	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: 64-bit Windows 10\nPROCESSOR: Core i7-6700 or Ryzen 5 1600\nMEMORY: 12 GB RAM\nGRAPHICS: GeForce GTX 1060 6GB or Radeon RX 580 8GB or Arc A380\nDIRECTX: Version 12\nSTORAGE: 70 GB available space	Requires a 64-bit processor and operating system\nOS: 64-bit Windows 10\nPROCESSOR: Core i7-12700 or Ryzen 7 7800X3D\nMEMORY: 16 GB RAM\nGRAPHICS: GeForce RTX 2060 SUPER or Radeon RX 5700 XT or Arc A770\nDIRECTX: Version 12\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD required.	https://youtu.be/8X2kIfS6fb8?si=GeHCoMMi2wX0Wfpy	https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077_CDPROJEKTRED_S1_03_2560x1440-359e77d3cd0a40aebf3bbc130d14c5c7,https://www.cyberpunk.net/build/images/social-thumbnail-en-ddcf4d23.jpg,https://cdn.mos.cms.futurecdn.net/YZovPjNUcPQPFzVsNpQqdQ.jpg,https://i.extremetech.com/imagery/content-types/02NA51AaZUZ570NIxAe70ux/hero-image.fit_lim.v1678673455.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMVpbq09pyhY5G6DhrugY8kDqS5I-w96vTYMwnabm_tlnJsHnw9yXGD7cQ&s=10,https://i0.wp.com/waytoomany.games/wp-content/uploads/2022/02/Cyberpunk-2077_20220216225610.jpg?ssl=1,https://i0.wp.com/waytoomany.games/wp-content/uploads/2022/02/Cyberpunk-2077_20220216225434.jpg?ssl=1,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ56gdbc3nDBrg8Gk1-0n3XSmVgwMTKzAoykc_g39Y_7TH2WjWmTY11HZw&s=10,https://cdn.mos.cms.futurecdn.net/dU6v9LeMk4J6sWA4yQbRFe.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkDBVpDYsOmFwgQoqVosIj-RTIm9zBrVomhs8stOeUdw&s=10	/badges/STEAM.png	1091500	f	0	2026-09-25 07:37:25.54	2026-09-25 07:37:25.54	\N	\N	\N	f	\N	\N
c6beaa20-cc45-464d-96c3-af2692561af3	PRAGMATA	Capcom	4.4	Shooter, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobxnx.jpg	2026-04-17	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 11 (64 bit)\nPROCESSOR: Intel Core i5-8500 / AMD Ryzen 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 6 GB / Radeon RX 5500 XT 8 GB\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 40 GB available space\nADDITIONAL NOTES: Estimated performance when set to "Performance" preset: 1080p/45 fps. Framerate might drop in graphics-intensive scenes. SSD recommended.	Requires a 64-bit processor and operating system\nOS: Windows 11 (64 bit)\nPROCESSOR: Intel Core i7-8700 / AMD Ryzen 5 5500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 2060 Super 8GB / Radeon RX 6600 8GB\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 40 GB available space\nADDITIONAL NOTES: Estimated performance when set to "Balanced" preset: 1080p/60 fps. Frame rate might drop in graphics-intensive scenes. AMD Radeon RX 6700 XT 12GB or NVIDIA GeForce RTX 3060 12GB required to support ray tracing. SSD recommended.	https://youtu.be/oncaa_fMsyw?si=wduuA2nPbMRBlymS	/uploads/1788269317431-62680490.jpg,https://cdn.mos.cms.futurecdn.net/hf3f9V3VhiS3msYyJccywT.jpg,https://cdn.mos.cms.futurecdn.net/KPTx8mngUtd3DhMym8TdnC.jpg,https://cdn.mos.cms.futurecdn.net/jsNhYxFV4igywpWM2yrymC-1920-80.jpg,https://xboxwire.thesourcemediaassets.com/sites/2/2026/03/vlcsnap-2026-03-16-14h10m48s855-c3d328a550fc51d4ac16.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQDCUZpP4fJNEt88sTdkQpb2sjVQgnKeemQZOw0Nf6Z23aeN3-YY-qfHo&s=10,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgcF_qzLTMFzUjs3NO1mpanaE8oW8xzVX8e_teROX52OQCCF5Gbm7FEFGr&s=10,https://gamegpu.com/images/1_2025/GAMES/PRAGMATA_SKETCHBOOK_-_DEMO/game/PRAGMATA_SKETCHBOOK_2025_12_14_00_15_19_050_ggpu.webp,https://preview.redd.it/the-perfect-configuration-for-pragmata-on-the-steam-deck-v0-fvtt06ke3ujg1.jpeg?width=1080&crop=smart&auto=webp&s=d7dec3eb195834eb301244aabf625758ca52793e,https://gameinformer.com/sites/default/files/styles/og_image/public/2025/06/27/12a83964/pragmata_ss_08.jpg.webp	/badges/STEAM.png	3357650	f	0	2026-09-25 07:37:25.545	2026-09-25 07:37:25.545	\N	\N	\N	f	\N	\N
b23d7cee-3bfa-4003-80d2-124bcab9352f	Crimson Desert	Pearl Abyss	4.3	Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/coaqai.jpg	2026-03-19	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nPROCESSOR: Ryzen 5 2600X / i5-8500\nMEMORY: 16 GB RAM\nGRAPHICS: RX 5500 XT / GTX 1060\nDIRECTX: Version 12\nSTORAGE: 150 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: SSD required.	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nPROCESSOR: Ryzen 5 5600 / i5-11600K\nMEMORY: 16 GB RAM\nGRAPHICS: RX 6700 XT / RTX 2080\nDIRECTX: Version 12\nSTORAGE: 150 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: SSD required.	https://youtu.be/c5-8FXNmyJs?si=ZGAg2f8TEn7i-Ki7	https://preview.redd.it/big-update-for-crimson-desert-has-it-looking-better-than-v0-lg1brbfakwwg1.jpeg?width=1080&crop=smart&auto=webp&s=cfcacd6bf9fd97e2090c315a88509e220f6e3a23,https://sm.ign.com/ign_sea/gallery/c/crimson-de/crimson-desert-ign-first-combat-and-mounts-screenshots_8fcr.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSQIjl8OFIHwxQEtJhH9E6JXV5ED51QMe-KOCLvUcZBfCQUgptNaQBIce5&s=10,https://static0.thegamerimages.com/wordpress/wp-content/uploads/wm/2026/03/dragon-in-crimson-desert-2.jpg?q=49&fit=crop&w=825&dpr=2,https://www.dexerto.com/cdn-image/wp-content/uploads/2025/06/18/crimson-desert-first-impressions-dexerto-summer-game-fest.jpg?width=1200&quality=60&format=auto,https://static0.fextralifeimages.com/wordpress/wp-content/uploads/2025/10/crimson-desert-new-gameplay-october.jpg?q=49&fit=crop&w=825&dpr=2,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIh36IGXTCqGvZyiJov1nek9JV0E5sorRpEDW6GYmD_egv1xrnyQ8jDszk&s=10,https://www.pcgamesn.com/wp-content/sites/pcgamesn/2026/03/cd-review-view.jpg	/badges/STEAM.png	3321460	f	0	2026-09-25 07:37:25.547	2026-09-25 07:37:25.547	\N	\N	\N	f	\N	\N
353a203f-450c-4a82-8703-6bc05d2cfa76	Red Dead Redemption 2	Rockstar Games	4.7	Shooter, Role-playing (RPG), Adventure	850	0	https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.jpg	2018-10-26	Google Stadia, PlayStation 4, PC (Microsoft Windows), Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10 - 64-bit\nPROCESSOR: Intel® Core™ i5-2500K / AMD FX-6300\nMEMORY: 8 GB RAM\nGRAPHICS: Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB\nNETWORK: Broadband Internet connection\nSTORAGE: 150 GB available space\nSOUND CARD: Direct X Compatible	Requires a 64-bit processor and operating system\nOS: Windows 10 - 64-bit\nPROCESSOR: Intel® Core™ i7-4770K / AMD Ryzen 5 1500X\nMEMORY: 12 GB RAM\nGRAPHICS: Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB\nNETWORK: Broadband Internet connection\nSTORAGE: 150 GB available space\nSOUND CARD: Direct X Compatible	https://youtu.be/eaW0tYpxyp0?si=cZdp_U4HsKWjKjwd	https://wallpapercat.com/w/full/8/7/5/663-3840x2160-desktop-4k-red-dead-redemption-wallpaper-photo.jpg,https://www.playstationlifestyle.net/wp-content/uploads/sites/9/2018/10/Red-Dead-Redemption-2-horse-loyalty-gameplay.jpg.optimal.jpg,https://i.redd.it/graphics-in-this-game-are-just-insane-v0-y79re87ym0ne1.jpg?width=1920&format=pjpg&auto=webp&s=452bc8180631d425dc60bb17dafa612d6c8db72b,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx447J6SEjxEEjRix3Jm2XEe4x5SppDjP5sgXCrHGLlpoNBUOEf6mGmRQ&s=10,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7wZSeV0Qfl3ZjxAmDEGHiAMNF9Pm2x2ASZI6AwIjaN8c_PdOx0VKjr2o&s=10,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJEzMXV2TSpQczyu3jVJSUYWh6FILfU6xqEOHmC5spEap7vrJ_JeUS2vc&s=10,https://cdna.artstation.com/p/assets/images/images/044/000/460/large/elizabeth-kirkpatrick-hud-redesign-3.jpg?1638836584,https://interfaceingame.com/wp-content/uploads/red-dead-redemption-2/RDR2_21.png,https://cdna.artstation.com/p/assets/images/images/044/000/462/large/elizabeth-kirkpatrick-hud-redesign-4.jpg?1638836589	/badges/ROCKSTAR.png	1174180	f	0	2026-09-25 07:37:25.549	2026-09-25 07:37:25.549	\N	\N	\N	f	\N	\N
30ab13bd-4456-4297-8909-140e170eaaf7	Dune Awakening 	Funcom	4.1	Role-playing (RPG), Adventure	129	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobf3a.jpg	2025-06-10	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7	\N	OS: Windows (64-bit) 10\nPROCESSOR: Intel Core i5-2500 @ 3,3 GHz (4 CPUs)\nMEMORY: 8 GB RAM\nGRAPHICS: NVidia GeForce GTX 1050\nDIRECTX: Version 11\nSTORAGE: 2 GB available space	OS: Windows (64-bit) 10\nPROCESSOR: Intel Core i7-11700K or AMD Ryzen 7 5800X\nGRAPHICS: NVIDIA GeForce GTX 1660S, 6 GB or AMD Radeon RX 5600 XT, 6 GB\nDIRECTX: Version 11\nSTORAGE: 2 GB available space	https://youtu.be/ztdVjiRpYfo?si=lZmPZi5ZFPnp_XT1	https://static.bandainamcoent.eu/high/dune/dune-awakening/00-page-product/DUNE-KeyArt.jpg,https://kotaku.com/app/uploads/2025/06/7f9738b31f9196affb74fc65c0edc578.jpg,https://cdn.mos.cms.futurecdn.net/CQDD5ZEgyub9mDYxMHhAc9.jpg,https://copperice.co.uk/wp-content/uploads/2025/07/dune-awakening-scaled.jpg,https://www.techspot.com/images2/news/bigimage/2022/08/2022-08-24-image-12.jpg,https://i.redd.it/fs8tua0pyhxc1.jpeg,https://blogcritics.org/wp-content/uploads/2025/07/04-UI_Launch_BuildingMenu-2048x1152-1.webp,https://cdn.checkpointgaming.net/wp-content/uploads/2025/06/18010920/Dune-2-scaled.jpg	/badges/STEAM.png	1172710	f	0	2026-09-25 07:37:25.55	2026-09-25 07:37:25.55	\N	\N	\N	f	\N	\N
6fadd839-4276-4e3f-b740-d1b21570112a	Legendary Bundle	Steam	0	Bundle	1499	0	https://cdn.discordapp.com/attachments/1515020148279480402/1552952419795738674/steam_share_image.jpg?ex=6ab77b25&is=6ab629a5&hm=ed4451a68ae384987b34ee64fc247ff22a4ffb2f90a94029afb2235f45b5d972&	2026-09-25	Windows	f	f	f	\N	\N	7						/badges/STEAM.png		f	0	2026-09-25 07:58:02.672	2026-09-25 07:59:27.025	15000	\N	legendary-bundle	t	UNCHARTED: Legacy of Thieves, God Of War Ragnarok, Cyberpunk 2077	\N
b84b8e8b-8bd6-4ae2-bf29-7ccee9c25272	Forza Horizon 6	Playground Games	4.3	Racing, Simulator, Sport, Arcade	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobc5n.jpg	2026-05-19	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 22H2 (version 19045) or higher\nPROCESSOR: Intel i5-8400 OR AMD Ryzen 5 1600\nMEMORY: 16 GB RAM\nGRAPHICS: Nvidia GTX 1650 OR AMD RX 6500 XT OR Intel Arc A380\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 167 GB available space\nADDITIONAL NOTES: SSD Required\n	Requires a 64-bit processor and operating system\nOS: Windows 10 22H2 (version 19045) or higher\nPROCESSOR: Intel i5-12400F OR AMD Ryzen 5 5600X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA RTX 3060 Ti OR AMD RX 6700 XT OR Intel Arc A580\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 167 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/oYhaW-Vr4wg?si=co12PB0wfPkehq-u	https://cdn.mos.cms.futurecdn.net/AR3xHJZobZrtxstWSkaGdT-1900-80.jpg,https://s1.cdn.autoevolution.com/images/news/forza-horizon-6-full-map-revealed-alongside-new-in-game-footage-268280_1.jpg,https://traxion.gg/wp-content/uploads/2026/01/Forza-Horizon-6-confirmed-for-PS5-in-late-2026.jpg,https://i.ytimg.com/vi/T2Z1NqcT074/maxresdefault.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMK_PnZALHWASHXwKsMDae6VY3G0pI0n_scaBzLvOFBGlL_vfUfJnCjB2x&s=10,https://cdn.mos.cms.futurecdn.net/FyXsCUZdfJmyNgGdtZmybh-1920-80.jpg	/badges/STEAM.png	2483190	f	0	2026-09-25 07:37:25.543	2026-09-25 07:52:41.614	\N	\N	forza-horizon-6	f	\N	\N
20247d85-8958-4aa1-9c65-de514c75d584	Subnautica 2	Unknown Worlds Entertainment	4.5	Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/co8yd0.jpg	2026-05-14	Xbox Series X|S, PC (Microsoft Windows)	f	f	f	\N	\N	7		OS: Windows 10/11\nProcessor: Intel Core i5-8400 / AMD Ryzen 5 2600\nMemory: 12 GB RAM\nGraphics: GeForce GTX 1660 6GB / RX 5500 XT 6GB\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 50 GB available space\nAdditional Notes: Requires a 64-bit processor and operating system	OS: Windows 11\nProcessor: Intel Core i7-13700 / AMD Ryzen 7 7700X\nMemory: 16 GB RAM\nGraphics: Geforce RTX 3070 8GB / RX 6700 XT 8GB\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 50 GB available space\nAdditional Notes: Requires a 64-bit processor and operating system	https://www.youtube.com/watch?v=WS0vTRl_2PQ		/badges/STEAM.png		f	0	2026-09-25 07:37:25.555	2026-09-25 10:33:00.821	1800	60	subnautica-2	f	\N	\N
e81aee38-ab9d-4ea6-adc4-cf46b289e6cc	UNCHARTED: Legacy of Thieves	Naughty Dog	4.5	Shooter, Adventure	149	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocqz5.jpg	2022-01-28	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10 64-bit\nPROCESSOR: Intel i5-4430, AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 960 (4 GB), AMD R9 290X (4 GB)\nDIRECTX: Version 12\nSTORAGE: 126 GB available space	OS: Windows 10 64-bit\nPROCESSOR: Intel i7-4770, AMD Ryzen 5 1500X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GTX 1060 (6 GB), AMD RX 570 (4 GB)\nDIRECTX: Version 12\nSTORAGE: 126 GB available space	https://youtu.be/xeMA3O9pfiY?si=5iURYAgxGgf39Lc7	https://pbs.twimg.com/media/FgAeNM_X0AArL_T.jpg,https://image.api.playstation.com/vulcan/ap/rnd/202111/2000/Ta807nPySbwuYgWk5XDFEgDy.jpg,https://d1lss44hh2trtw.cloudfront.net/assets/article/2022/01/25/uncharted-legacy-of-thieves-collection-impressions_feature.jpg,https://www.dsogaming.com/wp-content/uploads/2022/06/Uncharted-4-screenshot.jpg,https://www.nme.com/wp-content/uploads/2021/10/Uncharted-4-A-Thiefs-End.jpg,https://cdn.checkpointgaming.net/wp-content/uploads/2022/10/29153909/TLL-16.9-Action-WM.jpg,https://nextrift.com/wp-content/uploads/2022/01/uncharted-legacy-of-thieves-collection-review-27.jpg,https://cdn2.unrealengine.com/uncharted-legacy-of-thieves-collection-1920x1080-4eaf1476b5a2.jpg,https://image.api.playstation.com/cdn/EP9000/CUSA07875_00/FREE_CONTENTXHMzTp4FIDVD8zUxP9Rs/UTLL-Launch-Screenshot_11.png	/badges/STEAM.png	1659420	f	0	2026-09-25 07:37:25.491	2026-09-25 08:03:42.917	\N	\N	uncharted-legacy-of-thieves	f	\N	\N
e90570d2-c6cd-46ae-b72d-96dc5a0d81ac	Silent Hill: Townfall	Screen Burn	4.2	Puzzle, Adventure	250	0	https://images.igdb.com/igdb/image/upload/t_1080p/coc5sw.jpg	2026-09-24	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 11 x64\nPROCESSOR: AMD Ryzen 5 3600 / Intel i7-8700K\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 2060 Super / AMD Radeon RX 6600\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: Playing on minimum requirements should enable to play on Low settings at 1080p 30fps.	Requires a 64-bit processor and operating system\nOS: Windows 11 x64\nPROCESSOR: AMD Ryzen 7 5700X / Intel i7-9700K\nMEMORY: 32 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3080 / AMD Radeon RX 7800 XT\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: Playing on recommended requirements should enable play on High settings at 4K 30fps (using DLSS,FSR or TSR Balanced mode).	https://youtu.be/RALnTmNg_ss?si=xHBKziO8TClxEQU1		/badges/STEAM.png		f	0	2026-09-25 08:08:39.282	2026-09-25 08:10:30.377	3889	100	silent-hill-townfall	f	\N	\N
90ccb66e-58dc-4b0f-ad35-3bf325993f8a	Control Resonant	Remedy Entertainment	4.3	Role-playing (RPG), Hack and slash/Beat 'em up, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/coc64f.jpg	2026-09-24	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 / 11 (64 bit)\nPROCESSOR: Intel i5-8500 / AMD Ryzen 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: Geforce GTX 1070 / Radeon RX 5600 XT / Intel Arc A580\nSTORAGE: 120 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10 / 11 (64 bit)\nPROCESSOR: Intel Core i7-10700 / AMD Ryzen 7 3700X\nMEMORY: 16 GB RAM\nGRAPHICS: Geforce RTX 3060 Ti / Radeon RX 6700 XT / Intel Arc B580\nSTORAGE: 120 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/SqvAvOAd1VA?si=szTvDgAsjH1ubGzq		/badges/STEAM.png		f	0	2026-09-25 08:10:06.215	2026-09-25 08:11:02.616	3599	100	control-resonant	f	\N	\N
\.


--
-- Data for Name: GameReaction; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."GameReaction" (id, "userId", "gameId", type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Order" (id, "userId", status, "totalAmount", "couponCode", "couponDiscount", "commissionEarned", purpose, "submittedUtr", "paymentMethod", "expiresAt", "createdAt", "updatedAt") FROM stdin;
VP3549AABD	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	2	\N	\N	\N	\N	\N	DELTA_PAY	2026-09-25 10:56:50.194	2026-09-25 09:56:50.212	2026-09-25 09:58:02.794
VP33463E54	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	2	\N	\N	\N	\N	739490999742	DELTA_PAY	2026-09-25 11:04:43.237	2026-09-25 10:04:43.238	2026-09-25 10:08:45.919
VP6428EC5E	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	3	\N	\N	\N	\N	869937082294	DELTA_PAY	2026-09-25 11:26:07.859	2026-09-25 10:26:07.881	2026-09-25 10:27:11.54
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."OrderItem" (id, "orderId", "gameId", "pricePaid", "createdAt") FROM stdin;
\.


--
-- Data for Name: OtpVerification; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."OtpVerification" (id, email, otp, "expiresAt", "createdAt", purpose) FROM stdin;
3f8a34d8-3980-4e84-902f-aafa992d0d9a	zamir.0hub@gmail.com	483936	2026-09-25 08:25:04.991	2026-09-25 08:15:04.993	general
75f35e16-5a9d-4e6c-a895-c6fc50901478	vermaanchal921@gmail.com	635191	2026-09-25 09:26:25.383	2026-09-25 09:16:25.386	general
947fd128-c65c-484f-85c0-6766a4bbbe6c	test_aritra@valqore.pro	102734	2026-09-25 09:42:12.223	2026-09-25 09:32:12.233	general
05811346-6895-486d-8fd1-4673032c8e49	test_aritra2@valqore.pro	128982	2026-09-25 09:42:20.476	2026-09-25 09:32:20.477	general
4a670a44-28c5-43c4-8904-21b4ebe155ab	sanity@valqore.pro	862327	2026-09-25 09:45:36.482	2026-09-25 09:35:36.484	general
\.


--
-- Data for Name: ParsedEmail; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."ParsedEmail" (id, "messageId", status, "createdAt") FROM stdin;
bbb8d681-6e18-4d78-90fa-eb7b091e2dda	1a0d7ff7fa01c63f	PROCESSED	2026-09-25 10:08:11.53
169d74d0-6661-4f1c-ac2a-c913059cd4c8	1a0d809d063c0233	PROCESSED	2026-09-25 10:08:45.943
ffde6c44-486b-4e2b-b201-23913e50af34	1a0d81ac2032a07d	PROCESSED	2026-09-25 10:27:11.555
\.


--
-- Data for Name: Poster; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Poster" (id, "imageUrl", "isActive", "createdAt") FROM stdin;
58e66460-8873-4bfa-a2b5-7f04dab76a5d	https://m.media-amazon.com/images/I/71ACwyYY3KL.jpg	t	2026-09-25 08:05:54.905
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Transaction" (id, utr, amount, "transactionId", sender, date, "orderId", "createdAt") FROM stdin;
e17ff805-d565-470f-984c-d70365c9cf3c	254633548299	2	FMPIB6667929651	LAKSHMI PAUL	03:27 PM IST, 25 September 2026	\N	2026-09-25 10:08:11.506
417cb26a-8516-4e9a-8e75-916c4acffa31	739490999742	2	FMPIB6667997417	LAKSHMI PAUL	03:38 PM IST, 25 September 2026	VP33463E54	2026-09-25 10:08:45.896
ad261974-516b-4a80-8146-6ec87eff8bd3	869937082294	3	FMPIB6668110198	DANISH	03:57 PM IST, 25 September 2026	VP6428EC5E	2026-09-25 10:27:11.533
\.


--
-- Data for Name: TrustedDevice; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."TrustedDevice" (id, "userId", "tokenHash", "userAgent", "ipAddress", "expiresAt", "lastUsedAt", "createdAt") FROM stdin;
3896f3b1-03c6-4229-910f-a8122f95a170	788e7f1a-5956-4b7b-be9d-132fb9e7d67d	3b165c840c1400f2f2993d7fca110a1ed381c4f94c304643041d83a874091502	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	162.158.88.40	2026-10-25 11:25:03.885	2026-09-25 11:29:05.077	2026-09-25 11:25:03.887
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."User" (id, username, email, password, "steamMonUsername", "steamMonPassword", "createdAt") FROM stdin;
89c82d40-be7d-46fc-9219-9075ed9c688b	zamir	zamir.0hub@gmail.com	$2b$10$PVYgbXu4gCvuWgE1JtK7Ou2q9DAKJLqyWGGmQTP33kgmvL5z4N40e	\N	\N	2026-09-25 08:13:10.221
29291cad-111a-4ed6-ab50-56339213891b	flash	pal1981lakshmi@gmail.com	$2b$10$PqAYDO6HonPDNTpLc6VSG.plcv0zol.WhDHIyG/1ynQQM3dn0wIt.	\N	\N	2026-09-25 08:38:34.053
0a86fe19-6fa6-46c6-b995-b0d7e25e4d68	valqorepro	valqore.pro@gmail.com	$2b$10$aXDhkvrhX.jgMj4YZQeJQuNBoz77gTc724/dVNMuyXd80qXVGu4..	\N	\N	2026-09-25 08:45:49.974
962fc593-0b61-4514-8cbe-b108220aff24	Anchal	vermaanchal921@gmail.com	$2b$10$w7snWBC.znLkEWW0rtmhoeuDcZk6rn6srHLoOV9qgQMLz5PeiuAWC	\N	\N	2026-09-25 08:55:57.661
788e7f1a-5956-4b7b-be9d-132fb9e7d67d	Aritra	royaritra244@gmail.com	$2b$10$27UKUcyOltjCd8UGAcWLN.DdwWdR7L4gpamrW4zDMy38v0/5uQNWW	\N	\N	2026-09-25 09:40:13.892
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."WishlistItem" (id, "userId", "gameId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a930778c-11a7-4533-8777-58e6de355b97	aa21302396cdb8243ad4abdd01cfef01545e1d0f6698c89f0c88bb8d3f89261e	2026-09-25 07:03:10.446747+00	00000000000000_baseline	\N	\N	2026-09-25 07:03:10.367003+00	1
c7880ebd-ffda-42a2-b169-2c2511d1596d	56ff46bde1836031b6abe6bad23ac335000581ef3b334f1988a4b6634f0bf396	2026-09-25 07:03:10.452649+00	20260920103924_add_steam_price	\N	\N	2026-09-25 07:03:10.448269+00	1
916155a2-0590-4a2b-9c7e-759059fb4745	c64bca534c8970975642fe5f0c2055fb70a4497c0f14aaa433f609e4d3948782	2026-09-25 07:03:10.458403+00	20260920105452_add_internal_cost	\N	\N	2026-09-25 07:03:10.453992+00	1
80fe51ed-2215-43fa-b883-f5824f5e8a95	bc6b74317b1f2087394f7159945488883bd795184992c33128d308f39d3e2c41	2026-09-25 07:03:10.466244+00	20260920111608_add_game_slug	\N	\N	2026-09-25 07:03:10.459751+00	1
c8b4b994-0783-49d0-b62a-43eaf05fff58	b62844641f14784521237e19de8d5003ecff34fee780ee54cf5d851732d159e4	2026-09-25 07:22:46.224077+00	20260925072000_add_bundle_fields	\N	\N	2026-09-25 07:22:46.214476+00	1
65992561-39a0-4dba-995d-9b62da4f8187	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2026-09-25 09:09:17.626932+00	20260925090901_add_trusted_device	\N	\N	2026-09-25 09:09:17.622143+00	1
e746e844-9555-40a5-8cfb-f312dec8460b	dff97700f9efcc4b40179608c06c93395e4520662489c41321d6de0f2153cc8b	2026-09-25 09:09:17.643882+00	20260925090916_add_trusted_device	\N	\N	2026-09-25 09:09:17.629247+00	1
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CreatorApplication CreatorApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."CreatorApplication"
    ADD CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY (id);


--
-- Name: GameReaction GameReaction_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."GameReaction"
    ADD CONSTRAINT "GameReaction_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: OtpVerification OtpVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."OtpVerification"
    ADD CONSTRAINT "OtpVerification_pkey" PRIMARY KEY (id);


--
-- Name: ParsedEmail ParsedEmail_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."ParsedEmail"
    ADD CONSTRAINT "ParsedEmail_pkey" PRIMARY KEY (id);


--
-- Name: Poster Poster_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Poster"
    ADD CONSTRAINT "Poster_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: TrustedDevice TrustedDevice_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."TrustedDevice"
    ADD CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CartItem_userId_gameId_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "CartItem_userId_gameId_key" ON public."CartItem" USING btree ("userId", "gameId");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: GameReaction_userId_gameId_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "GameReaction_userId_gameId_key" ON public."GameReaction" USING btree ("userId", "gameId");


--
-- Name: Game_slug_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "Game_slug_key" ON public."Game" USING btree (slug);


--
-- Name: Order_purpose_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "Order_purpose_key" ON public."Order" USING btree (purpose);


--
-- Name: OtpVerification_email_idx; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE INDEX "OtpVerification_email_idx" ON public."OtpVerification" USING btree (email);


--
-- Name: ParsedEmail_messageId_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "ParsedEmail_messageId_key" ON public."ParsedEmail" USING btree ("messageId");


--
-- Name: Transaction_orderId_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "Transaction_orderId_key" ON public."Transaction" USING btree ("orderId");


--
-- Name: Transaction_utr_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "Transaction_utr_key" ON public."Transaction" USING btree (utr);


--
-- Name: TrustedDevice_tokenHash_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "TrustedDevice_tokenHash_key" ON public."TrustedDevice" USING btree ("tokenHash");


--
-- Name: TrustedDevice_userId_idx; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE INDEX "TrustedDevice_userId_idx" ON public."TrustedDevice" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: WishlistItem_userId_gameId_key; Type: INDEX; Schema: public; Owner: valqore_app
--

CREATE UNIQUE INDEX "WishlistItem_userId_gameId_key" ON public."WishlistItem" USING btree ("userId", "gameId");


--
-- Name: CartItem CartItem_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Coupon Coupon_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreatorApplication CreatorApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."CreatorApplication"
    ADD CONSTRAINT "CreatorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameReaction GameReaction_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."GameReaction"
    ADD CONSTRAINT "GameReaction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameReaction GameReaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."GameReaction"
    ADD CONSTRAINT "GameReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TrustedDevice TrustedDevice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."TrustedDevice"
    ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: valqore_app
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Vyljs8eciQjMVsUWjcV2g5IsXCf0PKR95GO7wkhCd0ixsOvlzVCnqcn2vgvGQZS

