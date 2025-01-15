import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { Pool, PoolConfig } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import rolesModelFactory from '../models/roles';
import { RolesModel } from '../models/roles';
import usersModelFactory from '../models/users';
import { User } from '../types/table-types';
dotenv.config();

//Admin values
const adminPassword: string = process.env.ADMIN_PASSWORD || '';
const adminUsername: string = process.env.ADMIN_USERNAME || '';
const adminEmail: string = process.env.ADMIN_EMAIL || '';

const prodDatabaseName: string = 'defaultdb';
const testDatabaseName: string = 'testing-database';

/**
 * Aiven Cloud Database Configuration for PostgreSQL Database
 */

export const databaseConfiguration: PoolConfig = {
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	database: prodDatabaseName,
	ssl: {
		rejectUnauthorized: true,
		ca: process.env.CERTIFICATE_VALUE || readFileSync('./ca.pem').toString(),
	},
};

/**
 * Test Database Configuration for PostgreSQL Database
 */

export const testDatabaseConfiguration: PoolConfig = {
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	database: testDatabaseName,
	ssl: {
		rejectUnauthorized: true,
		ca: process.env.CERTIFICATE_VALUE || readFileSync('./ca.pem').toString(),
	},
};

/**
 * Creates the database and populates it with the initial values.
 * @param databaseConfiguration - The configuration for the database.
 * @returns A boolean indicating the success of the operation.
 */

export async function databaseCreator(
	databaseConfiguration: PoolConfig,
): Promise<boolean> {
	try {
		const client: Pool = new Pool(databaseConfiguration);
		const postgreSQL: NodePgDatabase<typeof schema> = drizzle(client, {
			schema,
		});
		return true;
	} catch (error) {
		console.error(`Error creating database: ${error}`);
		return false;
	}
}

/**
 * Runs the migrations on the database.
 * @param db - The database instance.
 * @param migrationsFolder - The path to the migrations folder.
 */

export async function runMigrations(
	db: NodePgDatabase<typeof schema>,
	migrationsFolder: string,
) {
	try {
		migrate(db, { migrationsFolder });
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	}
}

/**
 * Generates a connection to the database.
 * @param databasePath - The path to the database file.
 * @returns A Database object.
 */

export default function connectionGenerator(
	databaseConfiguration: PoolConfig,
): NodePgDatabase<typeof schema> {
	try {
		const client: Pool = new Pool(databaseConfiguration);
		const postgreSQL: NodePgDatabase<typeof schema> = drizzle(client, {
			schema,
		});
		return postgreSQL;
	} catch (error) {
		console.error('Failed to connect to database:', error);
		throw error;
	}
}

/**
 * Populates the database with the initial values.
 * @param db - The database instance.
 */

export async function initialValues(
	db: NodePgDatabase<typeof schema>,
): Promise<void> {
	try {
		//Roles Model
		const roleModel: RolesModel = rolesModelFactory(db);

		//Check if the roles exist
		const userRoleChecker: boolean = await roleModel.checkRoleExists('user');
		const adminRoleChecker: boolean = await roleModel.checkRoleExists('admin');

		//Create the roles if they don't exist
		if (!userRoleChecker) {
			await roleModel.createRole(
				'user',
				'Standard user role with limited access',
			);
		}
		if (!adminRoleChecker) {
			await roleModel.createRole('admin', 'Admin role with full access');
		}

		//Users Model
		const userModel = usersModelFactory(db);
		const adminUserChecker: User | undefined =
			await userModel.getUserByUsername(adminUsername);

		//Create the user if they don't exist
		if (!adminUserChecker) {
			await userModel.createUser({
				username: adminUsername,
				email: adminEmail,
				password: adminPassword,
				role: 'admin',
				name: 'Sebastian El Khoury',
			});
		}
	} catch (error) {
		console.error('Failed to populate database:', error);
		throw error;
	}
}

/**
 * Resets the database.
 * @param db - The database instance.
 */

export async function resetDatabase(
	db: NodePgDatabase<typeof schema>,
): Promise<void> {
	try {
		// Use the actual table names instead of schema objects
		await db.execute(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
		await db.execute(
			`TRUNCATE TABLE "viewed_properties" RESTART IDENTITY CASCADE`,
		);
		await db.execute(`TRUNCATE TABLE "favorites" RESTART IDENTITY CASCADE`);
		await db.execute(`TRUNCATE TABLE "properties" RESTART IDENTITY CASCADE`);
		await db.execute(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE`);
		await db.execute(
			`TRUNCATE TABLE "invitation_tokens" RESTART IDENTITY CASCADE`,
		);
		await db.execute(
			`TRUNCATE TABLE "used_invitation_tokens" RESTART IDENTITY CASCADE`,
		);
	} catch (error: any) {
		console.error(`Error resetting the database: ${error.stack}`);
		throw error;
	}
}
