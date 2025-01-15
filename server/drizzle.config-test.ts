import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'fs';

//Configuration for the Drizzle
export default defineConfig({
	dialect: 'postgresql',
	schema: './database/schema.ts',
	out: './database/migrations',
	verbose: true,
	dbCredentials: {
		url: 'postgresql://postgres:postgres@localhost:5438/postgres',
	},
});
