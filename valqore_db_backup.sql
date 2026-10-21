--
-- PostgreSQL database dump
--

\restrict pe34IMAiwTA0fuhtul1JYrhTu0VIHvWGGIE71HiDWlfXNQlu6sdqOQNeBPg0Qsf

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
    description text,
    "isPublished" boolean DEFAULT false NOT NULL
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
5c393352-819f-4b4a-a9bc-3b8899f51558	7747ba54-dfcb-4c64-a80e-e8cfee07bbf5	2a0f7b09-f4f3-4c8e-b436-529b32712965	2026-10-12 10:14:31.234
e9c36402-e109-47ff-97b0-d1cd056dd839	968deecd-a8a5-4ded-8b22-ae66e2a64bb7	ef92f72c-4015-4ac5-aa06-d8117860ed5b	2026-10-14 16:39:04.426
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Coupon" (id, code, discount, "createdBy", "usageLimit", "usageCount", "isActive", "creatorId", "commissionRate", "createdAt", "updatedAt") FROM stdin;
bf8d794b-8be0-4fac-8c01-6ecb2b7caaf6	BLACK49	49	Zamir	1	1	t	\N	\N	2026-10-13 09:28:00.851	2026-10-13 09:36:50.565
\.


--
-- Data for Name: CreatorApplication; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."CreatorApplication" (id, "userId", name, "youtubeLink", "instagramLink", "facebookLink", "otherLink", intent, "contactPlatforms", "creatorEmail", status, "agreedToGuidelines", "createdAt", "updatedAt") FROM stdin;
4406a0ce-9ed7-43b2-beb8-f1d97f3894fe	29291cad-111a-4ed6-ab50-56339213891b	flash	https://www.youtube.com/@FLASH_502				Are you interested in receiving games through the VALQORE Creator Program? Tell us how you plan to use the games you claim and create content around them. *	{"Instagram":"@sdassdasda"}	pal1981lakshmi@gmail.com	APPROVED	t	2026-09-26 20:00:00.233	2026-09-26 20:00:09.997
dd7c408a-4d14-4421-a270-d7244cfd34c2	d7ff18c4-b9b7-474f-a0d1-f7717262674a	Yashxverse	https://youtube.com/@yash.xverse?si=uiJFWs9W0ltxiEc1	https://instagram.com/yash.x_verse?exln=MXhoZXNnZTl4YTgzNg%3D%3D			I plan to use the games received through the VALQORE Creator Program to create engaging gaming content on my YouTube channel, yashxverse. I will feature gameplay walkthroughs, live streams, first impressions, exciting moments, and honest reviews to help my audience discover new games. My goal is to build an active gaming community, entertain viewers, and promote the games through creative and authentic content. I would love to collaborate with VALQORE and grow together by consistently creating quality gaming content.	{"Instagram":"yash.x_verse","Discord":"Yashxverse"}	ypal4663@gmail.com	APPROVED	t	2026-10-14 07:30:52.013	2026-10-17 10:51:30.408
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Game" (id, title, developer, rating, genre, price, discount, "coverImage", "releaseDate", platforms, "isRentable", "outOfStock", "isGiveaway", "giveawayRules", "rentPrice", "rentDurationDays", "rentRules", "minRequirements", "recRequirements", "trailerUrl", screenshots, "tagImage", "steamAppId", "creatorAccess", "position", "createdAt", "updatedAt", "steamPrice", "internalCost", slug, "isBundle", "bundleGames", description, "isPublished") FROM stdin;
7f2baea2-6736-4771-a93e-42604b086d8b	Little Nightmares III	Supermassive Games	3.6	Platform, Puzzle, Adventure	249	0	/uploads/optimized/1792003948829-738016432.webp	2025-10-10	Xbox Series X|S, PlayStation 4, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS: Windows 11\nProcessor: Intel Core i5-6500 or AMD Ryzen 3 1200\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 1060 or AMD Radeon RX 580	OS: Windows 11\nProcessor: Intel Core i5-8400 or AMD Ryzen 5 1600\nMemory: 12 GB RAM\nGraphics: Nvidia GeForce RTX 2080, 8 GB or AMD RX 6800	https://www.youtube.com/watch?v=K9OREMjtjrU		/badges/STEAM.png		f	19	2026-10-14 18:52:29.161	2026-10-17 10:47:59.983	\N	100	little-nightmares-iii	f	\N	\N	t
c00cd98b-9113-4a6f-92ac-4e62a38891e7	Wuchang: Fallen Feathers	Leenzee Games	3.8	Role-playing (RPG), Adventure	199	0	/uploads/optimized/1792234486492-947992692.webp	2025-07-24	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows10 64bit\nProcessor: Intel Core i5-8400/AMD Ryzen 5 1600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 6GB/AMD Radeon RX 580 8GB\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: HDD Supported, SSD Recommended. The above specifications were tested with DLSS/FSR enabled.	OS: Windows10/11 64bit\nProcessor: Intel Core i7-9700/AMD Ryzen 5 5500\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2070/AMD Radeon RX 5700 XT/INTEL Arc A750\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: SSD Required. The above specifications were tested with DLSS/FSR enabled.	https://youtu.be/tZ_JjhLdlwk?si=ng6k4ZDdOjVR4Ejo	/uploads/optimized/1792234487065-318909021.webp,/uploads/optimized/1792234488296-478044373.webp,/uploads/optimized/1792234490256-613872246.webp,/uploads/optimized/1792234492331-336332902.webp,/uploads/optimized/1792234492800-667174027.webp,/uploads/optimized/1792234494264-716756618.webp,/uploads/optimized/1792234494651-807919005.webp	/badges/STEAM.png	2277560	t	44	2026-09-25 07:37:25.467	2026-10-17 10:59:35.036	3150	\N	wuchang-fallen-feathers	f	\N	\N	t
e50e4b06-2cc8-4645-84a2-6014f8e76289	The First Berserker: Khazan	Neople	4.1	Role-playing (RPG), Hack and slash/Beat 'em up	249	0	/uploads/optimized/1792004077678-624917830.webp	2025-03-27	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10 64-bit 22H2\nProcessor: Intel Core i3-6300 or AMD Ryzen 3 1200\nMemory: 12 GB RAM\nGraphics: GeForce GTX 970 or Radeon RX 580 or Arc A580\nDirectX: Version 11\nStorage: 70 GB available space	OS: Windows 11 64-bit 21H2\nProcessor: Intel Core i7-6700K or AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: GeForce RTX 2070 or Radeon RX 5700 XT or Arc A750\nStorage: 70 GB available space	https://www.youtube.com/watch?v=oe0ulslMJgE		/badges/STEAM.png		f	20	2026-10-14 18:54:38.034	2026-10-17 10:47:59.983	\N	100	the-first-berserker-khazan	f	\N	\N	t
637c6ece-72ce-4051-8191-a2f481a1dc56	Assassin's Creed 2	Ubisoft Montreal	4.4	Platform, Adventure	0	0	/uploads/optimized/1791994374248-816537052.webp	2009-11-17	PlayStation 3, PC (Microsoft Windows), Mac, Xbox 360	f	f	f		\N	7		OS: Windows XP / Windows Vista\nProcessor: Intel Core 2 Duo 1.8 GHZ or AMD Athlon X2 64 2.4GHZ\nMemory: 1.5 GB Windows XP / 2 GB Windows Vista - Windows 7\nGraphics: 256 MB DirectX 9.0–compliant card with Shader Model 3.0 or higher\nDirectX: DirectX 9.0\nStorage: 8 GB free space	OS: Windows XP / Windows Vista\nProcessor: Intel Core 2 Duo E6700 2.6 GHz or AMD Athlon 64 X2 6000+ or better\nMemory: 1.5 GB Windows XP / 2 GB Windows Vista - Windows 7\nGraphics: GeForce 8800 GT or ATI Radeon HD 4700 or better\nDirectX: DirectX 9.0\nStorage: 8 GB free space	https://www.youtube.com/watch?v=1NX-1ex955U		/badges/STEAM.png		f	67	2026-10-14 16:12:54.795	2026-10-17 10:48:00.027	499	150	assassins-creed-2	f	\N	\N	f
470fa383-9269-4644-965d-f6e8c2f6d538	The Blood of Dawnwalker	Rebel Wolves	4.1	Role-playing (RPG), Adventure	249	0	/uploads/optimized/1792233839268-435987603.webp	2026-09-03	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10, DirectX12\nProcessor: Intel Core i5-11400F / AMD Ryzen 7 2700X\nMemory: 16 GB RAM\nGraphics: NVIDIA GTX 1060 / Radeon RX 580\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: VRAM: 6GB // Storage on SSD	Requires a 64-bit processor and operating system\nOS: Windows 10, DirectX12\nProcessor: Intel Core i7-11700K / AMD Ryzen 7 5700X\nMemory: 16 GB RAM\nGraphics: NVIDIA RTX 4060 / Radeon RX 7600 XT / Intel Arc B580\nDirectX: Version 12\nStorage: 60 GB available space\nAdditional Notes: VRAM: 8GB // Storage on SSD	https://www.youtube.com/watch?v=vSgj1A7uVgw	/uploads/optimized/1792233918871-998425315.webp,/uploads/optimized/1792234060806-272614612.webp,/uploads/optimized/1792234061046-86575857.webp,/uploads/optimized/1792234061498-505901481.webp,/uploads/optimized/1792234061780-255614326.webp,/uploads/optimized/1792234062190-778555874.webp,/uploads/optimized/1792234062502-851180360.webp,/uploads/optimized/1792234062778-233874577.webp,/uploads/optimized/1792234063063-852045443.webp	/badges/STEAM.png		f	2	2026-10-17 10:43:59.672	2026-10-17 10:47:59.97	3999	100	the-blood-of-dawnwalker	f	\N	\N	t
8bb13baa-0a39-4737-9f8c-a8af6701d438	007 First Light	IO Interactive	4.1	Shooter, Adventure	249	0	/uploads/optimized/1792003847240-267019887.webp	2026-05-27	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: MICROSOFT WINDOWS 10/11, 64-BIT\nPROCESSOR: INTEL CORE i5 9500, AMD RYZEN 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GFORCE GTX 1660, AMD RX 5700, INTEL DISCRETE GPU EQUIVALENT\nSTORAGE: 80 GB available space\nADDITIONAL NOTES: SSD required	Requires a 64-bit processor and operating system\nOS: MICROSOFT WINDOWS 10/11, 64-BIT\nPROCESSOR: INTEL CORE i5 13500, AMD RYZEN 5 7600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GEFORCE RTX 3060 TI, AMD RX 6700 XT, INTEL DISCRETE GPU EQUIVALENT\nSTORAGE: 80 GB available space\nADDITIONAL NOTES: SSD required	https://youtu.be/gDvbGANDH4E?si=eKTDMInGTwDdGS17	/uploads/optimized/1792003847419-386801198.webp,/uploads/optimized/1792003847652-728628828.webp,/uploads/optimized/1792003848736-565796344.webp,/uploads/optimized/1792003849076-852555973.webp,/uploads/optimized/1792003849759-551274393.webp,/uploads/optimized/1792003852054-358680976.webp,/uploads/optimized/1792003852407-880841524.webp,/uploads/optimized/1792003852859-774355589.webp,/uploads/optimized/1792003853236-80528045.webp	/badges/STEAM.png	3768760	f	10	2026-09-25 07:37:25.517	2026-10-17 10:47:59.977	4000	\N	007-first-light	f	\N	\N	t
f020d95e-773f-47c7-8208-7040fae415ad	Assassin's Creed® III Remastered	Ubisoft Montreal	3.9	Adventure	0	0	/uploads/optimized/1791994514642-410084971.webp	2012-10-30	PlayStation 3, PC (Microsoft Windows), Wii U, Xbox 360	f	f	f		\N	7		OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i5 2400 @ 3.1 GHz, AMD FX 6350 @ 3.9 GHz\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 660, AMD Radeon R9 270X (2GB VRAM with Shader Model 5.0)\nDirectX: Version 11\nStorage: 45 GB available space	OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i5 3470 @ 3.2 GHz, AMD FX 8350 @ 4.0 GHz\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 770 (4GB) or AMD Radeon R9 280X (3GB) or better\nDirectX: Version 11\nStorage: 45 GB available space	https://www.youtube.com/watch?v=u0TZfC4Vy9o		/badges/STEAM.png		f	66	2026-10-14 16:15:15.214	2026-10-17 10:48:00.026	1999	150	assassins-creed-iii-remastered	f	\N	\N	f
e90570d2-c6cd-46ae-b72d-96dc5a0d81ac	Silent Hill: Townfall	Screen Burn	4.2	Puzzle, Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/coc5sw.jpg	2026-09-24	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 11 x64\nPROCESSOR: AMD Ryzen 5 3600 / Intel i7-8700K\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 2060 Super / AMD Radeon RX 6600\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: Playing on minimum requirements should enable to play on Low settings at 1080p 30fps.	Requires a 64-bit processor and operating system\nOS: Windows 11 x64\nPROCESSOR: AMD Ryzen 7 5700X / Intel i7-9700K\nMEMORY: 32 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3080 / AMD Radeon RX 7800 XT\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: Playing on recommended requirements should enable play on High settings at 4K 30fps (using DLSS,FSR or TSR Balanced mode).	https://youtu.be/RALnTmNg_ss?si=xHBKziO8TClxEQU1		/badges/STEAM.png		f	3	2026-09-25 08:08:39.282	2026-10-17 10:47:59.971	3889	100	silent-hill-townfall	f	\N	\N	t
858c27ab-6cd3-4c80-aa65-c68e30ed2e10	ARK: Survival Ascended	Studio Wildcard	3.6	Shooter, Role-playing (RPG), Simulator, Adventure, Indie	399	0	/uploads/optimized/1792067700690-659117500.webp	2023-10-25	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10/11 with updates\nProcessor: AMD Ryzen 5 2600X, Intel Core i7-6800K\nMemory: 16 GB RAM\nGraphics: AMD Radeon RX 5600 XT, NVIDIA GeForce 1080\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 180 GB available space\nAdditional Notes: SSD Required	OS: Windows 10/11 with updates\nProcessor: AMD Ryzen 5 3600X, Intel i5-10600K\nMemory: 32 GB RAM\nGraphics: AMD Radeon RX 6800, NVIDIA GeForce RTX 3080\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 180 GB available space\nAdditional Notes: SSD Required	https://www.youtube.com/watch?v=0gLODoXanog	/uploads/optimized/1792068438208-973483604.webp,/uploads/optimized/1792068438514-5520716.webp,/uploads/optimized/1792068438878-707636392.webp,/uploads/optimized/1792068439318-214373649.webp,/uploads/optimized/1792068439699-300335742.webp,/uploads/optimized/1792068440112-887834601.webp,/uploads/optimized/1792068440500-830914851.webp,/uploads/optimized/1792068441167-478464759.webp,/uploads/optimized/1792068441552-277888765.webp,/uploads/optimized/1792068441843-713418191.webp,/uploads/optimized/1792068442192-378063866.webp,/uploads/optimized/1792068442526-83891602.webp,/uploads/optimized/1792068442999-91666625.webp	/badges/STEAM.png		f	11	2026-10-15 12:35:01.098	2026-10-17 10:47:59.978	4122	\N	ark-survival-ascended	f	\N	\N	t
08783c4b-34f9-4e29-8467-48e4b2f5594d	Resident Evil 3	Capcom Development Division 1	4	Shooter, Adventure	150	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocw1u.jpg	2020-04-03	Xbox Series X|S, PlayStation 4, Nintendo Switch 2, PC (Microsoft Windows), iOS, PlayStation 5, Mac, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT Required)\nProcessor: Intel® Core™ i5-4460 or AMD FX™-6300 or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 960 or AMD Radeon™ RX 460\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 45 GB available space	Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT) / 11\nProcessor: Intel® Core™ i7-3770 or AMD FX™-9590 or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 1060 or AMD Radeon™ RX 480 with 3GB VRAM\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 45 GB available space	https://www.youtube.com/watch?v=v_ht2suIL10		/badges/STEAM.png		f	27	2026-09-26 05:02:34.329	2026-10-17 10:47:59.988	2497	\N	resident-evil-3	f	\N	\N	t
16dbdeda-c634-4283-853b-9d4a5f94f0eb	Resonance: A Plague Tale Legacy	Asobo Studio	4.2	Adventure	259	0	https://images.igdb.com/igdb/image/upload/t_1080p/coc79u.jpg	2026-08-27	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit\nPROCESSOR: AMD Ryzen 3 3100 / Intel Core i3-12100\nMEMORY: 16 GB RAM\nGRAPHICS: 6 GB VRAM, AMD Radeon RX 5500 XT / Nvidia GeForce GTX 1060\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nADDITIONAL NOTES: SSD Required. CPU with 4 Cores / 8 Threads required. GPU with DX12.1 / Shader Model 6.6 required. 30 FPS in 1920x1080 with "Low" preset.	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit\nPROCESSOR: AMD Ryzen 5 5600X / Intel Core i5-12400F\nMEMORY: 16 GB RAM\nGRAPHICS: 8GB VRAM, AMD Radeon RX 6700 XT / Nvidia GeForce RTX 3060 Ti\nDIRECTX: Version 12\nSTORAGE: 75 GB available space\nADDITIONAL NOTES: SSD Required. CPU with 4 Cores / 8 Threads required. GPU with DX12.1 / Shader Model 6.6 required. 60 FPS in 1920x1080 with the "Ultra" preset.	https://youtu.be/hqmiwl2zkko?si=Qb_sIDPPq9zbcDeK	https://i.ytimg.com/vi/SGo2yz_yW5U/maxresdefault.jpg,https://i.redd.it/3-new-screenshots-for-resonance-have-dropped-v0-5c5c2kfpfq0h1.jpg?width=2048&format=pjpg&auto=webp&s=c253e517e71771b40f15196bc13e61ed3da64c2d,https://cdn.mos.cms.futurecdn.net/K5UcMTZ2NeQBRmwbvgEv2S.jpg,https://static0.polygonimages.com/wordpress/wp-content/uploads/2026/06/resonance_screenshot_preview-2_.png,https://static0.polygonimages.com/wordpress/wp-content/uploads/2026/08/resonance_screenshot_4k_06.png?q=49&fit=crop&w=825&dpr=2,https://cdn.mos.cms.futurecdn.net/BXqBjV9QHCgq5tRsbCF92S.jpg,https://cdn.mos.cms.futurecdn.net/87KXMATnTKEsYgx5r4sqvR.jpg,https://cdn.mos.cms.futurecdn.net/pYFKbfafjG96TU9WRVJi3S.jpg	/badges/STEAM.png	2713000	t	7	2026-09-25 07:37:25.533	2026-10-17 11:22:49.25	2699	100	resonance-a-plague-tale-legacy	f	\N	\N	t
1368fc22-e424-4ffc-8b57-08cf091e69a7	Assassin's Creed Black Flag Resynced	Ubisoft Singapore	4.2	Platform, Hack and slash/Beat 'em up, Adventure	349	0	/uploads/optimized/1792103272731-581199946.webp	2026-07-09	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit only), Windows 11\nPROCESSOR: Intel Core i7-8700K 3.7 GHz, AMD Ryzen 5 3600 3.6 GHz\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 (6GB), AMD Radeon RX5500XT (8GB) or Intel ARC A580 (8GB)\nDIRECTX: Version 12\nSTORAGE: 65 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit only), Windows 11\nPROCESSOR: Intel Core i5-10600K 4.1 GHz, AMD Ryzen 5 3600 3.6 GHz\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060 (12GB),AMD Radeon RX6600XT (8GB), or Intel ARC B580 (12GB)\nDIRECTX: Version 12\nSTORAGE: 65 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	https://youtu.be/WjsTLe7bBUA?si=mb5VORj-nX9kRDd_	/uploads/optimized/1792103231893-921455576.webp,/uploads/optimized/1792103232726-503791665.webp,/uploads/optimized/1792103232838-788039771.webp,/uploads/optimized/1792103233474-407685326.webp,https://gamegpu.com/images/1_2025/NEWS/q4/nov/asus/Resynced_2.jpg,/uploads/optimized/1792103234102-8875284.webp,/uploads/optimized/1792103234716-196029305.webp,/uploads/optimized/1792103237529-675561755.webp,/uploads/optimized/1792103241192-892388120.webp,/uploads/optimized/1792103242178-422009548.webp,/uploads/optimized/1792103242615-61715249.webp,/uploads/optimized/1792103243046-749810770.webp,/uploads/optimized/1792103243587-847620264.webp,/uploads/optimized/1792103247221-172117952.webp	/badges/Ubsoft.png	3751950	f	15	2026-09-25 07:37:25.525	2026-10-17 10:47:59.98	4199	100	assassins-creed-black-flag-resynced	f	\N	\N	t
4252580a-18b2-4be0-a004-5fb5c2e61c91	The Last of Us Part II	Naughty Dog	4.6	Shooter, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/co5ziw.jpg	2020-06-19	PlayStation 4, PlayStation 5, PC	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit (version 1909 or higher)\nPROCESSOR: Intel Core i3-8100, AMD Ryzen 3 1300X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1650, AMD Radeon RX 5500XT\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10/11 64-bit (version 1909 or higher)\nPROCESSOR: Intel Core i5-8600, AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060, AMD Radeon RX 5700\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/btmN-bWwv0A?si=nboiY4khvfdHi4DL	https://images.hdqwalls.com/wallpapers/the-last-of-us-part-2-fanartwork-br.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/04/last-of-us-part-2-remastered-ellie-and-abby.jpg,https://wallpapercave.com/wp/wp9447031.jpg,https://images.wallpapersden.com/image/download/the-last-of-us-part-2-ps5_bGZlbWeUmZqaraWkpJRmbmdlrWZlbWU.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/07/the-last-of-us-part-2-ellie-playing-guitar-1.jpg,https://www.nme.com/wp-content/uploads/2024/01/The-Last-Of-Us-Part-2-Remastered-review-Joel.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/07/the-last-of-us-part-2-ellie-on-a-horse-riding-through-a-destroyed-city.jpg?q=49&fit=contain&w=2200&h=1100&dpr=2,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/04/tlou-2-gameplay.jpg	/badges/STEAM.png	2531310	t	32	2026-09-25 07:37:25.51	2026-10-17 11:21:31.158	2210	80	the-last-of-us-part-ii	f	\N	\N	t
b84b8e8b-8bd6-4ae2-bf29-7ccee9c25272	Forza Horizon 6 [Offline]	Playground Games	4.3	Racing, Simulator, Sport, Arcade	349	0	/uploads/optimized/1792003977705-741854771.webp	2026-05-19	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 22H2 (version 19045) or higher\nPROCESSOR: Intel i5-8400 OR AMD Ryzen 5 1600\nMEMORY: 16 GB RAM\nGRAPHICS: Nvidia GTX 1650 OR AMD RX 6500 XT OR Intel Arc A380\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 167 GB available space\nADDITIONAL NOTES: SSD Required\n	Requires a 64-bit processor and operating system\nOS: Windows 10 22H2 (version 19045) or higher\nPROCESSOR: Intel i5-12400F OR AMD Ryzen 5 5600X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA RTX 3060 Ti OR AMD RX 6700 XT OR Intel Arc A580\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 167 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/oYhaW-Vr4wg?si=co12PB0wfPkehq-u	/uploads/optimized/1792003977921-888018138.webp,/uploads/optimized/1792003978283-338870291.webp,/uploads/optimized/1792003978594-541253358.webp,/uploads/optimized/1792003979360-882415204.webp,/uploads/optimized/1792003979520-575590249.webp,/uploads/optimized/1792003979597-122182897.webp	/badges/STEAM.png	2483190	f	6	2026-09-25 07:37:25.543	2026-10-17 10:47:59.974	5499	100	forza-horizon-6	f	\N	\N	t
2ecc8b1c-3f6a-4c7e-b3b7-d711ff4e74a5	Days Gone	Bend Studio	3.9	Shooter, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/co94bn.jpg	2019-04-26	PlayStation 4, PC (Microsoft Windows), PlayStation 5	f	f	f		\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bits\nProcessor: Intel Core i5-2500K@3.3GHz or AMD FX 6300@3.5GHz\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 780 (3 GB) or AMD Radeon R9 290 (4 GB)\nDirectX: Version 11\nStorage: 70 GB available space\nAdditional Notes: Though not required, SSD for storage and 16 GB of memory is recommended	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bits\nProcessor: Intel Core i7-4770K@3.5GHz or Ryzen 5 1500X@3.5GHz\nMemory: 16 GB RAM\nGraphics: Nvidia GeForce GTX 1060 (6 GB) or AMD Radeon RX 580 (8 GB)\nDirectX: Version 11\nStorage: 70 GB available space\nAdditional Notes: Though not required, SSD for storage is recommended	https://www.youtube.com/watch?v=EVGfJkGpyok	https://4kwallpapers.com/images/wallpapers/days-gone-black-2880x1800-14438.png,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwEFx5LKMrcNaVRYVeGaghAOCSEBYPE59Tx2JDJ60QNnBLSz09sL0WVwjh&s=10,https://4kwallpapers.com/images/wallpapers/days-gone-deacon-st-4480x2520-9809.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGCDGkd0TdsF3ukjkRg2P-BRuqwEodPtC3V8rRLHTaArNrOnCCnymxqaFQ&s=10,https://interfaceingame.com/wp-content/uploads/days-gone/DaysGone_48.png,https://images.steamusercontent.com/ugc/2441592570356889564/B45602EA0E88102B1E8A23CF42D28CBA99316F7E/,https://i.ytimg.com/vi/PskFXgT709A/maxresdefault.jpg,https://static0.thegamerimages.com/wordpress/wp-content/uploads/2023/10/14-days-gone-all-horde-locations.jpg?w=1600&h=900&fit=crop	/badges/STEAM.png		f	30	2026-10-10 16:31:19.143	2026-10-17 10:47:59.989	2499	100	days-gone	f	\N	\N	t
a8706fd5-1442-4b32-b4de-4c72fbe1dcce	Assassin's Creed Shadows	Ubisoft Québec	4	Role-playing (RPG), Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/co87cu.jpg	2025-03-20	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: INTEL® Core TM i7 8700K AMD RYZEN 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA® GEFORCE GTX 1650 4GB / AMD RX-5500 XT 8GB / INTEL® ARC TM A380 6GB (REBAR ON)"\nDIRECTX: Version 12\nSTORAGE: 115 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: Intel® Core™ i5 11600k/AMD Ryzen™ 5 5600x\nMEMORY: 16 GB RAM\nGRAPHICS: Nvidia® GeForce RTX™ 3060Ti 8GB/AMD Radeon™ RX 6700 XT 12GB/Intel® Arc™ B580 12GB (REBAR ON)\nDIRECTX: Version 12\nSTORAGE: 115 GB available space\nADDITIONAL NOTES: The game must be installed on a SSD.	https://youtu.be/vovkzbtYBC8?si=puQdcGajNkBxP5xU	https://game.intel.com/wp-content/uploads/2025/03/ac-shadows-newsletter01-1920x1080-1.jpg,https://i.redd.it/tzorvqk6dc0f1.png,https://sm.ign.com/ign_in/gallery/a/assassins-/assassins-creed-shadows-exclusive-concept-art_v9sw.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpJT6MHBvNInRUtnKHY07wrOuUe3xot8A4AyucRHTvvJgcm-v14IjcX48x&s=10,https://cdn2.unrealengine.com/header-1-3805x2160-66c78bcda1a7.jpg,https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/06/assassin-s-creed-shadows-ui.jpg?q=49&fit=contain&w=1920&h=1080&dpr=2	/badges/Ubsoft.png	3159330	f	16	2026-09-25 07:37:25.522	2026-10-17 10:47:59.981	4899	100	assassins-creed-shadows	f	\N	\N	t
6f3df360-a499-4ed5-a649-62f1bfb65035	Assassin's Creed® Syndicate	Ubisoft Québec	3.7	Adventure	0	0	/uploads/optimized/1791994955076-245807609.webp	2015-10-23	Google Stadia, Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f		\N	7		OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i5 2400s @ 2.5 GHz / AMD FX 6350 @ 3.9 GHz\nMemory: 6 GB RAM\nGraphics: NVIDIA GeForce GTX 660 / AMD Radeon R9 270 (2GB VRAM with Shader Model 5.0)\nStorage: 50 GB available space	OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i7 3770 @ 3.5 GHz / AMD FX 8350 @ 4.0 GHz\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 760 or AMD Radeon R9 280X (3GB VRAM with Shader Model 5.0)\nStorage: 50 GB available space	https://www.youtube.com/watch?v=Sm07yJIHp_o		/badges/STEAM.png		f	62	2026-10-14 16:22:35.748	2026-10-17 10:48:00.021	1999	150	assassins-creed-syndicate	f	\N	\N	f
dec57dee-bf9e-4b4d-aa64-b967a9682b90	Outlast	Red Barrels	3.9	Adventure, Indie	199	0	/uploads/optimized/1791665961262-476767295.webp	2013-09-04	PlayStation 4, Linux, PC (Microsoft Windows), Mac, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS *: Windows XP / Vista / 7 / 8 - 64 bits *\nPROCESSOR: 2.2 GHz Dual Core CPU\nMEMORY: 2 GB RAM\nGRAPHICS: 512 MB NVIDIA GeForce 9800GTX / ATI Radeon HD 3xxx series\nDIRECTX: Version 9.0c\nNETWORK: Broadband Internet connection\nSTORAGE: 5 GB available space\nSOUND CARD: DirectX Compatible	OS *: Windows Vista / 7 / 8 - 64 bits\nPROCESSOR: 2.8 GHz Quad Core CPU\nMEMORY: 3 GB RAM\nGRAPHICS: 1GB NVIDIA GTX 460 / ATI Radeon HD 6850 or better\nDIRECTX: Version 9.0c\nNETWORK: Broadband Internet connection\nSTORAGE: 5 GB available space\nSOUND CARD: DirectX Compatible\n	https://www.youtube.com/watch?v=uKA-IA4locM		/badges/STEAM.png		t	49	2026-10-10 20:59:21.583	2026-10-17 11:24:36.245	650	150	outlast	f	\N	\N	t
60182403-3727-4629-95cc-36ce9478329e	Resident Evil Requiem	Capcom Development Division 1	4.5	Shooter, Puzzle, Adventure	299	0	/uploads/optimized/1792003832977-920759843.webp	2026-02-27	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 11 (64bit required)\nProcessor: Intel corei5-8500 / AMD Ryzen 5 3500\nMemory: 16 GB RAM\nGraphics: GeForce GTX 1660 6GB /  Radeon RX 5500 XT 8GB\nDirectX: Version 12	Requires a 64-bit processor and operating system\nOS: Windows 11 (64bit required)\nProcessor: Intel Core i7-8700 / AMD Ryzen 5 5500\nMemory: 16 GB RAM\nGraphics: GeForce RTX 2060 Super 8GB / Radeon RX 6600 8GB\nDirectX: Version 12	https://www.youtube.com/watch?v=YoFXs6Ifna8		/badges/STEAM.png		f	9	2026-09-26 05:07:33.467	2026-10-17 10:47:59.977	4399	150	resident-evil-requiem	f	\N	\N	t
90db065a-e86c-43fd-bac5-fb83dff90a0f	Assassin's Creed® Revelations	Ubisoft Montreal	4	Adventure	0	0	/uploads/optimized/1791994744536-532725887.webp	2011-11-14	PlayStation 3, PC (Microsoft Windows), Xbox 360	f	f	f		\N	7		OS: Windows XP SP3 / Windows Vista SP2 / Windows 7 SP1\nProcessor: Intel Core 2 Duo E4300 @ 1.8 GHz or AMD Athlon BA X2 4600+ @ 2.4 GHz\nMemory: 1.5 GB Windows XP / 2 GB Windows Vista, 7\nGraphics: 256 MB DirectX 9.0–compliant card with Shader Model 4.0 or higher\nDirectX: DirectX 9.0\nStorage: 12 GB available space	OS: Windows XP SP3 / Windows Vista SP2 / Windows 7 SP1\nProcessor: Intel Core 2 Duo E6700 @ 2.6 GHz or AMD Athlon 64 X2 6000+ @ 3.0 GHz or better\nMemory: 2 GB Windows XP / Windows Vista / Windows 7\nGraphics: 512 MB DirectX 9.0–compliant card with Shader Model 5.0 or higher\nDirectX: DirectX 9.0\nStorage: 12 GB available space	https://www.youtube.com/watch?v=8upeFB_SArY		/badges/STEAM.png		f	64	2026-10-14 16:19:04.909	2026-10-17 10:48:00.024	749	150	assassins-creed-revelations	f	\N	\N	f
a17a7aff-0560-4d4d-9efc-adb4df33d96f	Assassin's Creed® Brotherhood	Ubisoft Montreal	4.2	Puzzle, Adventure	0	0	/uploads/optimized/1791994639823-410901406.webp	2010-11-16	PlayStation 3, PC (Microsoft Windows), Mac, Xbox 360	f	f	f	\N	\N	7		OS: Windows XP / Windows Vista\nProcessor: Intel Core 2 Duo 1.8 GHZ or AMD Athlon X2 64 2.4GHZ\nMemory: 1.5 GB Windows XP / 2 GB Windows Vista - Windows 7\nGraphics: 256 MB DirectX 9.0–compliant card with Shader Model 3.0 or higher\nDirectX: DirectX 9.0\nStorage: 8 GB free space	OS: Windows XP / Windows Vista\nProcessor: Intel Core 2 Duo E6700 2.6 GHz or AMD Athlon 64 X2 6000+ or better\nMemory: 1.5 GB Windows XP / 2 GB Windows Vista - Windows 7\nGraphics: GeForce 8800 GT or ATI Radeon HD 4700 or better\nDirectX: DirectX 9.0\nStorage: 8 GB free space	https://www.youtube.com/watch?v=KAb0YtprjQQ		/badges/STEAM.png		f	65	2026-10-14 16:17:20.156	2026-10-17 10:48:00.025	749	150	assassins-creed-brotherhood	f	\N	\N	f
9c1aabb7-f361-4c13-8572-82a346226716	God of War	Santa Monica Studio	4.7	Role-playing (RPG),Adventure	199	0	/uploads/optimized/1792234397359-509162557.webp	2018-04-20	PlayStation 4, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10\nProcessor: Intel i5-2500k (4 core 3.3 GHz) or AMD Ryzen 3 1200 (4 core 3.1 GHz)\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 960 (4 GB) or AMD R9 290X (4 GB)\nDirectX: Version 11\nStorage: 70 GB available space\nAdditional Notes: DirectX feature level 11_1 required	Requires a 64-bit processor and operating system\nOS: Windows 10\nProcessor: Intel i5-6600k (4 core 3.5 GHz) or AMD Ryzen 5 2400 G (4 core 3.6 GHz)\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 1060 (6 GB) or AMD RX 570 (4 GB)\nDirectX: Version 11\nStorage: 70 GB available space\nAdditional Notes: DirectX feature level 11_1 required	https://www.youtube.com/watch?v=K0u_kAWLJOA	/uploads/optimized/1792234397575-652967390.webp,https://4kwallpapers.com/images/wallpapers/god-of-war-video-game-3840x2160-13010.jpg,https://c4.wallpaperflare.com/wallpaper/405/503/621/games-art-video-games-god-of-war-2018-wallpaper-preview.jpg,/uploads/optimized/1792234398563-689258645.webp,/uploads/optimized/1792234398958-747903902.webp,/uploads/optimized/1792234400522-36498730.webp	/badges/STEAM.png		t	33	2026-10-03 19:21:52.312	2026-10-17 11:00:01.425	3299	\N	god-of-war	f	\N	\N	t
698a834b-1e92-4863-bada-b9ffb3b5a2df	Mafia: The Old Country	Hangar 13	3.9	Shooter, Adventure	0	0	/uploads/optimized/1792003816223-571917012.webp	2025-08-07	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f		\N	7		OS: Windows 10 / 11\nProcessor: AMD Ryzen 7 2700X / Intel Core i7-9700K\nMemory: 16 GB RAM\nGraphics: AMD Radeon RX 5700 XT / NVIDIA RTX 2070\nDirectX: Version 12\nStorage: 55 GB available space	OS: Windows 10 / 11\nProcessor: AMD Ryzen 7 5800X / Intel Core i7-12700K\nMemory: 32 GB RAM\nGraphics: AMD Radeon RX 6950 XT / NVIDIA RTX 3080 Ti\nDirectX: Version 12\nStorage: 55 GB available space	https://www.youtube.com/watch?v=EAEYZDgHNv8		/badges/STEAM.png		f	0	2026-10-14 18:50:16.562	2026-10-17 10:47:59.967	\N	250	mafia-the-old-country	f	\N	\N	f
20247d85-8958-4aa1-9c65-de514c75d584	Subnautica 2 [Offline]	Unknown Worlds Entertainment	4.5	Adventure	199	0	/uploads/optimized/1792004076434-25294153.webp	2026-05-14	Xbox Series X|S, PC (Microsoft Windows)	f	f	f	\N	\N	7		OS: Windows 10/11\nProcessor: Intel Core i5-8400 / AMD Ryzen 5 2600\nMemory: 12 GB RAM\nGraphics: GeForce GTX 1660 6GB / RX 5500 XT 6GB\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 50 GB available space\nAdditional Notes: Requires a 64-bit processor and operating system	OS: Windows 11\nProcessor: Intel Core i7-13700 / AMD Ryzen 7 7700X\nMemory: 16 GB RAM\nGraphics: Geforce RTX 3070 8GB / RX 6700 XT 8GB\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 50 GB available space\nAdditional Notes: Requires a 64-bit processor and operating system	https://www.youtube.com/watch?v=WS0vTRl_2PQ		/badges/STEAM.png		f	52	2026-09-25 07:37:25.555	2026-10-17 10:48:00.009	1800	80	subnautica-2	f	\N	\N	t
2dac3338-746c-4a14-b0aa-acbc1d802b56	The Last of Us™ Part I	Naughty Dog	4.3	Shooter, Adventure	199	0	/uploads/optimized/1791666596818-848221964.webp	2022-09-02	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 (Version 1909 or Newer)\nProcessor: AMD Ryzen 5 1500X, Intel Core i7-4770K\nMemory: 16 GB RAM\nGraphics: AMD Radeon RX 470 (4 GB), AMD Radeon RX 6500 XT (4 GB), NVIDIA GeForce GTX 970 (4 GB), NVIDIA GeForce GTX 1050 Ti (4 GB)\nStorage: 100 GB available space\nAdditional Notes: SSD Recommended	Requires a 64-bit processor and operating system\nOS: Windows 10 (Version 1909 or Newer)\nProcessor: AMD Ryzen 5 3600X, Intel Core i7-8700\nMemory: 16 GB RAM\nGraphics: AMD Radeon RX 5700 XT (8 GB), AMD Radeon RX 6600 XT (8 GB), NVIDIA GeForce RTX 2070 SUPER (8 GB), NVIDIA GeForce RTX 3060 (8 GB)\nStorage: 100 GB available space\nAdditional Notes: SSD Recommended\n	https://www.youtube.com/watch?v=CxVyuE2Nn_w		/badges/STEAM.png		f	31	2026-09-26 05:39:51.724	2026-10-17 11:21:26.216	3999	80	the-last-of-us-part-i	f	\N	\N	t
dc152f73-7d86-4376-a223-51765f5af4aa	FC 27 [Offline]	EA Vancouver	0	Simulator, Sport	499	0	/uploads/optimized/1792003991386-734626759.webp	2026-09-25	Xbox Series X|S, PlayStation 4, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS: Windows 10/11 - 64-Bit (Latest Update).\nPROCESSOR: AMD Ryzen 5 1600 or Intel Core i5 6600k\nMEMORY: DDR4 Dual Channel 8 GB RAM\nGRAPHICS: AMD RX 570 or Nvidia GTX 1050 Ti\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 100 GB available space\nADDITIONAL NOTES: Estimated performance when set to ""Low"" preset: 1280x720 @ 60 FPS SSD Recommended	OS: Windows 10/11 - 64-Bit (Latest Update).\nPROCESSOR: AMD Ryzen 7 2700X or Intel Core i7 6700\nMEMORY: Dual Channel 12 GB RAM\nGRAPHICS: AMD RX 5600 XT or Nvidia GTX 1660\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 100 GB available space\nADDITIONAL NOTES: Estimated performance when set to ""Medium"" preset: 1920x1080 @ 60 FPS SSD Required	https://youtu.be/MOclJJ7IpSY?si=8rQGugxn0Y9SGLVP		/badges/STEAM.png		f	5	2026-09-26 07:42:01.204	2026-10-17 10:47:59.973	3999	299	fc-27	f	\N	\N	t
7d656f20-8ff8-4265-bd17-2dfd16982dec	Assassin's Creed Mirage	Ubisoft Bordeaux	0	Role-playing (RPG), Adventure	0	0	/uploads/optimized/1791995798165-642040548.webp	2023-10-05	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f		\N	7		OS: Windows 10/11\nProcessor: INTEL® Core™ i7-4790K (INTEL® Core™ i5-8400 for Intel® ARC™ with Rebar) / Ryzen™ 5 1600\nMemory: 8 GB RAM\nGraphics: Intel® Arc™ A380 (6 GB) / NVIDIA® GeForce® GTX 1060 (6 GB) / AMD Radeon™ RX 570 (4 GB)\nDirectX: Version 12\nStorage: 40 GB available space	OS: Windows 10/11\nProcessor: Intel® Core™ i7-8700K / AMD Ryzen™ 5 3600\nMemory: 16 GB RAM\nGraphics: Intel® Arc™ A750 (8 GB) / NVIDIA® GeForce® GTX 1660 Ti (6 GB) / AMD Radeon™ RX 5600 XT (6 GB)\nDirectX: Version 12\nStorage: 40 GB available space	https://www.youtube.com/watch?v=ngMR90g2E1E		/badges/STEAM.png		f	60	2026-10-14 16:36:38.525	2026-10-17 10:48:00.017	2499	200	assassins-creed-mirage	f	\N	\N	f
b64d947e-ad0f-4b25-8c1c-1a3082266c69	Resident Evil 4	Capcom	0	Shooter, Adventure	199	0	https://i.etsystatic.com/6824854/r/il/e0f2b4/5931341667/il_fullxfull.5931341667_k7p5.jpg	2009-09-17	PlayStation 3, PlayStation 2	f	f	f	\N	\N	7						/badges/STEAM.png		f	26	2026-09-26 05:03:50.096	2026-10-17 10:47:59.987	2479	\N	resident-evil-4	f	\N	\N	t
ad539735-2b21-4ff4-aafe-48ef9667c831	ARK: The Survival Of The Fittest	Studio Wildcard	0.7	Shooter, Role-playing (RPG), Strategy, Adventure, Indie	199	0	/uploads/optimized/1791667431888-88172420.webp	2016-03-15	PlayStation 4, Linux, PC (Microsoft Windows), Mac	f	f	f		\N	7		OS *: 64-Bit Windows 7 Service Pack 1, or Windows 8/10\nPROCESSOR: 2 GHz Dual-Core 64-bit CPU\nMEMORY: 4000 MB RAM\nGRAPHICS: GTX 500 or Above DirectX10 Compatible GPU with 2 GB or More Video RAM\nDIRECTX: Version 10\nSTORAGE: 37000 MB available space	OS *: 64-Bit Windows 7 Service Pack 1, or Windows 8/10\nPROCESSOR: 2 GHz Dual-Core 64-bit CPU\nMEMORY: 4000 MB RAM\nGRAPHICS: GTX 500 or Above DirectX10 Compatible GPU with 2 GB or More Video RAM\nDIRECTX: Version 10\nSTORAGE: 37000 MB available space	https://www.youtube.com/watch?v=vUOyGD7VbH4		/badges/STEAM.png		f	57	2026-10-10 21:23:52.284	2026-10-17 10:48:00.012	690	\N	ark-the-survival-of-the-fittest	f	\N	\N	t
bbf49a2d-acc4-4c17-bc8b-751bffc4dc92	Assassin's Creed® Unity	Ubisoft Montreal	3.6	Role-playing (RPG), Adventure	0	0	/uploads/optimized/1791995093847-100835373.webp	2014-11-11	Google Stadia, Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f		\N	7		OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i5-2500K @ 3.3 GHz or AMD FX-8350 @ 4.0 GHz\nMemory: 6 GB RAM\nGraphics: NVIDIA GeForce GTX 680 or AMD Radeon HD 7970 (2 GB VRAM)\nStorage: 50 GB available space	OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i7-3770 @ 3.4 GHz or AMD FX-8350 @ 4.0 GHz or better\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 780 or AMD Radeon R9 290X (3 GB VRAM)\nStorage: 50 GB available space	https://www.youtube.com/watch?v=wAiO8oZkaOU		/badges/STEAM.png		f	61	2026-10-14 16:24:54.393	2026-10-17 10:48:00.018	1499	150	assassins-creed-unity	f	\N	\N	f
595ec3f7-c916-4f8b-af8a-0cbc27510db9	REANIMAL	Tarsier Studios	4	Puzzle, Adventure	0	0	/uploads/optimized/1791993877378-278189749.webp	2026-02-13	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system.\nOS: Windows 10/11.\nProcessor: Ryzen 5 2400G / Core i5-9400F.\nMemory: 8 GB RAM.\nGraphics: GeForce GTX 1060 / Radeon RX 480.\nDirectX: Version 12.\nNetwork: Broadband Internet connection.\nStorage: 18 GB available space.	OS *: Windows 7 64-bit | Windows 8 64-bit | Windows 10 64-bit\nProcessor: Intel Core i5-2500K | AMD Ryzen 5 1400\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 970 | AMD Radeon RX 570\nDirectX: Version 11\nNetwork: Broadband Internet connection\nStorage: 25 GB available space\nSound Card: DirectX 11 Compatible	https://www.youtube.com/watch?v=V6NhwZpqo3Q		/badges/STEAM.png		t	59	2026-10-14 16:04:38.065	2026-10-17 11:22:30.072	1600	\N	reanimal	f	\N	\N	f
a6a9f8d0-8edc-4ed1-84d8-a62ecea40af8	Resident Evil 7 Biohazard	Capcom Development Division 1	4.2	Shooter, Puzzle, Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobtwh.jpg	2017-01-24	Google Stadia, Xbox Series X|S, PlayStation 4, Nintendo Switch 2, PlayStation VR, PC (Microsoft Windows), iOS, PlayStation 5, Mac, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT Required)\nProcessor: Intel® Core™ i5-4460, 2.70GHz or AMD FX™-6300 or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 960 or AMD Radeon™ RX 460\nDirectX: Version 12\nStorage: 24 GB available space	Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT Required) / Windows 11 (64-BIT Required)\nProcessor: Intel® Core™ i7 3770 3.4GHz or AMD equivalent or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 1060 with 3GB VRAM\nDirectX: Version 12\nStorage: 24 GB available space	https://www.youtube.com/watch?v=RgYqQsbKn6w		/badges/STEAM.png		f	25	2026-09-26 05:06:11.896	2026-10-17 10:47:59.987	1099	80	resident-evil-7-biohazard	f	\N	\N	t
40484ae3-a0fb-414a-8519-11b866777561	Assassin's Creed Valhalla	Ubisoft Montreal	4	Role-playing (RPG), Adventure	0	0	/uploads/optimized/1791996132368-103309303.webp	2020-11-10	Google Stadia, Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f		\N	7		OS: Windows 10 (versions 64 bits uniquement)\nProcessor: AMD Ryzen 3 1200 3.1 GHz / Intel Core i5-4460 3.2 GHz\nMemory: 8 GB RAM\nGraphics: AMD R9 380 /NVIDIA GeForce GTX 960\nDirectX: Version 12\nStorage: 160 GB available space	OS: Windows 10 (versions 64 bits uniquement)\nProcessor: AMD Ryzen 5 1600 3.2 GHz / Intel Core i7-4790 3.6 GHz\nMemory: 8 GB RAM\nGraphics: AMD R9 380 /NVIDIA GeForce GTX 960\nDirectX: Version 12\nStorage: 160 GB available space	https://www.youtube.com/watch?v=gncCKXqjtaE		/badges/STEAM.png		f	68	2026-10-14 16:42:12.726	2026-10-17 10:48:00.029	2999	200	assassins-creed-valhalla	f	\N	\N	f
a2b1c907-37a8-48dc-9ada-0909e8c2fb69	Car Mechanic Simulator 2018	 Red Dot Games	0	Simulator, Adventure, Racing	59	0	https://upload.wikimedia.org/wikipedia/en/1/1e/Car_Mechanic_Simulator_2018_Box_Art_Logo.webp?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original	2017-07-28	PC	f	t	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS *: Windows(64-bit) 7 or Newer\nProcessor: Intel Core i3 3.0 GHz\nMemory: 4 GB RAM\nGraphics: NVidia GeForce GTX 660 2GB\nDirectX: Version 11\nStorage: 20 GB available space	Requires a 64-bit processor and operating system\nOS *: Windows(64-bit) 7 or Newer\nProcessor: Intel Core i5 3.4 GHz\nMemory: 8 GB RAM\nGraphics: NVidia GeForce GTX 970 4GB\nDirectX: Version 11\nStorage: 20 GB available space	https://www.youtube.com/watch?v=LCTF8wKWFSU		/badges/STEAM.png		f	73	2026-09-26 05:47:42.872	2026-10-17 10:48:00.036	1408	\N	car-mechanic-simulator-2018	f	\N	\N	t
6898b5a3-3ef1-49c5-81e9-06e0a27a6137	Forza Horizon 4 [Offline]	Playground Games	4.1	Racing	179	0	/uploads/optimized/1792004045215-852228683.webp	2018-09-28	Xbox Series X|S, PC (Microsoft Windows), Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 version 15063.0 or higher\nProcessor: Intel i3-4170 @ 3.7Ghz OR Intel i5 750 @ 2.67Ghz\nMemory: 8 GB RAM\nGraphics: NVidia 650TI OR AMD R7 250x\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 80 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 version 15063.0 or higher\nProcessor: Intel i7-3820 @ 3.6Ghz\nMemory: 12 GB RAM\nGraphics: NVidia GTX 970 OR NVidia GTX 1060 3GB OR AMD R9 290x OR AMD RX 470\nDirectX: Version 12\nNetwork: Broadband Internet connection\nStorage: 100 GB available space	https://www.youtube.com/watch?v=ipbxICJ3RT4				t	51	2026-09-26 05:41:50.644	2026-10-17 11:24:09.832	\N	\N	forza-horizon-4	f	\N	\N	t
5bb71fad-02dd-4dd3-804e-adb5a83f1c80	Assassin's Creed Odyssey	Ubisoft Entertainment	0	Role-playing (RPG), Adventure	0	0	/uploads/optimized/1791995965434-378795736.webp	2020-11-12	Xbox Series X|S, Xbox One	f	f	f		\N	7		OS: Windows 10 (64bit versions only)\nProcessor: AMD FX 6300 @ 3.8 GHz, Ryzen 3 - 1200, Intel Core i5 2400 @ 3.1 GHz\nMemory: 8 GB RAM\nGraphics: AMD Radeon R9 285, NVIDIA GeForce GTX 660 (2GB VRAM with Shader Model 5.0)\nDirectX: Version 11\nStorage: 46+ GB available space	OS: Windows 10 (64bit versions only)\nProcessor: AMD FX-8350 @ 4.0 GHz, Ryzen 5 - 1400, Intel Core i7-3770 @ 3.5 GHz or better\nMemory: 8 GB RAM\nGraphics: AMD Radeon R9 290, NVIDIA GeForce GTX 970 (4GB VRAM with Shader Model 5.0) or better\nStorage: 46+ GB available space	https://www.youtube.com/watch?v=eDL5LyD8bJg		/badges/STEAM.png		f	69	2026-10-14 16:39:25.94	2026-10-17 10:48:00.03	2999	200	assassins-creed-odyssey	f	\N	\N	f
9b8ee09f-6159-4a0f-b566-af825ab16d2f	Assassin's Creed® Valhalla - Complete Edition	Ubisoft Montreal	4	Role-playing (RPG), Adventure	55645	0	/uploads/optimized/1791996288960-106269778.webp	2020-11-10	Google Stadia, Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7						/badges/STEAM.png		f	70	2026-10-14 16:44:49.314	2026-10-17 10:48:00.031	6999	250	assassins-creed-valhalla---complete-edition	f	\N	\N	f
ffd0e6a3-0c60-4030-adca-c4c52f974760	Black Myth: Wukong	Game Science	4.4	Role-playing (RPG), Hack and slash/Beat 'em up, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/co8h3y.jpg	2024-08-20	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nProcessor: Intel Core i5-8400 / AMD Ryzen 5 1600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB\nDirectX: Version 11\nStorage: 130 GB available space\nSound Card: Windows Compatible Audio Device\nAdditional Notes: HDD Supported, SSD Recommended. The above specifications were tested with DLSS/FSR/XeSS enabled.	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nProcessor: Intel Core i7-9700 / AMD Ryzen 5 5500\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700 XT / INTEL Arc A750\nDirectX: Version 12\nStorage: 130 GB available space\nSound Card: Windows Compatible Audio Device\nAdditional Notes: SSD Required. The above specifications were tested with DLSS/FSR/XeSS enabled.	https://www.youtube.com/watch?v=_mAnlVXtDD8		/badges/STEAM.png		f	14	2026-09-26 03:53:21.1	2026-10-17 10:47:59.979	3599	100	black-myth-wukong	f	\N	\N	t
ef92f72c-4015-4ac5-aa06-d8117860ed5b	God Of War Ragnarok	Animoca XL	0	Role-playing (RPG)	199	0	/uploads/optimized/1792234405647-456457051.webp	2013-09-12	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 20H1\nPROCESSOR: Intel i5-4670k or AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 1060 (6GB) or AMD RX 5500 XT (8GB) or Intel Arc A750\nDIRECTX: Version 12\nSTORAGE: 190 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 20H1\nPROCESSOR: Intel i5-8600 or AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA RTX 2060 Super or AMD RX 5700 or Intel Arc A770\nDIRECTX: Version 12\nSTORAGE: 190 GB available space	https://youtu.be/hfJ4Km46A-0?si=12zxoreiUM5XlezS	https://images.wallpapersden.com/image/download/god-of-war-ragnaroek-4k-gaming-poster_bWtpbG2UmZqaraWkpJRobWllrWdma2U.jpg,/uploads/optimized/1792234406054-380243334.webp,/uploads/optimized/1792234406230-294181868.webp,/uploads/optimized/1792234408776-560239273.webp,/uploads/optimized/1792234409267-526445897.webp,/uploads/optimized/1792234412527-188103703.webp,/uploads/optimized/1792234415059-401960225.webp,https://images.wallpapersden.com/image/download/god-of-war-ragnarok-sled-clash-gaming_bWtrbW6UmZqaraWkpJRobWllrWdma2U.jpg,https://images.wallpapersden.com/image/download/god-of-war-ragnarok-2021-hd-gaming_bG5oZW6UmZqaraWkpJRobWllrWdma2U.jpg	/badges/STEAM.png	2322010	t	34	2026-09-25 07:37:25.499	2026-10-17 10:53:35.652	3999	\N	god-of-war-ragnarok	f	\N	\N	t
983570ab-e3ad-4669-8631-31b0a67a5775	Mortal Shell	Cold Symmetry	4.6	Role-playing (RPG), Adventure	199	0	https://cdn.genbadigital.io/common/31a7fc8e-218a-4298-85ba-1e0d3dc557f5/c5152975-2139-449d-bbf1-6033bcc34542/library_600x900_2x.jpg	2026-08-20	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS *: Windows 7 SP1 or newer\nProcessor: Intel Core i5-4590 or AMD FX 8350\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 970 or AMD Radeon R9 290\nStorage: 12 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10\nProcessor: Intel Core i7 or AMD Ryzen 7\nMemory: 16 GB RAM\nGraphics: NVIDIA GTX 1070 or AMD Radeon RX Vega 56\nStorage: 12 GB available space	https://www.youtube.com/watch?v=r16Dc_jMWzA	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1110910/ab4faca6c2f6729294939d5a542b549c580ee573/capsule_616x353.jpg?t=1785160664,https://i0.wp.com/www.thexboxhub.com/wp-content/uploads/2020/08/mortal-shell-review-xbox-1.jpeg?fit=1399%2C787&ssl=1,https://d.player.one/en/full/199362/mortal-shell.jpg	/badges/STEAM.png		f	13	2026-10-10 16:12:22.02	2026-10-17 10:47:59.979	800	100	mortal-shell	f	\N	\N	t
f5038fd3-e7fa-44ea-8c90-7890d9fc2ab8	Marvel's Spider-Man 2	Insomniac Games	4.2	Hack and slash/Beat 'em up, Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobg1k.jpg	2023-10-20	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11 (version 1909 or higher)\nProcessor: Intel Core i3-8100 or AMD Ryzen 3 3100\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 1650 or AMD Radeon RX 5500 XT\nStorage: 140 GB available space\nAdditional Notes: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10/11 (version 1909 or higher)\nProcessor: Intel Core i5-8400 or AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 3060 or AMD Radeon RX 5700\nStorage: 140 GB available space\nAdditional Notes: SSD Required	https://www.youtube.com/watch?v=eNk-A5yt058		/badges/STEAM.png		f	35	2026-09-26 05:33:44.544	2026-10-17 10:47:59.993	3999	80	marvels-spider-man-2	f	\N	\N	t
8e5b6e75-e584-4401-8e33-eff43525783a	Marvel’s Spider-Man Remastered	Insomniac Games	4.1	Hack and slash/Beat 'em up, Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobg1l.jpg	2020-11-12	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nProcessor: Intel Core i3-4160, 3.6 GHz or AMD equivalent\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 950 or AMD Radeon RX 470\nDirectX: Version 12\nStorage: 75 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nProcessor: Intel Core i5-4670, 3.4 Ghz or AMD Ryzen5 1600, 3.2 Ghz\nMemory: 16 GB RAM\nGraphics: NVIDIA GTX 1060 6GB or AMD Radeon RX 580 8GB\nDirectX: Version 12\nStorage: 75 GB available space	https://www.youtube.com/watch?v=mrT5q5xXb7Y		/badges/STEAM.png		t	36	2026-09-26 05:28:11.264	2026-10-17 11:23:08.893	3999	80	marvels-spider-man-remastered	f	\N	\N	t
f2b83bf0-a440-4aac-adce-c7e36d1a6d5f	Resident Evil 2	Capcom	0	Adventure	150	0	https://image.api.playstation.com/vulcan/ap/rnd/202206/0204/uDFoGvnMTTCLVmTwjj0njGWC.png	2019-01-25	 PC	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT Required)\nProcessor: Intel® Core™ i5-4460 or AMD FX™-6300 or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 960 or AMD Radeon™ RX 460\nDirectX: Version 12\nStorage: 26 GB available space	Requires a 64-bit processor and operating system\nOS: WINDOWS® 10 (64-BIT Required)\nProcessor: Intel® Core™ i7-3770 or AMD FX™-9590 or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 1060 or AMD Radeon™ RX 480 with 3GB VRAM\nDirectX: Version 12\nStorage: 26 GB available space	https://www.youtube.com/watch?v=u3wS-Q2KBpk		/badges/STEAM.png		f	28	2026-09-26 04:59:13.695	2026-10-17 10:47:59.988	2497	\N	resident-evil-2	f	\N	\N	t
14056a6d-c782-48f0-b0d4-1bb766ad2d84	Drive Beyond Horizons	Tacty Studio	3.4	Racing, Simulator, Adventure, Indie	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobtfc.jpg	2025-03-24	PC (Microsoft Windows)	f	f	f		\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11 (64-Bit)\nPROCESSOR: Intel Core i5-6600@ 3.1 GHz or AMD R5 1600X @ 3.5 GHz or equivalent\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1650 or equivalent	Requires a 64-bit processor and operating system\nOS: Windows 10/11 (64-Bit)\nPROCESSOR: Intel Core i5 10400 3.1 GHz or AMD Ryzen 5 2600x 3.1 GHz\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060 or equivalent	https://www.youtube.com/watch?v=7PZ-e-cFEZg		/badges/STEAM.png		f	72	2026-10-10 20:45:08.008	2026-10-17 10:48:00.034	1100	150	drive-beyond-horizons	f	\N	\N	t
8f4fbcea-1198-4d72-9633-e3b0d3bd885f	Mortal Shell II	Cold Symmetry	4	Role-playing (RPG), Adventure	250	0	/uploads/optimized/1792003858816-209820544.webp	2026-08-20	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10 / 11\nPROCESSOR: Intel Core i7-10700K @ 3.8 GHz or better or AMD Ryzen 5 3600 @ 3.6 GHz or better\nGRAPHICS: NVIDIA GeForce RTX 2060 SUPER 8 GB or AMD Radeon RX 6600 8 GB\nADDITIONAL NOTES: SSD required		https://youtu.be/MIEHUDi6DwU?si=tyjMTYqClwNb8Yho, https://youtu.be/cPSE1yrooT4?t=7	/uploads/optimized/1792003859094-408807740.webp,/uploads/optimized/1792003859491-704686154.webp,/uploads/optimized/1792003860154-597676123.webp,/uploads/optimized/1792003861082-595052021.webp,/uploads/optimized/1792003861825-633802371.webp,/uploads/optimized/1792003862809-169385918.webp,/uploads/optimized/1792003867018-412874780.webp	/badges/STEAM.png	2584270	f	12	2026-09-25 07:37:25.531	2026-10-17 10:47:59.978	2999	100	mortal-shell-ii	f	\N	\N	t
0f5deeb1-283d-4da1-bcdd-1a8daacfe2cf	Devil May Cry 5	Capcom	4.5	Adventure	150	0	https://upload.wikimedia.org/wikipedia/en/c/cb/Devil_May_Cry_5.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original	2026-06-23	Nintendo Switch 2	f	t	f	\N	\N	7		OS: WINDOWS® 10 (64-BIT Required)\nProcessor: Intel® Core™ i5-4460, AMD FX™-6300, or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 760 or AMD Radeon™ R7 260x with 2GB Video RAM, or better\nDirectX: Version 11\nStorage: 35 GB available space\nAdditional Notes: *Xinput support Controllers recommended *Internet connection required for game activation. (Network connectivity uses Steam® developed by Valve® Corporation.)	OS: WINDOWS® 10 / 11\nProcessor: Intel® Core™ i7-3770, AMD FX™-9590, or better\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 1060 with 6GB VRAM, AMD Radeon™ RX 480 with 8GB VRAM, or better\nDirectX: Version 12\nStorage: 35 GB available space\nAdditional Notes: *Xinput support Controllers recommended *Internet connection required for game activation. (Network connectivity uses Steam® developed by Valve® Corporation.)	https://www.youtube.com/watch?v=g_2VZvi0fQ0		/badges/STEAM.png		f	45	2026-09-26 05:43:56.257	2026-10-17 10:47:59.998	1997	\N	devil-may-cry-5	f	\N	\N	t
47b94068-b7ce-4373-af07-f9f7c4206fbe	Sekiro™: Shadows Die Twice	FromSoftware	4.5	Adventure	199	0	/uploads/optimized/1791825700288-321364373.webp	2019-03-22	Google Stadia, PlayStation 4, PC (Microsoft Windows), Xbox One	f	f	f	\N	\N	7		OS *: Windows 7 64-bit | Windows 8 64-bit | Windows 10 64-bit\nProcessor: Intel Core i3-2100 | AMD FX-6300\nMemory: 4 GB RAM\nGraphics: NVIDIA GeForce GTX 760 | AMD Radeon HD 7950\nDirectX: Version 11\nNetwork: Broadband Internet connection\nStorage: 25 GB available space\nSound Card: DirectX 11 Compatible	OS *: Windows 7 64-bit | Windows 8 64-bit | Windows 10 64-bit\nProcessor: Intel Core i5-2500K | AMD Ryzen 5 1400\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 970 | AMD Radeon RX 570\nDirectX: Version 11\nNetwork: Broadband Internet connection\nStorage: 25 GB available space\nSound Card: DirectX 11 Compatible			/badges/STEAM.png		t	40	2026-10-12 17:21:40.649	2026-10-17 11:24:28.411	4997	100	sekiro-shadows-die-twice	f	\N	\N	t
353a203f-450c-4a82-8703-6bc05d2cfa76	Red Dead Redemption 2 [Online/Offline]	Rockstar Games	4.7	Shooter, Role-playing (RPG), Adventure	999	0	/uploads/optimized/1792003568506-73020781.webp	2018-10-26	Google Stadia, PlayStation 4, PC (Microsoft Windows), Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 - 64-bit\nPROCESSOR: Intel® Core™ i5-2500K / AMD FX-6300\nMEMORY: 8 GB RAM\nGRAPHICS: Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB\nNETWORK: Broadband Internet connection\nSTORAGE: 150 GB available space\nSOUND CARD: Direct X Compatible	Requires a 64-bit processor and operating system\nOS: Windows 10 - 64-bit\nPROCESSOR: Intel® Core™ i7-4770K / AMD Ryzen 5 1500X\nMEMORY: 12 GB RAM\nGRAPHICS: Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB\nNETWORK: Broadband Internet connection\nSTORAGE: 150 GB available space\nSOUND CARD: Direct X Compatible	https://youtu.be/eaW0tYpxyp0?si=cZdp_U4HsKWjKjwd	/uploads/optimized/1792003569466-421738247.webp,/uploads/optimized/1792003569965-809463944.webp,/uploads/optimized/1792003570234-357949278.webp,/uploads/optimized/1792003570788-242730658.webp,/uploads/optimized/1792003570958-791335545.webp,/uploads/optimized/1792003571222-367827972.webp,/uploads/optimized/1792003571453-695793766.webp,/uploads/optimized/1792003574733-255128703.webp,/uploads/optimized/1792003575716-911752253.webp	/badges/ROCKSTAR.png	1174180	f	21	2026-09-25 07:37:25.549	2026-10-17 10:47:59.984	\N	650	red-dead-redemption-2	f	\N	\N	t
d5c5b0be-0624-4ebc-93e9-a297d67671e4	Resident Evil Village	Capcom	0	Shooter, Puzzle, Adventure	199	0	https://m.media-amazon.com/images/M/MV5BYjFlYjM2MzUtMzc1Ni00NDZmLWI4YjUtMTk4NmU5NmNlMDhkXkEyXkFqcGc@._V1_.jpg	2021-05-07	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit)\nProcessor: AMD Ryzen 3 1200 ／ Intel Core i5-7500\nMemory: 8 GB RAM\nGraphics: AMD Radeon RX 560 with 4GB VRAM ／ NVIDIA GeForce GTX 1050 Ti with 4GB VRAM\nDirectX: Version 12\nAdditional Notes: Estimated performance (when set to Prioritize Performance): 1080p/60fps. ・Framerate might drop in graphics-intensive scenes. ・AMD Radeon RX 6700 XT or NVIDIA GeForce RTX 2060 required to support ray tracing.	Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit)/Windows 11 (64 bit)\nProcessor: AMD Ryzen 5 3600 ／ Intel Core i7 8700\nMemory: 16 GB RAM\nGraphics: AMD Radeon RX 5700 ／ NVIDIA GeForce GTX 1070\nDirectX: Version 12\nAdditional Notes: Estimated performance: 1080p/60fps ・Framerate might drop in graphics-intensive scenes. ・AMD Radeon RX 6700 XT or NVIDIA GeForce RTX 2070 required to support ray tracing.	https://www.youtube.com/watch?v=arEdruKxrQ8		/badges/STEAM.png		f	24	2026-09-26 05:11:35.68	2026-10-17 10:47:59.986	2497	80	resident-evil-village	f	\N	\N	t
c04d02b5-969c-459c-a992-075d4b6b6395	Horizon Zero Dawn™ Remastered	Guerrilla Games	4.5	Shooter, Role-playing (RPG), Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/co90ti.jpg	2024-10-31	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit (version 1909 or higher)\nProcessor: Intel Core i3-8100 or AMD Ryzen 3 1300X\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 1650 4GB or AMD Radeon RX 5500 XT 4GB\nStorage: 135 GB available space\nAdditional Notes: 135GB SSD Space	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit (version 1909 or higher)\nProcessor: Intel Core i5-8600 or AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 3060 or AMD Radeon RX 5700\nStorage: 135 GB available space\nAdditional Notes: 135GB SSD Space	https://www.youtube.com/watch?v=rgDYyxOKBgg		/badges/STEAM.png		f	29	2026-09-26 05:35:39.189	2026-10-17 10:47:59.989	2999	100	horizon-zero-dawn-remastered	f	\N	\N	t
bfc82d7b-5bc4-43b9-b3d7-f7a1e2cd2265	Detroit: Become Human	Quantic Dream	4	Adventure	149	0	/uploads/optimized/1792233250626-240654514.webp	2018-05-25	PlayStation 4, PC (Microsoft Windows)	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit)\nProcessor: Intel Core i5-2300 @ 2.8 GHz or AMD Ryzen 3 1200 @ 3.1GHz or AMD FX-8350 @ 4.2GHz\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 780 or AMD HD 7950 with 3GB VRAM minimum (Support of Vulkan 1.1 required)\nStorage: 55 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 (64 bit)\nProcessor: Intel Core i5-6600 @ 3.3 GHz or AMD Ryzen 3 1300 X @ 3.4 GHz\nMemory: 12 GB RAM\nGraphics: Nvidia GeForce GTX 1060 or AMD Radeon RX 580 with 4GB VRAM minimum (Support of Vulkan 1.1 required)\nStorage: 55 GB available space	https://youtu.be/8a-EObAhYrg?si=roEOGCvIUCHfpqmM		/badges/STEAM.png		f	54	2026-09-26 04:16:07.455	2026-10-17 10:48:00.01	1999	\N	detroit-become-human	f	\N	\N	t
2e300763-8e3d-4909-821c-5bb8bb2b1384	New Assassin's Bundle	Ubisoft	4.5	Bundle	599	0	/uploads/optimized/1790839775904-967527631.webp	2026-10-01	Windows	f	f	f	\N	\N	7					/uploads/optimized/1790839820403-716514202.webp,/uploads/optimized/1790839820407-949293127.webp	/badges/Ubsoft.png		f	74	2026-10-01 07:29:36.402	2026-10-17 10:48:00.038	9098	\N	new-assassins-bundle-1	t	Assassin's Creed Black Flag Resynced, Assassin's Creed Shadows	1. Assassin's Creed Black Flag Resynced\n2. Assassin's Creed Shadows	t
90ccb66e-58dc-4b0f-ad35-3bf325993f8a	Control Resonant	Remedy Entertainment	4.3	Role-playing (RPG), Hack and slash/Beat 'em up, Adventure	359	0	/uploads/optimized/1792003885993-827583042.webp	2026-09-24	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 / 11 (64 bit)\nPROCESSOR: Intel i5-8500 / AMD Ryzen 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: Geforce GTX 1070 / Radeon RX 5600 XT / Intel Arc A580\nSTORAGE: 120 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating systems\nOS: Windows 10 / 11 (64 bit)\nPROCESSOR: Intel Core i7-10700 / AMD Ryzen 7 3700X\nMEMORY: 16 GB RAM\nGRAPHICS: Geforce RTX 3060 Ti / Radeon RX 6700 XT / Intel Arc B580\nSTORAGE: 120 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/SqvAvOAd1VA?si=szTvDgAsjH1ubGzq		/badges/STEAM.png		f	1	2026-09-25 08:10:06.215	2026-10-17 10:47:59.969	3599	100	control-resonant	f	\N	\N	t
c6beaa20-cc45-464d-96c3-af2692561af3	PRAGMATA	Capcom	4.4	Shooter, Adventure	299	0	/uploads/optimized/1792003823972-552192518.webp	2026-04-17	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 11 (64 bit)\nPROCESSOR: Intel Core i5-8500 / AMD Ryzen 5 3500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 6 GB / Radeon RX 5500 XT 8 GB\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 40 GB available space\nADDITIONAL NOTES: Estimated performance when set to "Performance" preset: 1080p/45 fps. Framerate might drop in graphics-intensive scenes. SSD recommended.	Requires a 64-bit processor and operating system\nOS: Windows 11 (64 bit)\nPROCESSOR: Intel Core i7-8700 / AMD Ryzen 5 5500\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 2060 Super 8GB / Radeon RX 6600 8GB\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 40 GB available space\nADDITIONAL NOTES: Estimated performance when set to "Balanced" preset: 1080p/60 fps. Frame rate might drop in graphics-intensive scenes. AMD Radeon RX 6700 XT 12GB or NVIDIA GeForce RTX 3060 12GB required to support ray tracing. SSD recommended.	https://youtu.be/oncaa_fMsyw?si=wduuA2nPbMRBlymS	/uploads/1788269317431-62680490.jpg,/uploads/optimized/1792003824144-642741273.webp,/uploads/optimized/1792003824581-50121921.webp,/uploads/optimized/1792003825069-809730715.webp,/uploads/optimized/1792003825789-389447746.webp,/uploads/optimized/1792003826200-14543615.webp,/uploads/optimized/1792003826532-963020037.webp,https://gamegpu.com/images/1_2025/GAMES/PRAGMATA_SKETCHBOOK_-_DEMO/game/PRAGMATA_SKETCHBOOK_2025_12_14_00_15_19_050_ggpu.webp,/uploads/optimized/1792003827230-818668621.webp,/uploads/optimized/1792003827641-773479805.webp	/badges/STEAM.png	3357650	f	8	2026-09-25 07:37:25.545	2026-10-17 10:47:59.975	3799	100	pragmata	f	\N	\N	t
b23d7cee-3bfa-4003-80d2-124bcab9352f	Crimson Desert	Pearl Abyss	4.3	Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/coaqai.jpg	2026-03-19	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nPROCESSOR: Ryzen 5 2600X / i5-8500\nMEMORY: 16 GB RAM\nGRAPHICS: RX 5500 XT / GTX 1060\nDIRECTX: Version 12\nSTORAGE: 150 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: SSD required.	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit\nPROCESSOR: Ryzen 5 5600 / i5-11600K\nMEMORY: 16 GB RAM\nGRAPHICS: RX 6700 XT / RTX 2080\nDIRECTX: Version 12\nSTORAGE: 150 GB available space\nSOUND CARD: Windows Compatible Audio Device\nADDITIONAL NOTES: SSD required.	https://youtu.be/c5-8FXNmyJs?si=ZGAg2f8TEn7i-Ki7	https://preview.redd.it/big-update-for-crimson-desert-has-it-looking-better-than-v0-lg1brbfakwwg1.jpeg?width=1080&crop=smart&auto=webp&s=cfcacd6bf9fd97e2090c315a88509e220f6e3a23,https://sm.ign.com/ign_sea/gallery/c/crimson-de/crimson-desert-ign-first-combat-and-mounts-screenshots_8fcr.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSQIjl8OFIHwxQEtJhH9E6JXV5ED51QMe-KOCLvUcZBfCQUgptNaQBIce5&s=10,https://static0.thegamerimages.com/wordpress/wp-content/uploads/wm/2026/03/dragon-in-crimson-desert-2.jpg?q=49&fit=crop&w=825&dpr=2,https://www.dexerto.com/cdn-image/wp-content/uploads/2025/06/18/crimson-desert-first-impressions-dexerto-summer-game-fest.jpg?width=1200&quality=60&format=auto,https://static0.fextralifeimages.com/wordpress/wp-content/uploads/2025/10/crimson-desert-new-gameplay-october.jpg?q=49&fit=crop&w=825&dpr=2,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIh36IGXTCqGvZyiJov1nek9JV0E5sorRpEDW6GYmD_egv1xrnyQ8jDszk&s=10,https://www.pcgamesn.com/wp-content/sites/pcgamesn/2026/03/cd-review-view.jpg	/badges/STEAM.png	3321460	f	17	2026-09-25 07:37:25.547	2026-10-17 10:47:59.981	4499	100	crimson-desert	f	\N	\N	t
dc3dc755-8e3f-4eb6-90e7-c87bd14b9226	Grand Theft Auto V [Online/Offline]	Rockstar North	4.4	Shooter, Racing, Arcade	799	0	/uploads/optimized/1792003588890-262901483.webp	2015-04-14	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64 Bit\nPROCESSOR: Intel Core 2 Quad CPU Q6600 @ 2.40GHz (4 CPUs) / AMD Phenom 9850 Quad-Core Processor (4 CPUs) @ 2.5GHz\nMEMORY: 4 GB RAM\nGRAPHICS: NVIDIA 9800 GT 1GB / AMD HD 4870 1GB (DX 10, 10.1, 11)\nSTORAGE: 125 GB available space\nSOUND CARD: 100% DirectX 10 compatible	Requires a 64-bit processor and operating system\nOS: Windows 10 64 Bit\nPROCESSOR: Intel Core i5 3470 @ 3.2GHz (4 CPUs) / AMD X8 FX-8350 @ 4GHz (8 CPUs)\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 660 2GB / AMD HD 7870 2GB\nSTORAGE: 125 GB available space\nSOUND CARD: 100% DirectX 10 compatible	https://youtu.be/hvoD7ehZPcM?si=WTmZN_bZciCWTEpC	/uploads/optimized/1792003589226-936153207.webp,/uploads/optimized/1792003590092-442580639.webp,/uploads/optimized/1792003591429-316965445.webp,/uploads/optimized/1792003592091-302923492.webp,/uploads/optimized/1792003593190-509906485.webp,/uploads/optimized/1792003594974-219980117.webp,/uploads/optimized/1792003596842-72358853.webp,/uploads/optimized/1792003597745-419840099.webp,/uploads/optimized/1792003599351-473520518.webp	/badges/EPIC_Game.png	271590	f	22	2026-09-25 07:37:25.538	2026-10-17 10:47:59.984	\N	650	grand-theft-auto-v-onlineoffline	f	\N	\N	t
e81aee38-ab9d-4ea6-adc4-cf46b289e6cc	UNCHARTED: Legacy of Thieves	Naughty Dog	4.5	Shooter, Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocqz5.jpg	2022-01-28	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10 64-bit\nPROCESSOR: Intel i5-4430, AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 960 (4 GB), AMD R9 290X (4 GB)\nDIRECTX: Version 12\nSTORAGE: 126 GB available space	OS: Windows 10 64-bit\nPROCESSOR: Intel i7-4770, AMD Ryzen 5 1500X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GTX 1060 (6 GB), AMD RX 570 (4 GB)\nDIRECTX: Version 12\nSTORAGE: 126 GB available space	https://youtu.be/xeMA3O9pfiY?si=5iURYAgxGgf39Lc7	https://pbs.twimg.com/media/FgAeNM_X0AArL_T.jpg,https://image.api.playstation.com/vulcan/ap/rnd/202111/2000/Ta807nPySbwuYgWk5XDFEgDy.jpg,https://d1lss44hh2trtw.cloudfront.net/assets/article/2022/01/25/uncharted-legacy-of-thieves-collection-impressions_feature.jpg,https://www.dsogaming.com/wp-content/uploads/2022/06/Uncharted-4-screenshot.jpg,https://www.nme.com/wp-content/uploads/2021/10/Uncharted-4-A-Thiefs-End.jpg,https://cdn.checkpointgaming.net/wp-content/uploads/2022/10/29153909/TLL-16.9-Action-WM.jpg,https://nextrift.com/wp-content/uploads/2022/01/uncharted-legacy-of-thieves-collection-review-27.jpg,https://cdn2.unrealengine.com/uncharted-legacy-of-thieves-collection-1920x1080-4eaf1476b5a2.jpg,https://image.api.playstation.com/cdn/EP9000/CUSA07875_00/FREE_CONTENTXHMzTp4FIDVD8zUxP9Rs/UTLL-Launch-Screenshot_11.png	/badges/STEAM.png	1659420	f	43	2026-09-25 07:37:25.491	2026-10-17 10:47:59.997	3299	\N	uncharted-legacy-of-thieves	f	\N	\N	t
f30793b3-7412-4714-9f4a-578461389dad	Ghost of Tsushima DIRECTOR'S CUT	Sucker Punch Productions	4.5	Role-playing (RPG), Adventure	199	0	https://images.igdb.com/igdb/image/upload/t_1080p/co3p5f.jpg	2021-08-20	PlayStation 4, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10\nProcessor: Intel Core i3-7100 or AMD Ryzen 3 1200\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 960 or AMD Radeon RX 5500 XT\nStorage: 75 GB available space\nAdditional Notes: SSD Recommended	Requires a 64-bit processor and operating system\nOS: Windows 10\nProcessor: Intel Core i5-8600 or AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2060 or AMD Radeon RX 5600 XT\nStorage: 75 GB available space\nAdditional Notes: SSD Required	https://www.youtube.com/watch?v=BWktKH0eW5I		/badges/STEAM.png		f	39	2026-09-26 05:37:06.011	2026-10-17 10:47:59.995	3999	100	ghost-of-tsushima-directors-cut	f	\N	\N	t
3ba6285d-dc2e-402a-810f-2ce469708d65	Dying Light: The Beast	Techland	3.8	Role-playing (RPG), Adventure	299	0	/uploads/optimized/1792004005757-556515966.webp	2025-09-18	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 or newer\nPROCESSOR: Intel i5-9600K / AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce 1060 / AMD Radeon 5500 XT / Intel ARC A750\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD Required	Requires a 64-bit processor and operating system\nOS: Windows 10 or newer\nPROCESSOR: Intel i5-13400F / AMD Ryzen 7 7700\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3070 TI / AMD Radeon 6750 XT / Intel ARC B580\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/qsqBCs7o5go?si=RD1No6Powt9G0D3s	https://dyinglightgame.com/img/share_thebeast.jpg,/uploads/optimized/1792004007990-199723326.webp,/uploads/optimized/1792004009377-37586773.webp,/uploads/optimized/1792004009803-909545877.webp,/uploads/optimized/1792004010332-808579455.webp,/uploads/optimized/1792004011719-678246207.webp,/uploads/optimized/1792004011964-529243814.webp,/uploads/optimized/1792004012205-238789212.webp,/uploads/optimized/1792004012695-854045198.webp,/uploads/optimized/1792004012830-823351527.webp,/uploads/optimized/1792004013397-887360921.webp,/uploads/optimized/1792004013859-595524867.webp,/uploads/optimized/1792004014477-831356607.webp,/uploads/optimized/1792004014709-550950737.webp	/badges/STEAM.png	3008130	t	46	2026-09-25 07:37:25.482	2026-10-17 11:20:34.193	3360	\N	dying-light-the-beast	f	\N	\N	t
3bc74105-2a80-43ff-9674-47b8d1921aad	Beast of Reincarnation	Game Freak	4.1	Role-playing (RPG), Adventure	249	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobc5q.jpg	2026-08-04	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: Intel Core i5-8400 or AMD Ryzen 5 3600\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1070 (8 GB) or AMD Radeon RX 580 (8 GB)\nDIRECTX: Version 12\nSTORAGE: 45 GB available space\nADDITIONAL NOTES: Low 1080p @ 40fps w/ DLSS (RTX 20-50 Series) or FSR1 (Performance). SSD required.	Requires a 64-bit processor and operating system\nOS: Windows 11\nPROCESSOR: Intel Core i7-12700K or AMD Ryzen 7 5800X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3060 (12 GB) or AMD Radeon RX 6700 XT (12 GB)\nDIRECTX: Version 12\nSTORAGE: 45 GB available space\nADDITIONAL NOTES: Med 1080p @ 60fps w/ DLSS or FSR3 (Performance). SSD required.	https://youtu.be/H0r-Kap8kWI?si=qW2nwVnbQcchqHDw	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtDjylhuLJ2qy8PZif927qIcrlI6C--MBWNd1AUk9YE44PYgkW2tYq7lU&s=10,https://insertcoins.press/_next/image?url=%2Fimages%2Fbeastofreincarnation%2Fscreenshot-3.webp&w=3840&q=75&dpl=dpl_39d3cnF2X7u6U6jwkkZkmKw7yxrH,https://www.rpgfan.com/wp-content/uploads/2025/06/Beast-of-Reincarnation-Screenshot-020.webp,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/BeastOfReincarnation_35.png,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/BeastOfReincarnation_49.png,https://interfaceingame.com/wp-content/uploads/beast-of-reincarnation/beast-of-reincarnation-ability-selection.png	/badges/STEAM.png	2001760	f	18	2026-09-25 07:37:25.536	2026-10-17 10:47:59.982	2999	100	beast-of-reincarnation	f	\N	\N	t
fa12d69d-0ff5-48fc-9066-ef58e84014c3	ARK: Survival Evolved	Studio Wildcard	3.4	Shooter, Role-playing (RPG), Simulator, Adventure, Indie	199	0	/uploads/optimized/1791666992664-820820843.webp	2017-08-27	Google Stadia, Xbox Series X|S, PlayStation 4, Linux, Android, PC (Microsoft Windows), iOS, Mac, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS *: Windows 7/8.1/10 (64-bit versions)\nPROCESSOR: Intel Core i5-2400/AMD FX-8320 or better\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 670 2GB/AMD Radeon HD 7870 2GB or better\nDIRECTX: Version 10\nSTORAGE: 60 GB available space\nADDITIONAL NOTES: Requires broadband internet connection for multiplayer\n	OS *: Windows 7/8.1/10 (64-bit versions)\nPROCESSOR: Intel Core i5-2400/AMD FX-8320 or better\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GTX 670 2GB/AMD Radeon HD 7870 2GB or better\nDIRECTX: Version 10\nSTORAGE: 60 GB available space\nADDITIONAL NOTES: Requires broadband internet connection for multiplayer\n	https://www.youtube.com/watch?v=5fIAPcVdZO8		/badges/STEAM.png		f	56	2026-10-10 21:16:33.019	2026-10-17 10:48:00.012	690	\N	ark-survival-evolved	f	\N	\N	t
a1543c4d-658e-4243-9370-f45fd6dac702	Onimusha: Way of the Sword	Capcom	4.3	Role-playing (RPG), Hack and slash/Beat 'em up, Adventure	399	0	https://images.igdb.com/igdb/image/upload/t_1080p/cocdt3.jpg	2026-09-04	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 11\nProcessor: Intel Core i5-8400 / AMD Ryzen 3 3100\nMemory: 16 GB RAM\nGraphics: GeForce GTX 1660(6GB) / Radeon RX 5500 XT(8GB)\nDirectX: Version 12\nStorage: 50 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 11\nProcessor: Intel Core i5-10400 / AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: GeForce RTX 2060 Super (8GB) / Radeon RX 6600(8GB)\nDirectX: Version 12\nStorage: 50 GB available space	https://youtu.be/enugBi8hMXg?si=36JoPystQuwkG3eH		/badges/STEAM.png		f	4	2026-09-26 03:59:25.192	2026-10-17 10:47:59.972	4399	150	onimusha-way-of-the-sword	f	\N	\N	t
d12c159d-0ec3-4892-ae7f-062a5a3e2f99	Marvel’s Spider-Man: Miles Morales	 Insomniac Games, Nixxes Software	0	Open World,Adventure	150	0	https://image.api.playstation.com/vulcan/ap/rnd/202008/1020/PRfYtTZQsuj3ALrBXGL8MjAH.jpg	2022-11-18	PC	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit 1909\nProcessor: Intel Core i3-4160, 3.6 GHz or AMD equivalent\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 950 or AMD Radeon RX 470\nDirectX: Version 12\nStorage: 75 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 64-bit 1909\nProcessor: Intel Core i5-4670, 3.4 Ghz or AMD Ryzen 5 1600, 3.2 Ghz\nMemory: 16 GB RAM\nGraphics: NVIDIA GTX 1060 6GB or AMD Radeon RX 580 8GB\nDirectX: Version 12\nStorage: 75 GB available space\nAdditional Notes: 75 GB SSD space Recommended	https://www.youtube.com/watch?v=hY3qiRq0yEM		/badges/STEAM.png		f	37	2026-09-26 05:31:41.255	2026-10-17 10:47:59.994	3299	\N	marvels-spider-man-miles-morales	f	\N	\N	t
12d10868-6e6f-474f-996a-d5065a1c90e4	Titanfall® 2	 Respawn Entertainment	0	Shooter, Adventure	99	0	https://thumb.wikimedia.org/wikipedia/en/thumb/1/13/Titanfall_2.jpg/250px-Titanfall_2.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail	2016-10-28	PC	f	t	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS *: Win 7/8/8.1/10 64bit\nProcessor: Intel Core i3-6300t or equivalent [4 or more hardware threads]\nMemory: 8 GB RAM\nGraphics: NVIDIA Geforce GTX 660 2GB or AMD Radeon HD 7850 2GB\nDirectX: Version 11\nStorage: 45 GB available space	Requires a 64-bit processor and operating system\nOS *: Win 7/8/8.1/10 64bit\nProcessor: Intel Core i5-6600 or equivalent\nMemory: 16 GB RAM\nGraphics: NVIDIA Geforce GTX 1060 6GB or AMD Radeon RX 480 8GB\nDirectX: Version 11\nStorage: 45 GB available space	https://www.youtube.com/watch?v=VqeMjHmL9eg		/badges/STEAM.png		f	55	2026-09-26 05:50:55.944	2026-10-17 10:48:00.011	1499	\N	titanfall-2	f	\N	\N	t
30ab13bd-4456-4297-8909-140e170eaaf7	Dune Awakening 	Funcom	4.1	Role-playing (RPG), Adventure	149	0	https://images.igdb.com/igdb/image/upload/t_1080p/cobf3a.jpg	2025-06-10	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows (64-bit) 10\nPROCESSOR: Intel Core i5-2500 @ 3,3 GHz (4 CPUs)\nMEMORY: 8 GB RAM\nGRAPHICS: NVidia GeForce GTX 1050\nDIRECTX: Version 11\nSTORAGE: 2 GB available space	OS: Windows (64-bit) 10\nPROCESSOR: Intel Core i7-11700K or AMD Ryzen 7 5800X\nGRAPHICS: NVIDIA GeForce GTX 1660S, 6 GB or AMD Radeon RX 5600 XT, 6 GB\nDIRECTX: Version 11\nSTORAGE: 2 GB available space	https://youtu.be/ztdVjiRpYfo?si=lZmPZi5ZFPnp_XT1	https://static.bandainamcoent.eu/high/dune/dune-awakening/00-page-product/DUNE-KeyArt.jpg,https://kotaku.com/app/uploads/2025/06/7f9738b31f9196affb74fc65c0edc578.jpg,https://cdn.mos.cms.futurecdn.net/CQDD5ZEgyub9mDYxMHhAc9.jpg,https://copperice.co.uk/wp-content/uploads/2025/07/dune-awakening-scaled.jpg,https://www.techspot.com/images2/news/bigimage/2022/08/2022-08-24-image-12.jpg,https://i.redd.it/fs8tua0pyhxc1.jpeg,https://blogcritics.org/wp-content/uploads/2025/07/04-UI_Launch_BuildingMenu-2048x1152-1.webp,https://cdn.checkpointgaming.net/wp-content/uploads/2025/06/18010920/Dune-2-scaled.jpg	/badges/STEAM.png	1172710	f	58	2026-09-25 07:37:25.55	2026-10-17 10:48:00.013	2799	\N	dune-awakening	f	\N	\N	t
2a0f7b09-f4f3-4c8e-b436-529b32712965	Elden Ring	FromSoftware	4.1	Role-playing (RPG), Hack and slash/Beat 'em up	99	0	https://cdng.europosters.eu/pod_public/750/216712.jpg	2025-05-30	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7	\N	Requires a 64-bit processor and operating system\nOS: Windows 10\nPROCESSOR: INTEL CORE I5-8400 or AMD RYZEN 3 3300X\nMEMORY: 12 GB RAM\nGRAPHICS: NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB\nDIRECTX: Version 12\nSTORAGE: 60 GB available space\nSOUND CARD: Windows Compatible Audio Device	Requires a 64-bit processor and operating system\nOS: Windows 10/11\nPROCESSOR: INTEL CORE I7-8700K or AMD RYZEN 5 3600X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB\nDIRECTX: Version 12\nSTORAGE: 60 GB available space\nSOUND CARD: Windows Compatible Audio Device	https://youtu.be/E3Huy2cdih0?si=ACejWW5e5t2Al44H	https://images.wallpapersden.com/image/download/elden-ring-4k-hd-gaming_bWVnameUmZqaraWkpJRmbmdlrWZlbWU.jpg,https://images.wallpapersden.com/image/download/new-elden-ring-2022_bWdlZm6UmZqaraWkpJRmbmdlrWZlbWU.jpg,https://images.hdqwalls.com/wallpapers/elden-ring-nightreign-4k-ro.jpg,https://wallpapers.com/images/hd/elden-ring-erdtree-v8p2ufggfmpds1em.jpg,https://img.uhdpaper.com/wallpaper/elden-ring-godrick-boss-fight-465@5@k,https://images.wallpapersden.com/image/download/shadow-of-the-erdtree-hd-elden-ring_bmdnbmmUmZqaraWkpJRmbmdprWZlbWU.jpg,https://wallpapers.com/images/hd/elden-ring-nightreign-boss-fight-794wyw6wh033a7jw.jpg,https://wallpapers.com/images/hd/elden-ring-battle-scene-jnyufh05lejpvxgu.jpg	/badges/STEAM.png	1245620	t	41	2026-09-25 07:37:25.495	2026-10-17 11:20:59.715	\N	\N	\N	f	\N	\N	t
23a9c326-88dd-4a21-b794-680cbec69935	DEATH STRANDING 2	Kojima Productions	4.6	Shooter, Adventure	299	0	https://images.igdb.com/igdb/image/upload/t_1080p/co9ipx.jpg	2025-06-26	PC (Microsoft Windows), PlayStation 5	f	f	f	\N	\N	7		OS: Windows 10/11 Version 1909 or newer\nPROCESSOR: Intel Core i3-10100, AMD Ryzen 3 3100\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660, AMD Radeon RX 5500 XT 8GB\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	OS: Windows 10/11 Version 1909 or newer\nPROCESSOR: Intel Core i7-11700, AMD Ryzen 7 5700X\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA GeForce RTX 3070, AMD Radeon RX 6800\nSTORAGE: 150 GB available space\nADDITIONAL NOTES: SSD Required	https://youtu.be/etOOO9Sq7u8?si=nnEEC_K0jZvP2aNZ	https://www.well-played.com.au/wp-content/uploads/2025/06/Death-Stranding-2-Review-Feature-Image.jpg,https://w.wallhaven.cc/full/d6/wallhaven-d68kdl.png,https://gamingbolt.com/wp-content/uploads/2025/06/Death-Stranding-2-On-the-Beach.jpg,https://www.kojimaproductions.jp/sites/default/files/2022-12/ds2_tga2022_screenshot001_2k.jpg,https://cdn.neowin.com/news/images/uploaded/2025/03/1741562564_ds2_sxsw2025_screenshots004.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBBGq67TxGJ87NwRmo56sXlTH1ssFs5rdmmJ6TMxeW6kJ2v6aEwCf5cEMh&s=10,https://cdn.mos.cms.futurecdn.net/5kBG9meFVq7gt3Rs7ndggj.jpg,https://blog.playstation.com/uploads/2025/05/9098f6c4ce886d5c7c5212f48a9a932c2d27def6.jpg	/badges/STEAM.png	3280350	t	42	2026-09-25 07:37:25.486	2026-10-17 11:20:43.237	4999	\N	death-stranding-2	f	\N	\N	t
431cdd4c-3e4f-4f14-a5be-571e8b5802c5	Outlast 2 [Offline]	Red Barrels	3.7	Adventure, Indie	199	0	/uploads/optimized/1791666186360-841505766.webp	2017-04-25	PlayStation 4, PC (Microsoft Windows), Mac, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS *: Windows Vista / 7 / 8 / 10, 64-bits\nPROCESSOR: Intel Core i3-530\nMEMORY: 4 GB RAM\nGRAPHICS: 1GB VRAM, NVIDIA Geforce GTX 260 / ATI Radeon HD 4870\nDIRECTX: Version 10\nSTORAGE: 30 GB available space\nSOUND CARD: DirectX Compatible\nADDITIONAL NOTES: Targetting 720p @ 30 fps	OS *: Windows Vista / 7 / 8 / 10, 64-bits\nPROCESSOR: Intel Core i5\nMEMORY: 8 GB RAM\nGRAPHICS: 1.5GB VRAM, NVIDIA Geforce GTX 660 / ATI Radeon HD 7850\nDIRECTX: Version 11\nSTORAGE: 30 GB available space\nSOUND CARD: DirectX Compatible\nADDITIONAL NOTES: Targetting 1080p @ 60 fps\n	https://www.youtube.com/watch?v=MKrUZ36IVAY		/badges/STEAM.png		t	48	2026-10-10 21:03:06.641	2026-10-17 11:24:35.682	880	150	outlast-2	f	\N	\N	t
6ef41bb1-5c68-4471-acea-b064a7a62716	Palworld [Offline]	PocketPair	3.6	Shooter, Role-playing (RPG), Hack and slash/Beat 'em up, Adventure, Indie	299	0	/uploads/optimized/1792003810206-948123222.webp	2026-07-10	Xbox Series X|S, PC (Microsoft Windows), PlayStation 5, Mac, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 (64-Bit)\nProcessor: Intel Core i5-9400F\nMemory: 16 GB RAM\nGraphics: GeForce GTX 1660\nDirectX: Version 11\nNetwork: Broadband Internet connection\nStorage: 40 GB available space\nAdditional Notes: SSD Required - Performance may vary depending on the amount of active Pals.	Requires a 64-bit processor and operating system\nOS: Windows 11 (64-Bit)\nProcessor: Intel Core i5-12400 / AMD Ryzen 5 5600X\nMemory: 32 GB RAM\nGraphics: GeForce RTX 3060 Ti / Radeon RX 6700 XT\nDirectX: Version 11\nNetwork: Broadband Internet connection\nStorage: 40 GB available space\nAdditional Notes: SSD Required - Performance may vary depending on the amount of active Pals.	https://www.youtube.com/watch?v=1fpGg9wNM9A	/uploads/optimized/1792003810421-481149867.webp,/uploads/optimized/1792003810900-340620264.webp,/uploads/optimized/1792003811280-503055415.webp,/uploads/optimized/1792003813062-326935638.webp,/uploads/optimized/1792003813363-712999370.webp,/uploads/optimized/1792003813600-397635758.webp	/badges/STEAM.png		f	23	2026-10-10 16:19:17.067	2026-10-17 10:47:59.985	1200	100	palworld	f	\N	\N	t
238b2f46-ff26-4bc9-b3c6-0de106bbb187	Euro Truck Simulator 2	SCS Software	0	Simulator	149	0	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0pE-02Xrir2TP7Izg7nYH71fLFusRbGtdXWxV3v0ob9N0o0_bHm43HN4&s=10	2013-12-31	PC (Microsoft Windows)	f	f	f	\N	\N	7	\N	OS: Windows 10 64-bit\nPROCESSOR: Intel Core i5-6400 or AMD Ryzen 3 1200 or similar\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 660 or AMD Radeon RX 460 or Intel HD 630 (2GB VRAM)\nHARD DRIVE: 25 GB available space (Euro Truck Simulator 2 base game)	OS: Windows 10 64-bit\nPROCESSOR: Intel Core i5-9600 or AMD Ryzen 5 3600 or similar\nMEMORY: 12 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 1660 or AMD Radeon RX 590 (2GB VRAM)\nHARD DRIVE: 25 GB available space (Euro Truck Simulator 2 base game)	https://youtu.be/5uvwfskYwl0?si=a2YeU36U4B5mwbfs	\N	/badges/STEAM.png	227300	t	71	2026-09-25 07:37:25.506	2026-10-17 11:21:15.695	\N	\N	\N	f	\N	\N	t
964cf478-9f8e-437f-93a8-9550c54db149	Forza Horizon 5 [Offline]	Playground Games	0	Racing, Sport	199	0	/uploads/optimized/1792004053784-934551435.webp	2021-11-05	Xbox Series X|S, PC (Microsoft Windows),  Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows 10 version 18362.0 or higher\nPROCESSOR: Intel i5-4460 or AMD Ryzen 3 1200\nMEMORY: 8 GB RAM\nGRAPHICS: NVidia GTX 970, AMD RX 470, OR Intel Arc A380\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 110 GB available space	Requires a 64-bit processor and operating system\nOS: Windows 10 version 18362.0 or higher\nPROCESSOR: Intel i5-8400 or AMD Ryzen 5 1500X\nMEMORY: 16 GB RAM\nGRAPHICS: NVidia GTX 1070, AMD RX 590, OR Intel Arc A750\nDIRECTX: Version 12\nNETWORK: Broadband Internet connection\nSTORAGE: 110 GB available space	https://youtu.be/YY2GX_7wR7Y?si=f31lZofpxXWhTNEa	/uploads/optimized/1792004054083-764443686.webp,/uploads/optimized/1792004054444-327260579.webp,/uploads/optimized/1792004056611-212083141.webp,/uploads/optimized/1792004057377-369181008.webp,https://images.wallpapersden.com/image/download/forza-horizon-5-hd-gaming_bW5pbWaUmZqaraWkpJRmbmdlrWZlbWU.jpg,/uploads/optimized/1792004058150-679197522.webp,/uploads/optimized/1792004058751-624889424.webp,/uploads/optimized/1792004061554-370219155.webp,/uploads/optimized/1792004062263-225809728.webp,/uploads/optimized/1792004062505-793307981.webp,/uploads/optimized/1792004063986-323244527.webp	/badges/STEAM.png	1551360	f	50	2026-09-25 07:37:25.474	2026-10-17 10:48:00.007	3499	\N	forza-horizon-5	f	\N	\N	t
08611cd7-608f-4f6c-98ac-620aeed98dcd	Assassin's Creed® Rogue	Ubisoft Sofia	3.6	Role-playing (RPG), Adventure	0	0	/uploads/optimized/1791994850453-547294965.webp	2014-11-11	PlayStation 3, PC (Microsoft Windows), Xbox 360, Nintendo Switch	f	f	f		\N	7		OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core 2 Quad Q6600 @ 2.4 GHz or AMD Athlon II X4 620 @ 2.6 GHz\nMemory: 2 GB RAM\nGraphics: Nvidia GeForce GTS 450 or AMD Radeon HD 5670 (1024MB VRAM) or Intel HD 4600\nDirectX: Version 11\nStorage: 12 GB available space	OS: Windows 10 (64-bit versions only)\nProcessor: Intel Core i5 2400s @ 2.5 GHz or better / AMD FX-6100 @ 3.3 GHz or better\nMemory: 4 GB RAM\nGraphics: Nvidia GeForce GTX 560Ti (1024 VRAM) or better / AMD Radeon HD 6870 (1024 VRAM) or better\nDirectX: Version 11\nStorage: 12 GB available space	https://www.youtube.com/watch?v=s6r_ipL0tak		/badges/STEAM.png		f	63	2026-10-14 16:20:50.823	2026-10-17 10:48:00.022	999	150	assassins-creed-rogue	f	\N	\N	f
6bfb12c6-4277-477e-93cd-177c0108cdbb	Mortal Kombat 11 [Offline]	NetherRealm Studios	3.5	Fighting	249	0	https://upload.wikimedia.org/wikipedia/en/7/7e/Mortal_Kombat_11_cover_art.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original	2020-05-26	Google Stadia, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One, Nintendo Switch	f	f	f	\N	\N	7		OS *: 64-bit Windows 7 / Windows 10\nProcessor: Intel Core i5-750, 2.66 GHz / AMD Phenom II X4 965, 3.4 GHz or AMD Ryzen™ 3 1200, 3.1 GHz\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce™ GTX 670 or NVIDIA® GeForce™ GTX 1050 / AMD® Radeon™ HD 7950 or AMD® Radeon™ R9 270\nDirectX: Version 11	OS *: 64-bit Windows 7 / Windows 10\nProcessor: Intel Core i5-2300, 2.8 GHz / AMD FX-6300, 3.5GHz or AMD Ryzen™ 5 1400, 3.2 GHz\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce™ GTX 780 or NVIDIA® GeForce™ GTX 1060-6GB / AMD® Radeon™ R9 290 or RX 570\nDirectX: Version 11	https://www.youtube.com/watch?v=7zwQPJmg-Kg		/badges/STEAM.png		t	38	2026-09-26 05:13:14.906	2026-10-17 10:52:35.335	2699	\N	mortal-kombat-11	f	\N	\N	t
6fadd839-4276-4e3f-b740-d1b21570112a	Legendary Bundle	Steam	0	Bundle	1499	0	/uploads/optimized/1790769140105-401921366.webp	2026-09-25	Windows	f	f	f	\N	\N	7					/uploads/optimized/1790769166685-134197749.webp	/badges/STEAM.png		f	75	2026-09-25 07:58:02.672	2026-10-17 10:48:00.039	49963	\N	legendary-bundle	t	Resident Evil Requiem, Black Myth: Wukong, Mortal Kombat 11, Marvel’s Spider-Man Remastered, Ghost of Tsushima DIRECTOR'S CUT, God Of War Ragnarok, Resident Evil 2, Resident Evil 3, Resident Evil 4, Resident Evil 7 Biohazard, Resident Evil Village, UNCHARTED: Legacy of Thieves, Cyberpunk 2077, Titanfall® 2, Car Mechanic Simulator 2018, Forza Horizon 4, Detroit: Become Human, Devil May Cry 5, Horizon Zero Dawn™ Remastered	Titanfall® 2, Car Mechanic Simulator 2018, Devil May Cry 5, Forza Horizon 4, Ghost of Tsushima DIRECTOR'S CUT, Horizon Zero Dawn™ Remastered, Marvel’s Spider-Man Remastered, Mortal Kombat 11, Resident Evil Village, Resident Evil Requiem, Resident Evil 7 Biohazard, Resident Evil 3, Resident Evil 2, Resident Evil 4, Black Myth: Wukong, Cyberpunk 2077, God Of War Ragnarok, UNCHARTED: Legacy of Thieves, Detroit: Become Human	t
0fd132a5-7c81-4a51-83a2-e242f9fcc3f4	Dying Light 2: Reloaded Edition	Techland	0	Shooter, Role-playing (RPG)	259	0	https://images.igdb.com/igdb/image/upload/t_1080p/co92fq.jpg	2024-02-22	Xbox Series X|S, PlayStation 4, PC (Microsoft Windows), PlayStation 5, Xbox One	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: Windows® 10\nPROCESSOR: Intel Core i3-9100 / AMD Ryzen 3 2300X\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA® GeForce® GTX 1050 Ti / AMD Radeon™ RX 560 (4GB VRAM)\nSTORAGE: 60 GB available space	Requires a 64-bit processor and operating system\nOS: Windows® 10\nPROCESSOR: AMD / Intel CPU running at 3.6 GHz or higher: AMD Ryzen 5 3600X or Intel i5-8600K or newer\nMEMORY: 16 GB RAM\nGRAPHICS: NVIDIA® GeForce RTX™ 2060 6GB or AMD RX Vega 56 8GB or newer\nSTORAGE: 60 GB available space	https://youtu.be/njAOpATG46E?si=k7YOYUf8NqFpAJ9n	https://xboxwire.thesourcemediaassets.com/sites/2/2024/02/Dying-Light-Hero-a274926f1a636f32e041-1024x576.jpg,https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/ss_fe9a52a60f4739a44cbd8b0c0856033ea6996624.jpg,https://cdn.mos.cms.futurecdn.net/DguKPv2KcLQEmKPLhrw3vd.jpg,https://cdn.mos.cms.futurecdn.net/V2XRzXCXdmJ742a6MdBznA.jpg,https://imgproxy.eneba.games/HIi59RmwgKqCeHMoKAcReuy0pvwF0w8wZkerfcHPw4c/rs:fit:1920/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy96/RkNtYlNZVDlhMzRs/S2dlX0Q1dWl2ZEJD/b3lkWUNJU2JXY2FY/WGc5UC1BLmpwZWc,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMF2hgoybBztEb6h3ZcSwHqnZW4yL2-DglsIzn1awP_z6kJYSUQ9LivKQ&s=10,https://i.redd.it/the-game-looks-breathtaking-after-disabling-the-cluttered-v0-fwzr1dqsz6g81.jpg?width=2560&format=pjpg&auto=webp&s=4736904b2577123ed2082b2689e67dbbf94d73bf,https://i.redd.it/the-game-looks-breathtaking-after-disabling-the-cluttered-v0-l1qcac4tz6g81.jpg?width=2560&format=pjpg&auto=webp&s=affb7ce071aad973dc8b9caf0a054bc7654b5f9d,https://cdn.mos.cms.futurecdn.net/J7QJ9yZxuszn2DC2RSHreL-1200-80.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHZEEMDCUygOZgzThaF42pq570wXdpmrrsh6ZI_a8c8Mn0U-DC6p-7WFJT&s=10,https://images.hothardware.com/contentimages/article/3186/content/small_inventory-dyinglight2.jpg,https://cdn2.unrealengine.com/dying-light-2-stay-human-out-now-co-op-1920x1080-165762b78616.jpg,https://i.redd.it/9mk00bpb8f791.jpg	/badges/STEAM.png	534380	t	47	2026-09-25 07:37:25.513	2026-10-17 11:21:38.52	2999	\N	dying-light-2-reloaded-edition	f	\N	\N	t
5b64bbfb-e89f-4ddc-b48e-c0956afa3e1b	Cyberpunk 2077	CD Projekt RED	4.6	Shooter, Role-playing (RPG), Adventure	179	0	https://images.igdb.com/igdb/image/upload/t_1080p/co7iy1.jpg	2023-09-26	Xbox Series X|S, Nintendo Switch 2, PC (Microsoft Windows), PlayStation 5, Mac	f	f	f	\N	\N	7		Requires a 64-bit processor and operating system\nOS: 64-bit Windows 10\nPROCESSOR: Core i7-6700 or Ryzen 5 1600\nMEMORY: 12 GB RAM\nGRAPHICS: GeForce GTX 1060 6GB or Radeon RX 580 8GB or Arc A380\nDIRECTX: Version 12\nSTORAGE: 70 GB available space	Requires a 64-bit processor and operating system\nOS: 64-bit Windows 10\nPROCESSOR: Core i7-12700 or Ryzen 7 7800X3D\nMEMORY: 16 GB RAM\nGRAPHICS: GeForce RTX 2060 SUPER or Radeon RX 5700 XT or Arc A770\nDIRECTX: Version 12\nSTORAGE: 70 GB available space\nADDITIONAL NOTES: SSD required.	https://youtu.be/8X2kIfS6fb8?si=GeHCoMMi2wX0Wfpy	https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077_CDPROJEKTRED_S1_03_2560x1440-359e77d3cd0a40aebf3bbc130d14c5c7,https://www.cyberpunk.net/build/images/social-thumbnail-en-ddcf4d23.jpg,https://cdn.mos.cms.futurecdn.net/YZovPjNUcPQPFzVsNpQqdQ.jpg,https://i.extremetech.com/imagery/content-types/02NA51AaZUZ570NIxAe70ux/hero-image.fit_lim.v1678673455.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMVpbq09pyhY5G6DhrugY8kDqS5I-w96vTYMwnabm_tlnJsHnw9yXGD7cQ&s=10,https://i0.wp.com/waytoomany.games/wp-content/uploads/2022/02/Cyberpunk-2077_20220216225610.jpg?ssl=1,https://i0.wp.com/waytoomany.games/wp-content/uploads/2022/02/Cyberpunk-2077_20220216225434.jpg?ssl=1,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ56gdbc3nDBrg8Gk1-0n3XSmVgwMTKzAoykc_g39Y_7TH2WjWmTY11HZw&s=10,https://cdn.mos.cms.futurecdn.net/dU6v9LeMk4J6sWA4yQbRFe.jpg,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkDBVpDYsOmFwgQoqVosIj-RTIm9zBrVomhs8stOeUdw&s=10	/badges/STEAM.png	1091500	t	53	2026-09-25 07:37:25.54	2026-10-17 11:21:45.665	2999	\N	cyberpunk-2077	f	\N	\N	t
\.


--
-- Data for Name: GameReaction; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."GameReaction" (id, "userId", "gameId", type, "createdAt", "updatedAt") FROM stdin;
b4fff69d-7308-44fa-890d-dd1ebe9771ff	29291cad-111a-4ed6-ab50-56339213891b	6fadd839-4276-4e3f-b740-d1b21570112a	LIKE	2026-09-26 20:02:55.275	2026-09-26 20:02:55.275
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Order" (id, "userId", status, "totalAmount", "couponCode", "couponDiscount", "commissionEarned", purpose, "submittedUtr", "paymentMethod", "expiresAt", "createdAt", "updatedAt") FROM stdin;
VP3549AABD	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	2	\N	\N	\N	\N	\N	DELTA_PAY	2026-09-25 10:56:50.194	2026-09-25 09:56:50.212	2026-09-25 09:58:02.794
VP33463E54	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	2	\N	\N	\N	\N	739490999742	DELTA_PAY	2026-09-25 11:04:43.237	2026-09-25 10:04:43.238	2026-09-25 10:08:45.919
VP6428EC5E	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	3	\N	\N	\N	\N	869937082294	DELTA_PAY	2026-09-25 11:26:07.859	2026-09-25 10:26:07.881	2026-09-25 10:27:11.54
VPFFE406D7	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	1499	\N	\N	\N	\N	\N	DELTA_PAY	2026-09-26 07:31:12.792	2026-09-26 06:31:12.813	2026-09-26 06:31:20.416
VPE99CF974	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	2	\N	\N	\N	\N	645941286234	DELTA_PAY	2026-09-26 11:07:42.378	2026-09-26 10:07:42.38	2026-09-26 10:08:05.896
VPAA5729DC	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	2	\N	\N	\N	\N	515656194843	DELTA_PAY	2026-10-02 09:09:59.744	2026-10-02 08:09:59.759	2026-10-02 08:18:42.539
VPBE8FF0A5	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	5	\N	\N	\N	\N	204374160843	DELTA_PAY	2026-10-02 09:25:47.053	2026-10-02 08:25:47.054	2026-10-02 08:43:25.927
VP3B188A05	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	1	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-02 09:44:08.85	2026-10-02 08:44:08.864	2026-10-02 08:44:24.099
VP3103DDC5	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	1	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-02 09:44:33.692	2026-10-02 08:44:33.693	2026-10-02 08:44:37.255
VP6EDFA361	29291cad-111a-4ed6-ab50-56339213891b	COMPLETED	5	\N	\N	\N	\N	204374160843	DELTA_PAY	2026-10-02 09:44:55.034	2026-10-02 08:44:55.036	2026-10-02 08:45:11.939
VPC3790879	89c82d40-be7d-46fc-9219-9075ed9c688b	PENDING	5	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-02 09:50:01.408	2026-10-02 08:50:01.427	2026-10-02 08:50:01.427
VP353FB1C6	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	359	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-02 09:54:56.793	2026-10-02 08:54:56.794	2026-10-02 08:55:10.262
VPEB0EBACC	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	249	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-02 10:00:44.369	2026-10-02 09:00:44.37	2026-10-02 09:51:42.946
VP8C4B58C2	29291cad-111a-4ed6-ab50-56339213891b	CANCELLED	99	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-07 16:38:06.569	2026-10-07 15:38:06.572	2026-10-07 15:39:05.867
VP4893CFEA	0dc9011e-989e-4eac-aad0-708c7bc42eec	COMPLETED	299	\N	\N	\N	\N	131188193281	DELTA_PAY	2026-10-12 18:15:35.306	2026-10-12 17:15:35.322	2026-10-12 17:19:51.816
VPB451A49E	fc3445e0-e429-4982-99b8-d4eedac236e5	COMPLETED	99	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-12 21:16:02.04	2026-10-12 20:16:02.042	2026-10-12 20:58:56.207
VP61463AB6	2f242e28-7af9-403a-bcd4-304b4f020802	CANCELLED	250	VALQORE50	49	\N	\N	\N	DELTA_PAY	2026-10-13 10:19:08.655	2026-10-13 09:19:08.66	2026-10-13 09:24:09.061
VP9552033A	2f242e28-7af9-403a-bcd4-304b4f020802	COMPLETED	250	BLACK49	49	\N	\N	209232986564	DELTA_PAY	2026-10-13 10:36:50.558	2026-10-13 09:36:50.56	2026-10-13 09:39:41.252
VP6ECF455A	a858ec6c-0d15-4580-a515-bd63baf3712e	PENDING	249	\N	\N	\N	\N	\N	DELTA_PAY	2026-10-13 18:21:36.226	2026-10-13 17:21:36.228	2026-10-13 17:21:36.228
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."OrderItem" (id, "orderId", "gameId", "pricePaid", "createdAt") FROM stdin;
391ac15e-2947-45af-b4be-470077eb2ebf	VPFFE406D7	6fadd839-4276-4e3f-b740-d1b21570112a	1499	2026-09-26 06:31:12.813
c08dfc85-16d8-4879-8531-87b4b5338ef6	VP353FB1C6	90ccb66e-58dc-4b0f-ad35-3bf325993f8a	359	2026-10-02 08:54:56.794
4a6315b6-881a-47db-ab16-9dcfa3eeecb4	VPEB0EBACC	e90570d2-c6cd-46ae-b72d-96dc5a0d81ac	249	2026-10-02 09:00:44.37
333ffb67-d3a5-49a2-baa2-45ef91dc944f	VP8C4B58C2	2a0f7b09-f4f3-4c8e-b436-529b32712965	99	2026-10-07 15:38:06.572
dbbdcaec-24c6-4cf0-bffc-628ff6a8a912	VP4893CFEA	ffd0e6a3-0c60-4030-adca-c4c52f974760	299	2026-10-12 17:15:35.322
9cae6288-cd0a-41db-adcb-31ba2125f586	VPB451A49E	2a0f7b09-f4f3-4c8e-b436-529b32712965	99	2026-10-12 20:16:02.042
44e4efc5-c715-423b-a7df-d979c3116a62	VP61463AB6	ffd0e6a3-0c60-4030-adca-c4c52f974760	299	2026-10-13 09:19:08.66
f1fdc16e-6dfa-4ec9-b91d-365831b21cae	VP9552033A	ffd0e6a3-0c60-4030-adca-c4c52f974760	299	2026-10-13 09:36:50.56
3782138b-d5a5-4e08-8106-582bdeb4ac7c	VP6ECF455A	8bb13baa-0a39-4737-9f8c-a8af6701d438	249	2026-10-13 17:21:36.228
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
42711efc-4d9c-4149-a865-d27c39956579	1a0dd2f9d92bb79b	PROCESSED	2026-09-26 10:08:05.911
ffb15c42-1b84-4bfd-a781-1314779ff5bc	1a0fbaa0ee1c42e1	PROCESSED	2026-10-02 08:10:25.883
40ba764e-ecb4-487b-9c5f-6cf3675b56d9	1a0fbb86b5051410	PROCESSED	2026-10-02 08:26:05.864
4d2637f0-f3a2-4edf-bb37-63cbd3784e8a	1a0fbc19bf0bbd35	PROCESSED	2026-10-02 08:36:11.145
b7646193-451f-4ef4-aed7-1a5f1eef9990	1a106039e4423d02	PROCESSED	2026-10-04 08:24:30.874
e6f9bbe6-bdd9-4cbe-bcd2-95f743414e6e	1a125f4b0e8609ef	PROCESSED	2026-10-10 13:16:00.896
9d0917a5-45e4-432d-86bc-65c1f2c2cd57	1a12a12b448ec486	PROCESSED	2026-10-11 08:27:15.846
2eb71ace-458b-4fdb-89c0-81a4c96c004b	1a12a139eb5fa8d5	PROCESSED	2026-10-11 08:28:15.855
9ca438bd-7625-4de1-86fa-bd0bf588270a	1a1311f1a3fc6ff5	PROCESSED	2026-10-12 17:18:10.871
3d808c55-5127-49e8-a1f4-4ce52ff2b55a	1a131750979fe55f	PROCESSED	2026-10-12 18:52:00.839
df56d0f4-9017-48cc-a614-540de4a4f426	1a131c3618ca5d5f	PROCESSED	2026-10-12 20:17:35.886
c5aa785b-e3ce-4343-a2ad-3bc160987f56	1a134a0d893c926d	PROCESSED	2026-10-13 09:38:45.876
\.


--
-- Data for Name: Poster; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Poster" (id, "imageUrl", "isActive", "createdAt") FROM stdin;
58e66460-8873-4bfa-a2b5-7f04dab76a5d	https://m.media-amazon.com/images/I/71ACwyYY3KL.jpg	t	2026-09-25 08:05:54.905
26e98604-5434-4803-b5e2-1048a50a34ee	https://m.media-amazon.com/images/M/MV5BODU1YzNiODEtMjg1OS00NDBlLWI5ODQtMmRlNDQzOWM1ODFhXkEyXkFqcGc@._V1_.jpg	t	2026-10-10 21:07:11.115
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: valqore_app
--

COPY public."Transaction" (id, utr, amount, "transactionId", sender, date, "orderId", "createdAt") FROM stdin;
e17ff805-d565-470f-984c-d70365c9cf3c	254633548299	2	FMPIB6667929651	LAKSHMI PAUL	03:27 PM IST, 25 September 2026	\N	2026-09-25 10:08:11.506
417cb26a-8516-4e9a-8e75-916c4acffa31	739490999742	2	FMPIB6667997417	LAKSHMI PAUL	03:38 PM IST, 25 September 2026	VP33463E54	2026-09-25 10:08:45.896
ad261974-516b-4a80-8146-6ec87eff8bd3	869937082294	3	FMPIB6668110198	DANISH	03:57 PM IST, 25 September 2026	VP6428EC5E	2026-09-25 10:27:11.533
f3873c07-22b7-47a5-8ba5-1f11a6b06254	645941286234	2	FMPIB6674148339	LAKSHMI PAUL	03:37 PM IST, 26 September 2026	VPE99CF974	2026-09-26 10:08:05.888
240fa981-71b3-4318-b873-941dda465055	515656194843	2	FMPIB6711418283	LAKSHMI PAUL	01:40 PM IST, 02 October 2026	VPAA5729DC	2026-10-02 08:10:25.879
721919da-a441-439f-9f00-fc931b0be611	627562725052	2	FMPIB6711582076	MD ZISHAN  MANDAL	02:06 PM IST, 02 October 2026	\N	2026-10-02 08:36:11.142
e9643d34-5390-4578-9491-024f0add335f	204374160843	5	FMPIB6711518052	LAKSHMI PAUL	01:56 PM IST, 02 October 2026	VP6EDFA361	2026-10-02 08:26:05.86
435b41e2-ba8e-4716-8285-6a080b7fd0d5	627758377222	118	FMPU01a10603	Fam.	01:54 PM IST, 04 October 2026	\N	2026-10-04 08:24:30.868
2da0510f-cb6c-4038-987f-1929928201ed	903922453331	20	FMPIB6764562547	LAKSHMI PAUL	06:45 PM IST, 10 October 2026	\N	2026-10-10 13:16:00.888
c8761c0d-17ac-4dd7-9849-eef8eae5bde8	569603966932	20	FMPIB6769388812	LAKSHMI PAUL	01:57 PM IST, 11 October 2026	\N	2026-10-11 08:27:15.842
c87f5fc8-3a00-4931-a770-614f14abb8e9	665016298574	212.4	FMPU01a12a13	Fam.	01:58 PM IST, 11 October 2026	\N	2026-10-11 08:28:15.852
6b7956d2-8985-4a6f-8ba1-98677361f27f	131188193281	299	FMPIB6779615412	ANURAG BHARADWAJ	10:48 PM IST, 12 October 2026	VP4893CFEA	2026-10-12 17:18:10.868
0101cd30-69de-436a-8658-ca3c9b7751da	209232986564	250	FMPIB6782819976	RAZIYA SULTHANA M	03:08 PM IST, 13 October 2026	VP9552033A	2026-10-13 09:38:45.873
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
c7720c7b-59fb-4383-82eb-509921437299	minecraft	minecraftbc015@gmail.com	$2b$10$KCgO.PMj3bxYzB6N3FCTCO7PYOJvWHKaUvaWtOmLpH13UcisBq46G	\N	\N	2026-10-02 08:10:00.812
f59be903-24b2-42e7-93ca-54640415a7a7	krishnachavan	kishuchauhan004@gmail.com	$2b$10$ym3vrEETpErEs1VEYvlLXuE20pSpwS2lh9y.oAaGF0YVQIuT/XnPa	\N	\N	2026-10-09 08:53:32.279
7747ba54-dfcb-4c64-a80e-e8cfee07bbf5	saikatkar	saikatkar383@gmail.com	$2b$10$/3emkvJcqcyi/.EH8iTFbenpR3xtMwe0L0L5JeKeXbjszJ/uYsI7G	\N	\N	2026-10-12 09:53:37.563
0dc9011e-989e-4eac-aad0-708c7bc42eec	ladjabhidja	ladjabhidja@gmail.com	$2b$10$8CGNf7p9Jm8vYpnA9colo.H2cPcuI8k7erw07Lv7dDn7AjagNO9te	\N	\N	2026-10-12 17:14:20.855
fc3445e0-e429-4982-99b8-d4eedac236e5	virenthakur	virenthakur655@gmail.com	$2b$10$YdBLlCutACA1DNdL6im2BOSGD.C9Ao8WeQWWyJEIFE.fsYtjZhQmy	\N	\N	2026-10-12 20:15:41.594
e2da6ab8-eb16-434a-923d-187e5ecfcb8d	captaingamer	captaingamer200@gmail.com	$2b$10$t8TcNQxklHjU4GlWWBwpP.jaPmKSzjwUp0cvlTiQO2aNwl3ltuNQm	\N	\N	2026-10-13 06:35:34.33
2f242e28-7af9-403a-bcd4-304b4f020802	zyphrengaming	tufgamer1232@gmail.com	$2b$10$GBjvmvdmthKdlNzLKw8r.uV8BshAqfX7R8OE3WuPNrvYtTa0e/UV2	\N	\N	2026-10-13 09:18:47.542
ba194f65-31d7-408d-8c0c-027637ae4345	raziyasultanam	rs1913150@gmail.com	$2b$10$0S206TDZhHkYWZ5KPe8OOOQ9J3jlIshMc0.c0d6pWm77YteLD2fjW	\N	\N	2026-10-13 09:21:06.93
a858ec6c-0d15-4580-a515-bd63baf3712e	veeradityavijay	veeradityavijaywar@gmail.com	$2b$10$dIbpvMZQ3TW2M4JRWH2m9OD6hRZL6EaLXseesf.TmLE.6x5HRQWea	\N	\N	2026-10-13 17:21:23.22
d7ff18c4-b9b7-474f-a0d1-f7717262674a	yashpal	ypal4663@gmail.com	$2b$10$0mNu.dbwexqBIncQ/ywJ9.cH8oPnZheCo37EAM1Dbft1XKaV702qK	\N	\N	2026-10-14 07:22:27.726
968deecd-a8a5-4ded-8b22-ae66e2a64bb7	deev	deev5783@gmail.com	$2b$10$BgSd3TxUGwP8mTIeZ0xrXuLNiuTJLEkt6U8.4uKDO8aQHQ95kW7UW	\N	\N	2026-10-14 16:38:09.509
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

\unrestrict pe34IMAiwTA0fuhtul1JYrhTu0VIHvWGGIE71HiDWlfXNQlu6sdqOQNeBPg0Qsf

