import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database, { Options } from 'better-sqlite3';
import { Database as BetterSQLite3Database } from 'better-sqlite3';
import type { BetterSQLite3Database as DrizzleDB } from 'drizzle-orm/better-sqlite3';
import dotenv from 'dotenv';
import * as schema from './schema';
import rolesModelFactory from '../models/roles';
import usersModelFactory from '../models/users';
import { RolesModel } from '../models/roles';
import { User } from '../models/table-types';

export const databasePath: string = __dirname + '/database.sqlite';

// Load environment variables
dotenv.config();

// Initialize admin values
const adminPassword: string = process.env.ADMIN_PASSWORD || '';
const adminUsername: string = process.env.ADMIN_USERNAME || '';
const adminEmail: string = process.env.ADMIN_EMAIL || '';

// Database options
export const dbProductionOptions: Options = {
	fileMustExist: false,
	readonly: false,
};

export const dbTestOptions: Options = {
	fileMustExist: false,
	readonly: false,
};

//Migrations folder
const migrationsFolder = __dirname + '/migrations';

/**
 * Creates the database and populates it with the initial values.
 * @param databasePath - The path to the database file.
 * @returns A boolean indicating the success of the operation.
 */

export async function databaseCreator(
	databasePath: string,
	dbOptions: Options,
): Promise<boolean> {
	try {
		// Create SQLite connection
		const sqlite = new Database(databasePath, dbOptions);

		// Create Drizzle instance
		const db = drizzle(sqlite, { schema });

		// Enable foreign keys
		sqlite.pragma('foreign_keys = ON');

		return true;
	} catch (error: any) {
		console.error(`Error creating database: ${error.stack}`);
		return false;
	}
}

/**
 * Runs the migrations on the database.
 * @param db - The database instance.
 * @param migrationsFolder - The path to the migrations folder.
 */
export function runMigrations(db: DrizzleDB, migrationsFolder: string): void {
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
	databasePath: string,
	dbOptions: Options,
): BetterSQLite3Database {
	try {
		const sqlite: BetterSQLite3Database = new Database(databasePath, dbOptions);
		return sqlite;
	} catch (error) {
		console.error(`Failed to connect to database at ${databasePath}:`, error);
		throw error;
	}
}

/**
 * Populates the database with the initial values.
 * @param db - The database instance.
 */

export async function initialValues(db: BetterSQLite3Database): Promise<void> {
	try {
		//Roles Model
		const roleModel: RolesModel = rolesModelFactory(drizzle(db));

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
		const userModel = usersModelFactory(drizzle(db));
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
	} catch (error: any) {
		console.error(`Error populating the database: ${error.stack}`);
	}
}

export async function resetDatabase(
	db: BetterSQLite3Database,
	dbOptions: Options,
): Promise<void> {
	try {
		const drizzleDb = drizzle(db, { schema });
		db.pragma('foreign_keys = OFF');
		// Clear all tables in the correct order to avoid foreign key constraints
		await drizzleDb.delete(schema.users).execute();
		await drizzleDb.delete(schema.viewedProperties).execute();
		await drizzleDb.delete(schema.favorites).execute();
		await drizzleDb.delete(schema.properties).execute();
		await drizzleDb.delete(schema.roles).execute();
		await drizzleDb.delete(schema.invitationTokens).execute();
		await drizzleDb.delete(schema.usedInvitationTokens).execute();
		db.pragma('foreign_keys = ON');
	} catch (error: any) {
		console.error(`Error resetting the database: ${error.stack}`);
		throw error;
	}
}

export function createBackup(backupPath: string, db: BetterSQLite3Database) {
	const backup = db.backup(backupPath);
	backup
		.then(() => {
			console.log('Backup completed successfully!');
		})
		.catch((err: any) => {
			console.error('Backup failed:', err);
		});
}
