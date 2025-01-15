import { describe, it, expect } from '@jest/globals';
import connectionGenerator, {
	initialValues,
	resetDatabase,
	testDatabaseConfiguration,
} from '../../database/init-db.v2';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';

let db: NodePgDatabase<typeof schema>;

//Creates a test database and provides a connection to it.
beforeAll(() => {
	db = connectionGenerator(testDatabaseConfiguration);
});

afterEach(async () => {
	await resetDatabase(db);
	await initialValues(db);
});

describe('Database Unit Tests', () => {
	//Test 1:
	it('should be able to connect to the database', () => {
		expect(db).toBeInstanceOf(NodePgDatabase);
	});

	//Test 2:
	it('should be able to create a table', async () => {
		await db.execute(
			'CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT)',
		);
		const result = await db.execute('SELECT * FROM test');
		expect(result.rows).toEqual([]);
	});

	//Test 3:
	it('should be able to load the schema', () => {
		expect(db.select().from(schema.properties)).toBeDefined();
		expect(db.select().from(schema.viewedProperties)).toBeDefined();
		expect(db.select().from(schema.roles)).toBeDefined();
		expect(db.select().from(schema.favorites)).toBeDefined();
		expect(db.select().from(schema.users)).toBeDefined();
		expect(db.select().from(schema.invitationTokens)).toBeDefined();
		expect(db.select().from(schema.usedInvitationTokens)).toBeDefined();
	});

	//Test 4:
	it('should be able to insert a user', () => {
		db.insert(schema.users).values({
			username: 'testuser',
			password: 'testpassword',
			email: 'test@test.com',
			role: 'admin',
			name: 'Anon User',
		});
		expect(
			db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, 'testuser')),
		).toBeDefined();
	});

	//Test 5:
	it('should be able to insert a property', async () => {
		db.insert(schema.properties).values({
			bedrooms: 2,
			address: '123 Main St, Anytown, USA',
			monthlyRent: '$1000',
			contactPhone: '123-456-7890',
			summary: 'This is a test property',
			url: 'https://test.com',
			identifier: 1234567890,
		});
		const result = await db.execute(
			"SELECT * FROM properties WHERE address = '123 Main St, Anytown, USA'",
		);
		expect(result).toBeDefined();
	});

	//Test 6:
	it('should be able to insert a role', async () => {
		await db.insert(schema.roles).values({
			roleName: 'test',
			description: 'This is a test role',
		});
		const result = await db.execute(
			"SELECT * FROM roles WHERE role_name = 'test'",
		);
		expect(result).toBeDefined();
	});

	//Test 7:
	it('should be able to insert a viewed property', async () => {
		// Insert user
		await db.insert(schema.users).values({
			username: 'testuser',
			password: 'testpassword',
			email: 'test@test.com',
			role: 'user',
			name: 'Anon User',
		});

		// Then insert property
		await db.insert(schema.properties).values({
			bedrooms: 3,
			address: '456 Oak Ave, Somewhere, USA',
			monthlyRent: '$1500',
			contactPhone: '555-123-4567',
			summary: 'A test property for viewing',
			url: 'https://example.com',
			identifier: 1234567890,
		});

		// Retrieve user id
		const userIdResult = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, 'testuser'));
		const userId = userIdResult[0].id;

		// Retrieve property id
		const propertyIdResult = await db
			.select()
			.from(schema.properties)
			.where(eq(schema.properties.address, '456 Oak Ave, Somewhere, USA'));
		const propertyId = propertyIdResult[0].id;

		// Finally insert viewed property
		await db.insert(schema.viewedProperties).values({
			userId: userId,
			propertyId: propertyId,
		});

		const result = await db
			.select()
			.from(schema.viewedProperties)
			.where(
				and(
					eq(schema.viewedProperties.userId, userId),
					eq(schema.viewedProperties.propertyId, propertyId),
				),
			);

		expect(result).toBeDefined();
	});

	//Test 8:
	it('should be able to insert a favorite property', async () => {
		// Insert user
		await db.insert(schema.users).values({
			username: 'testuser',
			password: 'testpassword',
			email: 'test@test.com',
			role: 'user',
			name: 'Anon User',
		});

		// Then insert property
		await db.insert(schema.properties).values({
			bedrooms: 3,
			address: '456 Oak Ave, Somewhere, USA',
			monthlyRent: '$1500',
			contactPhone: '555-123-4567',
			summary: 'A test property for viewing',
			url: 'https://example.com',
			identifier: 1234567890,
		});

		// Retrieve user id
		const userIdResult = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, 'testuser'));

		const userId = userIdResult[0].id;

		// Retrieve property id
		const propertyIdResult = await db
			.select()
			.from(schema.properties)
			.where(eq(schema.properties.address, '456 Oak Ave, Somewhere, USA'));
		const propertyId = propertyIdResult[0].id;

		// Finally insert favorite
		await db.insert(schema.favorites).values({
			userId: userId,
			propertyId: propertyId,
		});

		const result = await db
			.select()
			.from(schema.favorites)
			.where(
				and(
					eq(schema.favorites.userId, userId),
					eq(schema.favorites.propertyId, propertyId),
				),
			);
		expect(result).toBeDefined();
	});

	//Test 9:
	it('the table actually gets wiped when calling the resetDatabase function', async () => {
		let result = await db.execute('SELECT * FROM roles');
		expect(result.rows).toBeDefined();
		result = await db.execute('SELECT * FROM users');
		expect(result.rows).toBeDefined();
		await resetDatabase(db);
		result = await db.execute('SELECT * FROM roles');
		expect(result.rows).toEqual([]);
		result = await db.execute('SELECT * FROM users');
		expect(result.rows).toEqual([]);
	});

	//Test 10:
	it('tests that the initial values are inserted correctly', async () => {
		await resetDatabase(db);
		await initialValues(db);
		let result = await db.execute('SELECT * FROM roles');
		expect(result).toBeDefined();
		result = await db.execute('SELECT * FROM users');
		expect(result).toBeDefined();
		result = await db.execute("SELECT * FROM roles WHERE role_name = 'admin'");
		expect(result).toBeDefined();
		result = await db.execute("SELECT * FROM roles WHERE role_name = 'user'");
		expect(result).toBeDefined();
	});
});
