import "server-only";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DRIZZLE_DATABASE_URL;

if (!connectionString) {
	throw new Error('Missing database URL. Set DRIZZLE_DATABASE_URL in server environment');
}

const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema });
