import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Database } from 'better-sqlite3';
import connectionGenerator from '../database/init-db';
import usersModelFactory, { UsersModel } from '../models/users';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { User, NewUser } from '../models/table-types';
import { Request, response, Response } from 'express';
import rolesModelFactory, { RolesModel } from '../models/roles';

/**
 * Test API to make sure that the server is running.
 * @param {Request} request - The request object
 * @param {Response} response - The response object to send the user data
 */

export const testApi = async (
	request: Request,
	response: Response,
): Promise<void> => {
	response.status(200).json({ message: 'Server is running' });
};

export class UserApi {
	//Database Connection Instance
	private drizzle: BetterSQLite3Database;
	//Users Model Instance
	private usersModel: UsersModel;
	//Roles Model Instance
	private rolesModel: RolesModel;

	constructor(private db: Database) {
		this.drizzle = drizzle(db);
		this.usersModel = usersModelFactory(this.drizzle);
		this.rolesModel = rolesModelFactory(this.drizzle);
	}

	/**
	 * Gets a user by their ID.
	 * @param {Request} request - The request object containing the user ID
	 * @param {Response} response - The response object to send the user data
	 */

	getUserById = async (request: Request, response: Response): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);
			const user: User | undefined = await this.usersModel.getUserById(id);
			if (!user) {
				response.status(404).json({ error: 'User not found' });
				return;
			}
			response.json(user);
		} catch (error) {
			response.status(500).json({ error: 'Failed to get user by ID' });
		}
	};

	/**
	 * Gets a user by their email.
	 * @param {Request} request - The request object containing the user email
	 * @param {Response} response - The response object to send the user data
	 */

	getUserByEmail = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const email: string = request.params.email;
			const user: User | undefined = await this.usersModel.getUserByEmail(
				email,
			);
			if (!user) {
				response.status(404).json({ error: 'User not found' });
				return;
			}
			response.json(user);
		} catch (error) {
			response.status(500).json({ error: 'Failed to get user by email' });
		}
	};

	/**
	 * Gets all users.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */

	getAllUsers = async (request: Request, response: Response): Promise<void> => {
		try {
			const users: User[] = await this.usersModel.getAllUsers();
			if (users.length === 0) {
				response.status(404).json({ error: 'No users found' });
				return;
			}
			response.json(users);
		} catch (error) {
			response.status(500).json({ error: 'Failed to get all users' });
		}
	};

	/**
	 * Deletes a user by their ID.
	 * @param {Request} request - The request object containing the user ID
	 * @param {Response} response - The response object to send the user data
	 */

	deleteUser = async (request: Request, response: Response): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const result: boolean | string = await this.usersModel.deleteUser(id);

		if (result === false) {
			response.status(404).json({ error: 'User not found' });
			return;
		}

		if (result === 'Internal Database Failure') {
			response.status(500).json({ error: 'Failed to delete user' });
			return;
		}

		if (result === true) {
			response.status(204).send();
		}
	};

	/**
	 * Updates a user's username.
	 * @param {Request} request - The request object containing the user username
	 * @param {Response} response - The response object to send the user data
	 */

	updateUserUsername = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const newUsername: string = request.body.newUsername;
		const user: User | undefined = await this.usersModel.getUserById(id);

		if (!user) {
			response.status(404).json({ error: 'User not found' });
			return;
		}

		if (!newUsername) {
			response.status(400).json({ error: 'New username is required' });
			return;
		}

		if (newUsername === user.username) {
			response
				.status(400)
				.json({ error: 'Cannot update username to the same username' });
			return;
		}

		const result: boolean | string = await this.usersModel.updateUserUsername(
			id,
			newUsername,
		);

		if (result === false) {
			response.status(409).json({ error: 'Username already exists' });
			return;
		}

		if (result === 'Internal Database Failure') {
			response.status(500).json({ error: 'Failed to update user' });
			return;
		}

		if (result === true) {
			response.status(204).send();
		}
	};

	/**
	 * Updates a user's email.
	 * @param {Request} request - The request object containing the user email
	 * @param {Response} response - The response object to send the user data
	 */

	updateUserEmail = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const newEmail: string = request.body.newEmail;
		const user: User | undefined = await this.usersModel.getUserById(id);

		if (!user) {
			response.status(404).json({ error: 'User not found' });
			return;
		}

		if (!newEmail) {
			response.status(400).json({ error: 'New email is required' });
			return;
		}

		if (newEmail === user.email) {
			response
				.status(400)
				.json({ error: 'Cannot update email to the same email' });
			return;
		}

		const result: boolean | string = await this.usersModel.updateUserEmail(
			id,
			newEmail,
		);

		if (result === false) {
			response.status(409).json({ error: 'Email already exists' });
			return;
		}

		if (result === 'Internal Database Failure') {
			response.status(500).json({ error: 'Failed to update user' });
			return;
		}

		if (result === true) {
			response.status(204).send();
		}
	};

	/**
	 * Checks if a user has a role.
	 * @param {Request} request - The request object containing the user ID and role
	 * @param {Response} response - The response object to send the user data
	 */

	hasRole = async (request: Request, response: Response): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const role: string = request.params.role;
		const roleId: number | undefined = await this.rolesModel.getRoleId(role);

		if (!roleId) {
			response.status(404).json({ error: 'Role does not exist' });
			return;
		}

		const result: boolean | string = await this.usersModel.hasRole(id, role);

		if (typeof result === 'string') {
			response.status(404).json({ error: result });
			return;
		}

		response.status(200).json({ hasRole: result });
	};

	/**
	 * Gets a user's name.
	 * @param {Request} request - The request object containing the user ID
	 * @param {Response} response - The response object to send the user data
	 */

	getName = async (request: Request, response: Response): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const name: string | undefined = await this.usersModel.getName(id);

		if (!name) {
			response.status(404).json({ error: 'User not found' });
			return;
		}
		response.json(name);
	};

	/**
	 * Gets a user's email.
	 * @param {Request} request - The request object containing the user ID
	 * @param {Response} response - The response object to send the user data
	 */

	getEmail = async (request: Request, response: Response): Promise<void> => {
		const id: number = parseInt(request.params.id);
		const email: string | undefined = await this.usersModel.getEmail(id);
		if (!email) {
			response.status(404).json({ error: 'User not found' });
			return;
		}
		response.json(email);
	};

	/**
	 * Gets a user's ID.
	 * @param {Request} request - The request object containing the user ID
	 * @param {Response} response - The response object to send the user data
	 */

	getUserId = async (request: Request, response: Response): Promise<void> => {
		const username: string = request.params.username;
		const id: number | undefined = await this.usersModel.getUserId(username);
		if (!id) {
			response.status(404).json({ error: 'User not found' });
			return;
		}
		response.json(id);
	};

	/**
	 * Creates a user.
	 * @param {Request} request - The request object containing the user data
	 * @param {Response} response - The response object to send the user data
	 */

	createUser = async (request: Request, response: Response): Promise<void> => {
		const user: NewUser = request.body;
		if (
			!user ||
			!user.username ||
			!user.email ||
			!user.password ||
			!user.name ||
			!user.role
		) {
			response.status(400).json({ error: 'Invalid user data' });
			return;
		}

		//Initialize the date if it was not passed.
		user.createdAt = user.createdAt ? user.createdAt : new Date();

		try {
			await this.usersModel.createUser(user);
			response.status(201).json({ message: 'User created successfully' });
		} catch (error) {
			// Check for specific validation errors
			if (error instanceof Error) {
				if (
					error.message === 'Username already exists' ||
					error.message === 'Email already exists'
				) {
					response.status(409).json({ error: error.message });
					return;
				}
			}
			// Handle other errors
			console.error(error);
			response.status(500).json({ error: 'Failed to create user' });
		}
	};
}

export default function userApiFactory(db: Database): UserApi {
	return new UserApi(db);
}
