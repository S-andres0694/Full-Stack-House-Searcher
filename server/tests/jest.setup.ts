import { existsSync, unlinkSync } from 'fs';
import connectionGenerator, {
	databaseCreator,
	initialValues,
	resetDatabase,
	runMigrations,
	testDatabaseConfiguration,
} from '../database/init-db.v2';
import { beforeAll, afterAll } from '@jest/globals';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

//Create a connection to the test database
const connection: NodePgDatabase<typeof schema> = connectionGenerator(
	testDatabaseConfiguration,
);

beforeAll(async () => {
	await resetDatabase(connection);
	//Run the migrations
	runMigrations(connection, __dirname + '/../database/migrations');
	//Populate the database with initial values
	await initialValues(connection);
});

afterAll(async () => {
	await resetDatabase(connection);
	//Run the migrations
	runMigrations(connection, __dirname + '/../database/migrations');
});
