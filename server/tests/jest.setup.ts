import { existsSync, unlinkSync } from "fs";
import connectionGenerator, {
  databaseCreator,
  dbTestOptions,
  initialValues,
  resetDatabase,
  runMigrations,
} from "../database/init-db";
import { beforeAll, afterAll } from "@jest/globals";
import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

//Test database Path
export const testDbPath: string = __dirname + "/unit/test-database.sqlite";

beforeAll(async () => {
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
  //Create the test database
  await databaseCreator(testDbPath, dbTestOptions);
  //Create a connection to the test database
  const connection: Database = connectionGenerator(testDbPath, dbTestOptions);
  //Run the migrations
  runMigrations(drizzle(connection), __dirname + "/../database/migrations");
  //Populate the database with initial values
  await initialValues(connection);
});

afterAll(() => {
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
});
