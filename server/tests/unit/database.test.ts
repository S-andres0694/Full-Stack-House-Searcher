import { describe, it, expect } from '@jest/globals';
import connectionGenerator, {
  dbTestOptions,
  initialValues,
  resetDatabase,
  runMigrations,
} from '../../database/init-db';
import sqlite3, { Database } from 'better-sqlite3';
import { testDbPath } from '../jest.setup';
import { drizzle } from 'drizzle-orm/better-sqlite3';

let db: Database;

//Creates a test database and provides a connection to it.
beforeAll(() => {
  db = connectionGenerator(testDbPath, dbTestOptions);
});

afterEach(async () => {
  await resetDatabase(db, dbTestOptions);
  await initialValues(db);
});

describe('Database Unit Tests', () => {
  //Test 1:
  it('should be able to connect to the database', () => {
    expect(db).toBeInstanceOf(sqlite3);
  });

  //Test 2:
  it('should be able to create a table', () => {
    db.prepare(
      'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)',
    ).run();
    expect(db.prepare('SELECT * FROM test').get()).toBe(undefined);
  });

  //Test 3:
  it('should be able to load the schema', () => {
    expect(db.prepare('SELECT * FROM properties').get()).toBeUndefined();
    expect(db.prepare('SELECT * FROM viewed_properties').get()).toBeUndefined();
    expect(db.prepare('SELECT * FROM roles').get()).toBeDefined();
    expect(db.prepare('SELECT * FROM favorites').get()).toBeUndefined();
    expect(db.prepare('SELECT * FROM users').get()).toBeDefined();
  });

  //Test 4:
  it('should be able to insert a user', () => {
    db.prepare(
      'INSERT INTO users (username, password, email, role, name) VALUES (?, ?, ?, ?, ?)',
    ).run('testuser', 'testpassword', 'test@test.com', 'admin', 'Anon User');
    expect(
      db.prepare("SELECT * FROM users WHERE username = 'testuser'").get(),
    ).toBeDefined();
  });

  //Test 5:
  it('should be able to insert a property', () => {
    db.prepare(
      'INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url, identifier) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(
      2,
      '123 Main St, Anytown, USA',
      '$1000',
      '123-456-7890',
      'This is a test property',
      'https://test.com',
      1234567890,
    );
    expect(
      db
        .prepare(
          "SELECT * FROM properties WHERE address = '123 Main St, Anytown, USA'",
        )
        .get(),
    ).toBeDefined();
  });

  //Test 6:
  it('should be able to insert a role', () => {
    db.prepare('INSERT INTO roles (role_name, description) VALUES (?, ?)').run(
      'test',
      'This is a test role',
    );
    expect(
      db.prepare("SELECT * FROM roles WHERE role_name = 'test'").get(),
    ).toBeDefined();
  });

  //Test 7:
  it('should be able to insert a viewed property', () => {
    // Insert user
    db.prepare(
      'INSERT INTO users (username, password, email, role, name) VALUES (?, ?, ?, ?, ?)',
    ).run('testuser', 'testpassword', 'test@test.com', 'user', 'Anon User');

    // Then insert property
    db.prepare(
      'INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url, identifier) VALUES (?,?, ?, ?, ?, ?, ?)',
    ).run(
      3,
      '456 Oak Ave, Somewhere, USA',
      '$1500',
      '555-123-4567',
      'A test property for viewing',
      'https://example.com',
      1234567890,
    );

    //Retrieve user id
    const userId = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get('testuser') as { id: number };

    //Retrieve property id
    const propertyId = db
      .prepare('SELECT id FROM properties WHERE address = ?')
      .get('456 Oak Ave, Somewhere, USA') as { id: number };

    // Finally insert viewed property
    db.prepare(
      'INSERT INTO viewed_properties (user_id, property_id) VALUES (?, ?)',
    ).run(userId.id, propertyId.id);

    expect(
      db
        .prepare(
          'SELECT * FROM viewed_properties WHERE user_id = ? AND property_id = ?',
        )
        .run(userId.id, propertyId.id),
    ).toBeDefined();
  });

  //Test 8:
  it('should be able to insert a favorite property', () => {
    // Insert user
    db.prepare(
      'INSERT INTO users (username, password, email, role, name) VALUES (?, ?, ?, ?, ?)',
    ).run('testuser', 'testpassword', 'test@test.com', 'user', 'Anon User');

    // Then insert property
    db.prepare(
      'INSERT INTO properties (bedrooms, address, monthly_rent, contact_phone, summary, url, identifier) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(
      3,
      '456 Oak Ave, Somewhere, USA',
      '$1500',
      '555-123-4567',
      'A test property for viewing',
      'https://example.com',
      1234567890,
    );

    //Retrieve user id
    const userId = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get('testuser') as { id: number };

    //Retrieve property id
    const propertyId = db
      .prepare('SELECT id FROM properties WHERE address = ?')
      .get('456 Oak Ave, Somewhere, USA') as { id: number };

    // Finally insert favorite
    db.prepare(
      'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
    ).run(userId.id, propertyId.id);

    expect(
      db
        .prepare(
          'SELECT * FROM favorites WHERE user_id = ? AND property_id = ?',
        )
        .run(userId.id, propertyId.id),
    ).toBeDefined();
  });

  //Test 9:
  it('the table actually gets wiped when calling the resetDatabase function', async () => {
    expect(db.prepare('SELECT * FROM roles').get()).toBeDefined();
    expect(db.prepare('SELECT * FROM users').get()).toBeDefined();
    await resetDatabase(db, dbTestOptions);
    expect(db.prepare('SELECT * FROM roles').get()).toBeUndefined();
    expect(db.prepare('SELECT * FROM users').get()).toBeUndefined();
  });

  //Test 10:
  it('tests that the initial values are inserted correctly', async () => {
    await resetDatabase(db, dbTestOptions);
    await initialValues(db);
    expect(db.prepare('SELECT * FROM roles').get()).toBeDefined();
    expect(db.prepare('SELECT * FROM users').get()).toBeDefined();
    expect(
      db.prepare("SELECT * FROM roles WHERE role_name = 'admin'").get(),
    ).toBeDefined();
    expect(
      db.prepare("SELECT * FROM roles WHERE role_name = 'user'").get(),
    ).toBeDefined();
  });
});
