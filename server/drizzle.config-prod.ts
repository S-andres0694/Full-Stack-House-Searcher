import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'fs';

//Configuration for the Drizzle
export default defineConfig({
	dialect: 'postgresql',
	schema: './database/schema.ts',
	out: './database/migrations',
	verbose: true,
	dbCredentials: {
		url: (process.env.DATABASE_URL as string) + '?sslmode=require',
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		host: process.env.DATABASE_HOST,
		port: Number(process.env.DATABASE_PORT),
		database: 'defaultdb',
		ssl: {
			rejectUnauthorized: true,
			ca: readFileSync(process.env.CERTIFICATE_PATH || '').toString(),
		},
	},
});
