import { Router } from 'express';
import { Request, Response } from 'express';
import {
	LoginRequestBody,
	RegisterRequestBody,
	User,
} from '../models/table-types';
import usersModelFactory, { UsersModel } from '../models/users';
import { dbProductionOptions } from '../database/init-db';
import connectionGenerator from '../database/init-db';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { databasePath } from '../database/init-db';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from './token-generator';
//Defines the router for the authentication controllers.
const router: Router = Router();

//Defines the users model.
const usersModel: UsersModel = usersModelFactory(
	drizzle(connectionGenerator(databasePath, dbProductionOptions)),
);

/**
 * Handles the login requests for new users.
 * @param req - The request object.
 * @param res - The response object.
 */

export const loginController = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { email, password }: LoginRequestBody = req.body;

	//Check if the user exists.
	const user: User | undefined = await usersModel.getUserByEmail(email);

	//If the user does not exist, return an error.
	if (!user) {
		res.status(404).json({ message: 'User does not exist.' });
		return;
	}

	//If the user exists, check if the password is correct.
	if (!(await bcrypt.compare(password, user.password))) {
		res.status(401).json({ message: 'Invalid password.' });
		return;
	}

	//Generate a JWT token for the user.
	const accessToken: string = generateAccessToken(user);
	const refreshToken: string = generateRefreshToken(user);

	//If the password is correct, return the user.
	res.status(200).json(user);
};

/**
 * Handles the register request for new users.
 * @param req - The request object.
 * @param res - The response object.
 */

export const registerController = async (req: Request, res: Response) => {
	try {
		//Take the new user parameters from the request body.
		const { username, password, name, email }: RegisterRequestBody = req.body;

		//Check if the user already exists.
		const user: User | undefined = await usersModel.getUserByUsername(username);

		//If the user already exists, return an error.
		if (user) {
			res.status(400).json({ message: 'User already exists.' });
			return;
		}

		//If the user does not exist, create a new user.
		await usersModel.createUser({
			username,
			password,
			name,
			email,
			role: 'user',
		});

		//Return a success message.
		res.status(200).json({ message: 'User created successfully.' });
	} catch (error) {
		//If there is an error, return an error.
		res.status(500).json({ message: 'Internal server error.' });
	}
};

/**
 * Handles the logout request for Google OAuth2.
 * @param req - The request object.
 * @param res - The response object.
 */

export const logoutController = (req: Request, res: Response) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ message: 'Error logging out.' });
		}

		// Only destroy session after successful logout
		req.session!.destroy((err) => {
			if (err) {
				return res.status(500).json({ message: 'Error destroying session.' });
			}
			res.status(200).json({ message: 'Logged out successfully.' });
		});
	});
};
