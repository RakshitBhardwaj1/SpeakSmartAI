import { config } from 'dotenv';

config({ path: '.env.local' });

/** @type {import('drizzle-kit').Config} */

export default({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL,
  },
});
