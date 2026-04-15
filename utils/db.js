import "server-only";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.NEXT_PUBLIC_DRIZZLE_URL;

if (!connectionString) {
	throw new Error('Missing database URL. Set NEXT_PUBLIC_DRIZZLE_URL in environment');
}

const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema });
