import { readFile } from "fs/promises";
import sqlite3, { Database } from "better-sqlite3";
import dotenv from "dotenv";
import { readFileSync } from "fs";

export const databasePath: string = __dirname + "/database.sqlite";
const schemaPath: string = __dirname + "/schema.sql";

//Loads the environment variables.
dotenv.config();

//Initializes the admin values.
const adminPassword: string = process.env.ADMIN_PASSWORD || "";
const adminUsername: string = process.env.ADMIN_USERNAME || "";
const adminEmail: string = process.env.ADMIN_EMAIL || "";

//Options for the Database Creator
const dbOptions = {
  fileMustExist: false,
  verbose: console.log,
  readonly: false,
};

//Options for the Database Connection
const dbConnectionOptions = {
  fileMustExist: true,
  verbose: console.log,
  readonly: false,
};

//Runs the code.
const db: boolean = databaseCreator(databasePath);
if (db) {
  console.log("Database initialized successfully.");
} else {
  console.error("Database initialization failed.");
}

/**
 * Creates the database file to be used by the server.
 * It also loads the schema and populates the database with the initial values.
 */

export function databaseCreator(databasePath: string): boolean {
  try {
    const db: Database = new sqlite3(databasePath, dbOptions);
    schemaLoader(db);
    initialValues(db);
    return true;
  } catch (error) {
    console.error(`Error creating database: ${error}`);
    return false;
  }
}

/**
 * Function to return a connection object for the database.
 *
 * @returns {Database} - The database connection object.
 */

export default function connectionGenerator(databasePath: string): Database {
  return new sqlite3(databasePath, dbConnectionOptions);
}

/**
 * Function to load the schema into the database.
 *
 * @returns {void}
 */

export function schemaLoader(db: Database): void {
  try {
    const schema: string = readFileSync(schemaPath, "utf-8");

    //Enables foreign key constraints.
    db.pragma("foreign_keys = ON");

    //Loads the schema into the database.
    db.exec(schema);
  } catch (error) {
    console.error(`Error starting the schema of the database: ${error}`);
  }
}

/**
 * Function to populate the database with some initial values.
 * It adds the admin user and all of the roles into the database.
 *
 * @returns {void}
 */

export function initialValues(db: Database): void {
  try {
    db.transaction(() => {
      // First insert roles
      db.prepare(
        "INSERT OR IGNORE INTO roles (role_name, description) VALUES (?, ?)"
      ).run("admin", "Admin role with full access");

      db.prepare(
        "INSERT OR IGNORE INTO roles (role_name, description) VALUES (?, ?)"
      ).run("user", "Standard user role with limited access");

      // Then insert admin user
      db.prepare(
        "INSERT OR IGNORE INTO users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)"
      ).run(adminUsername, adminEmail, adminPassword, "admin", "Sebastian El Khoury");
    })();
  } catch (error) {
    console.error(`Error populating the database: ${error}`);
  }
}
