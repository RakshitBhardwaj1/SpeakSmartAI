import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString =
	process.env.DRIZZLE_DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL;

if (!connectionString) {
	throw new Error('Missing database URL. Set DRIZZLE_DATABASE_URL in .env.local');
}

const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema });
