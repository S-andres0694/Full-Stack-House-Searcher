import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';
import connectionGenerator, {
	databasePath,
	dbProductionOptions,
} from '../database/init-db';
import { roles, users } from '../database/schema';
import { NewUser, Role, User } from './table-types';
import { hash } from 'bcrypt';

/**
 * Class representing a model for user operations in the database.
 */
export class UsersModel {
	/**
	 * Creates an instance of UsersModel.
	 * @param {BetterSQLite3Database} db - The database connection instance
	 */
	constructor(private db: BetterSQLite3Database) {}

	/**
	 * Creates a new user in the database.
	 * @param {NewUser} user - The user object containing user details
	 */
	async createUser(user: NewUser): Promise<void> {
		const validationResult: boolean | string =
			await this.validateUniqueUsernameAndEmail(user);
		if (validationResult === true) {
			//Hash the password.
			user.password = await hash(user.password, 10);
			//Insert the user into the database and return the id of the user.
			try {
				this.db.transaction(async (tx: BetterSQLite3Database) => {
					await tx.insert(users).values(user);
				});
			} catch (error) {
				throw new Error('Failed to create user');
			}
		} else {
			throw new Error(validationResult as string);
		}
	}

	/**
	 * Validates the fact that the username and email are unique.
	 * @param {NewUser} user - The user object containing user details
	 * @returns {Promise<boolean | string>} True if the username and email are unique, an error message (string) otherwise
	 */

	async validateUniqueUsernameAndEmail(
		user: NewUser,
	): Promise<boolean | string> {
		const usernameExists: boolean = await this.usernameExists(user.username);
		const emailExists: boolean = await this.emailExists(user.email);
		if (usernameExists === true) {
			return 'Username already exists';
		}
		if (emailExists === true) {
			return 'Email already exists';
		}
		return true;
	}

	/**
	 * Retrieves a user by their username.
	 * @param {string} username - The username to search for
	 * @returns {Promise<User | undefined>} The user object if found, undefined otherwise
	 */
	async getUserByUsername(username: string): Promise<User | undefined> {
		//Select the user from the database.
		const [userRecord]: User[] = await this.db
			.select()
			.from(users)
			.where(eq(users.username, username));
		return userRecord;
	}

	/**
	 * Retrieves a user by their email address.
	 * @param {string} email - The email address to search for
	 * @returns {Promise<User | undefined>} The user object if found, undefined otherwise
	 */
	async getUserByEmail(email: string): Promise<User | undefined> {
		//Select the user from the database.
		const [userRecord]: User[] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email));
		return userRecord;
	}

	/**
	 * Retrieves a user by their ID.
	 * @param {number} id - The user ID to search for
	 * @returns {Promise<User | undefined>} The user object if found, undefined otherwise
	 */
	async getUserById(id: number): Promise<User | undefined> {
		//Select the user from the database.
		const [userRecord]: User[] = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id));
		return userRecord;
	}

	/**
	 * Retrieves all users from the database.
	 * @returns {Promise<User[]>} Array of all user objects
	 */
	async getAllUsers(): Promise<User[]> {
		//Select all users from the database.
		const userRecords: User[] = await this.db.select().from(users);
		return userRecords;
	}

	/**
	 * Updates a user's username.
	 * @param {number} id - The ID of the user to update
	 * @param {string} newUsername - The new username
	 * @returns {Promise<void>}
	 */
	async updateUserUsername(
		id: number,
		newUsername: string,
	): Promise<boolean | string> {
		try {
			if (await this.getUserByUsername(newUsername)) {
				return false;
			}
			this.db.transaction(async (tx: BetterSQLite3Database) => {
				await tx
					.update(users)
					.set({ username: newUsername })
					.where(eq(users.id, id));
			});
			return true;
		} catch (error) {
			return 'Internal Database Failure';
		}
	}

	/**
	 * Updates a user's email address.
	 * @param {number} id - The ID of the user to update
	 * @param {string} newEmail - The new email address
	 * @returns {Promise<void>}
	 */
	async updateUserEmail(
		id: number,
		newEmail: string,
	): Promise<boolean | string> {
		try {
			if (await this.getUserByEmail(newEmail)) {
				return false;
			}
			this.db.transaction(async (tx: BetterSQLite3Database) => {
				await tx.update(users).set({ email: newEmail }).where(eq(users.id, id));
			});
			return true;
		} catch (error) {
			return 'Internal Database Failure';
		}
	}

	/**
	 * Updates a user's password.
	 * @param {number} id - The ID of the user to update
	 * @param {string} newPassword - The new password (will be hashed)
	 * @returns {Promise<void>}
	 */
	async updateUserPassword(
		id: number,
		newPassword: string,
	): Promise<boolean | string> {
		try {
			if (!(await this.getUserById(id))) {
				return false;
			}

			//Hash the password.
			newPassword = await hash(newPassword, 10);
			//Update the user's password in the database.
			this.db.transaction(async (tx: BetterSQLite3Database) => {
				await tx
					.update(users)
					.set({ password: newPassword })
					.where(eq(users.id, id));
			});
			return true;
		} catch (error) {
			return 'Internal Database Failure';
		}
	}

	/**
	 * Deletes a user from the database by their ID.
	 * @param {number} id - The ID of the user to delete
	 * @returns {Promise<void>}
	 */
	async deleteUser(id: number): Promise<boolean | string> {
		try {
			if (!(await this.getUserById(id))) {
				return false;
			}
			this.db.transaction(async (tx: BetterSQLite3Database) => {
				await tx.delete(users).where(eq(users.id, id));
			});

			return true;
		} catch (error) {
			return 'Internal Database Failure';
		}
	}

	/**
	 * Checks if a username exists in the database.
	 * @param {string} username - The username of the user to check
	 * @returns {Promise<boolean>} True if the user exists, false otherwise
	 */
	async usernameExists(username: string): Promise<boolean> {
		const user = await this.getUserByUsername(username);
		return user !== undefined;
	}

	/**
	 * Checks if an email address exists in the database.
	 * @param {string} email - The email address to check
	 * @returns {Promise<boolean>} True if the email exists, false otherwise
	 */
	async emailExists(email: string): Promise<boolean> {
		const user = await this.getUserByEmail(email);
		return user !== undefined;
	}

	/**
	 * Checks if a user has a specific role.
	 * @param {number} id - The ID of the user to check
	 * @param {string} role - The role to check for
	 * @returns {Promise<boolean | string>} True if the user has the role, false otherwise
	 */
	async hasRole(id: number, role: string): Promise<boolean | string> {
		const user = await this.getUserById(id);
		if (!user) {
			return 'User does not exist';
		}
		return user.role === role;
	}

	/**
	 * Retrieves the name of a user by their ID.
	 * @param {number} id - The ID of the user to retrieve
	 * @returns {Promise<string | undefined>} The name of the user if found, undefined otherwise
	 */
	async getName(id: number): Promise<string | undefined> {
		const user = await this.getUserById(id);
		return user?.name;
	}

	/**
	 * Retrieves the email of a user by their ID.
	 * @param {number} id - The ID of the user to retrieve
	 * @returns {Promise<string | undefined>} The email of the user if found, undefined otherwise
	 */
	async getEmail(id: number): Promise<string | undefined> {
		const user = await this.getUserById(id);
		return user?.email;
	}

	/**
	 * Retrieves the ID of a user by their username.
	 * @param {string} username - The username of the user to retrieve
	 * @returns {Promise<number | undefined>} The ID of the user or undefined if the user does not exist
	 */
	async getUserId(username: string): Promise<number | undefined> {
		const user: User | undefined = await this.getUserByUsername(username);
		return user?.id;
	}
}

/**
 * Factory function to create an instance of UsersModel.
 * @param {BetterSQLite3Database} db - The database connection instance
 * @returns {UsersModel} An instance of UsersModel
 */
export default function usersModelFactory(
	db: BetterSQLite3Database,
): UsersModel {
	return new UsersModel(db);
}
