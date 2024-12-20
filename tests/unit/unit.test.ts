import { describe, it, expect } from "@jest/globals";
import connectionGenerator, { initialValues } from "../../src/database/init-db";
import { databaseCreator, schemaLoader } from "../../src/database/init-db";
import sqlite3, { Database } from "better-sqlite3";
import { existsSync, unlinkSync } from "fs";

let db: Database;

const testDbPath: string = __dirname + "/test-database.sqlite";

//Creates a test database and provides a connection to it.
beforeEach(() => {
  // Remove test database if it exists
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
  databaseCreator(testDbPath);
  db = connectionGenerator(testDbPath);
});

describe("Database Unit Tests", () => {
  //Test 1:
  it("should be able to connect to the database", () => {
    expect(db).toBeInstanceOf(sqlite3);
  });

  //Test 2:
  it("should be able to create a table", () => {
    db.prepare(
      "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)"
    ).run();
    expect(db.prepare("SELECT * FROM test").get()).toBe(undefined);
  });

  //Test 3:
  it("should be able to load the schema", () => {
    schemaLoader(db);
    expect(db.prepare("SELECT * FROM properties").get()).toBeUndefined();
    expect(db.prepare("SELECT * FROM viewed_properties").get()).toBeUndefined();
    expect(db.prepare("SELECT * FROM roles").get()).toBeUndefined();
    expect(db.prepare("SELECT * FROM favorites").get()).toBeUndefined();
    expect(db.prepare("SELECT * FROM users").get()).toBeUndefined();
  });

  //Test 4:
  it("should be able to insert a user", () => {
    schemaLoader(db);
    initialValues(db);

    db.prepare(
      "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)"
    ).run("testuser", "testpassword", "test@test.com", "admin");
    expect(
      db.prepare("SELECT * FROM users WHERE username = 'testuser'").get()
    ).toBeDefined();
  });

  //Test 5:
  it("should be able to insert a property", () => {
    schemaLoader(db);
    db.prepare(
      "INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      2,
      "123 Main St, Anytown, USA",
      "$1000",
      "123-456-7890",
      "This is a test property",
      "https://test.com"
    );
    expect(
      db
        .prepare(
          "SELECT * FROM properties WHERE address = '123 Main St, Anytown, USA'"
        )
        .get()
    ).toBeDefined();
  });

  //Test 6:
  it("should be able to insert a role", () => {
    schemaLoader(db);
    db.prepare("INSERT INTO roles (role_name, description) VALUES (?, ?)").run(
      "test",
      "This is a test role"
    );
    expect(
      db.prepare("SELECT * FROM roles WHERE role_name = 'test'").get()
    ).toBeDefined();
  });

  //Test 7:
  it("should be able to insert a viewed property", () => {
    schemaLoader(db);
    initialValues(db);
    
    // Then insert user
    db.prepare(
      "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)"
    ).run("testuser", "testpassword", "test@test.com", "user");

    // Then insert property
    db.prepare(
      "INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      3,
      "456 Oak Ave, Somewhere, USA",
      "$1500",
      "555-123-4567",
      "A test property for viewing",
      "https://example.com"
    );

    // Finally insert viewed property
    db.prepare(
      "INSERT INTO viewed_properties (user_id, property_id) VALUES (?, ?)"
    ).run(1, 1);
    
    expect(
      db
        .prepare(
          "SELECT * FROM viewed_properties WHERE user_id = 1 AND property_id = 1"
        )
        .get()
    ).toBeDefined();
  });

  //Test 8:
  it("should be able to insert a favorite property", () => {
    schemaLoader(db);
    initialValues(db);
    
    // Then insert user
    db.prepare(
      "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)"
    ).run("testuser", "testpassword", "test@test.com", "user");
    
    // Then insert property
    db.prepare(
      "INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      3,
      "456 Oak Ave, Somewhere, USA",
      "$1500",
      "555-123-4567",
      "A test property for viewing",
      "https://example.com"
    );
    
    // Finally insert favorite
    db.prepare(
      "INSERT INTO favorites (user_id, property_id) VALUES (?, ?)"
    ).run(1, 1);
    
    expect(
      db
        .prepare(
          "SELECT * FROM favorites WHERE user_id = 1 AND property_id = 1"
        )
        .get()
    ).toBeDefined();
  });

  //Test 9:
  it("should be able to insert initial values", () => {
    schemaLoader(db);
    initialValues(db);

    // Verify roles were created first
    const adminRole = db
      .prepare("SELECT * FROM roles WHERE role_name = ?")
      .get("admin");
    expect(adminRole).toBeDefined();
    
    const userRole = db
      .prepare("SELECT * FROM roles WHERE role_name = ?")
      .get("user");
    expect(userRole).toBeDefined();

    // Then verify admin user was created
    const adminUser = db
      .prepare("SELECT * FROM users WHERE role = ?")
      .get("admin");
    expect(adminUser).toBeDefined();
  });
});

afterAll(() => {
  // Close database connection after each test
  if (db) {
    db.close();
  }

  //Remove the test database
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
});
