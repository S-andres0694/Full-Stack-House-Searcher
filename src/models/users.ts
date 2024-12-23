import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import connectionGenerator, {
  databasePath,
  dbProductionOptions,
} from "../database/init-db";
import { roles, users } from "../database/schema";
import { NewUser, Role, User } from "./table-types";
import { hash } from "bcrypt";

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
   * @returns {Promise<number>} The ID of the newly created user
   */
  async createUser(user: NewUser): Promise<number> {
    const validationResult: boolean | string = await this.validateUniqueUsernameAndEmail(user);
    if (validationResult === true) {
      //Hash the password.
      user.password = await hash(user.password, 10);
      //Insert the user into the database and return the id of the user.
      const [userRecord] = await this.db
        .insert(users)
        .values(user)
        .returning({ id: users.id });
      return userRecord.id;
    }
    throw new Error(validationResult as string);
  }

  /**
   * Validates the fact that the username and email are unique.
   * @param {NewUser} user - The user object containing user details
   * @returns {Promise<boolean>} True if the username and email are unique, false otherwise
   */

  async validateUniqueUsernameAndEmail(user: NewUser): Promise<boolean | string> {
    const usernameExists = await this.usernameExists(user.username);
    const emailExists = await this.emailExists(user.email);
    if (usernameExists) {
      return "Username already exists";
    }
    if (emailExists) {
      return "Email already exists";
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
   * @param {string} username - The new username
   * @returns {Promise<void>}
   */
  async updateUserUsername(id: number, username: string): Promise<void> {
    //Update the user's username in the database.
    await this.db.update(users).set({ username }).where(eq(users.id, id));
  }

  /**
   * Updates a user's email address.
   * @param {string} username - The username of the user to update
   * @param {string} email - The new email address
   * @returns {Promise<void>}
   */
  async updateUserEmail(username: string, email: string): Promise<void> {
    //Update the user's email in the database.
    await this.db
      .update(users)
      .set({ email })
      .where(eq(users.username, username));
  }

  /**
   * Updates a user's password.
   * @param {string} username - The username of the user to update
   * @param {string} password - The new password (will be hashed)
   * @returns {Promise<void>}
   */
  async updateUserPassword(username: string, password: string): Promise<void> {
    //Hash the password.
    password = await hash(password, 10);
    //Update the user's password in the database.
    await this.db
      .update(users)
      .set({ password })
      .where(eq(users.username, username));
  }

  /**
   * Deletes a user from the database.
   * @param {string} username - The username of the user to delete
   * @returns {Promise<void>}
   */
  async deleteUser(username: string): Promise<void> {
    await this.db.delete(users).where(eq(users.username, username));
  }

  /**
   * Checks if a user exists in the database.
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
   * @param {string} username - The username of the user to check
   * @param {string} role - The role to check for
   * @returns {Promise<boolean>} True if the user has the role, false otherwise
   */
  async hasRole(username: string, role: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return user?.role === role;
  }

  /**
   * Retrieves the name of a user by their username.
   * @param {string} username - The username of the user to retrieve
   * @returns {Promise<string | undefined>} The name of the user if found, undefined otherwise
   */
  async getName(username: string): Promise<string | undefined> {
    const user = await this.getUserByUsername(username);
    return user?.name;
  }

  /**
   * Retrieves the email of a user by their username.
   * @param {string} username - The username of the user to retrieve
   * @returns {Promise<string | undefined>} The email of the user if found, undefined otherwise
   */
  async getEmail(username: string): Promise<string | undefined> {
    const user = await this.getUserByUsername(username);
    return user?.email;
  }
}

/**
 * Factory function to create an instance of UsersModel.
 * @param {BetterSQLite3Database} db - The database connection instance
 * @returns {UsersModel} An instance of UsersModel
 */
export default function usersModelFactory(
  db: BetterSQLite3Database
): UsersModel {
  return new UsersModel(db);
}
