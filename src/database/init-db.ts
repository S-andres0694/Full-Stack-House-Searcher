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
const db : boolean = databaseCreator(databasePath);
  if (db) {
    console.log("Database initialized successfully.");
  } else {
    console.error("Database initialization failed.");
  }

/**
 * Creates the database connection and forms an object that can be used to interact with the database.
 * Also initializes the database schema if it doesn't exist.
 */

export function databaseCreator(databasePath: string): boolean {
  const db: Database = new Database(databasePath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: Error | null) => {
      if (err && "code" in err && err.code === "SQLITE_CANTOPEN") {
        schemaLoader(db);
        //Populate with starting values.
        initialValues(db, () => {
          db.close();
        });
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
    
    //Enables foreign key constraints.
    db.exec("PRAGMA foreign_keys = ON;", (err : Error | null) => {
      if (err) throw err;
    });

    //Loads the schema into the database.
    db.run(schema, (err : Error | null) => {
      if (err) throw err;
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
 
function initialValues(db: Database, callback: () => void): void {
  db.serialize(() => {
    try {
      // Begin transaction
      db.run('BEGIN TRANSACTION');

      //Starts the initial values for the roles.
      const rolesSql: string = `
        INSERT INTO roles (role_name, description) VALUES (?, ?);
        INSERT INTO roles (role_name, description) VALUES (?, ?);`;
      
      db.run(rolesSql, [
        "admin", "Administrator with full access",
        "user", "Regular user with basic access"
      ], (err) => {
        if (err) throw err;
      });

      console.log("Roles inserted successfully.");

      //Starts the initial values for the admin user
      const userSql: string = "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)";
      db.run(userSql, [adminUsername, adminPassword, adminEmail, "admin"], (err) => {
        if (err) throw err;
      });

      console.log("Admin user inserted successfully.");

      // Commit transaction
      db.run('COMMIT', (err) => {
        if (err) throw err;
        callback();
      });

      console.log("Transaction committed successfully.");

    } catch (error) {
      // Rollback on error
      db.run('ROLLBACK', () => {
        console.error('Database initialization failed:', error);
        callback();
      });
    }
  });
}

