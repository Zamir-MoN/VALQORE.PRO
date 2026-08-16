import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();

// FOR LOCAL DEVELOPMENT (SQLite):
// import { PrismaLibSql } from '@prisma/adapter-libsql';
// const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
// export const prisma = new PrismaClient({ adapter });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
