import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// For deployment, SQLite will be stored in /app/data/berutu.db
// For local development, it will be stored in ./data/berutu.db
const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'data', 'berutu.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
