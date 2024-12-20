import { readFile } from "fs/promises";
import sqlite3, { Database } from "sqlite3";
import dotenv from "dotenv";
import { readFileSync } from "fs";

const databasePath: string = __dirname + "/database.sqlite";
const schemaPath: string = __dirname + "/schema.sql";

//Enables verbose output of the database.
sqlite3.verbose();

//Loads the environment variables.
dotenv.config();

//Initializes the admin values.
const adminPassword: string = process.env.ADMIN_PASSWORD || "";
const adminUsername: string = process.env.ADMIN_USERNAME || "";
const adminEmail: string = process.env.ADMIN_EMAIL || "";

//Runs the code.
const db : boolean = databaseCreator();
  if (db) {
    console.log("Database initialized successfully.");
  } else {
    console.error("Database initialization failed.");
  }

/**
 * Creates the database connection and forms an object that can be used to interact with the database.
 * Also initializes the database schema if it doesn't exist.
 */

function databaseCreator(): boolean {
  const db: Database = new Database(databasePath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: Error | null) => {
      if (err && "code" in err && err.code === "SQLITE_CANTOPEN") {
        schemaLoader(db);
        //Populate with starting values.
        initialValues(db);
        db.close();
        return true;
      } else if (err) {
        console.error(`Getting error ${err}. Unable to open database`);
        db.close();
        return false;
      }
    }
  );
  return true;
}


/**
 * Function to return a connection object to the database.
 *
 * @returns {Database} - The database connection object.
 */

export default function connectionGenerator(): Database {
  const db: Database = new Database(databasePath,
    sqlite3.OPEN_READWRITE,
    (err: Error | null) => {
      if (err) {
        console.error(`Getting error ${err}. Unable to open database.`);
      }
    }
  );
  return db;
}

/**
 * Function to load the schema into the database.
 *
 * @returns {void}
 */

function schemaLoader(db: Database): void {
  try{
    const schema : string = readFileSync(schemaPath, "utf-8");
    db.serialize(() => {
      db.exec("PRAGMA foreign_keys = ON;");
      db.exec(schema);
    });
  } catch (error) {
    console.error(`Error starting the schema of the database: ${error}`);
  } finally {
    db.close();
  }
}

/**
 * Function to populate the database with some initial values.
 *
 * @returns {void}
 */
 
function initialValues(db: Database): void {
  //Starts the initial values for the roles.
  try {
    const sql: string = `
      INSERT INTO roles (role_name, description) VALUES (?, ?);
      INSERT INTO roles (role_name, description) VALUES (?, ?);`;
    db.run(sql, [
      "admin", "Administrator with full access",
      "user", "Regular user with basic access"
    ]);
  } catch (error) {
    console.error(`Error populating the database with initial values. Error is: ${error}`);
  } finally {
    db.close();
  }

  //Starts the initial values for the admin user (Me).
  try {
    const sql: string = "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)";
    db.run(sql, [adminUsername, adminPassword, adminEmail, "admin"]);
  } catch (error) {
    console.error(`Error populating the database with initial values. Error is: ${error}`);
  }
}

