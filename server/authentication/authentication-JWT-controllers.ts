import { Router } from 'express';
import { Request, Response } from 'express';
import {
	InvitationToken,
	LoginRequestBody,
	RegisterRequestBody,
	User,
} from '../types/table-types';
import usersModelFactory, { UsersModel } from '../models/users';
import { dbProductionOptions } from '../database/init-db';
import connectionGenerator from '../database/init-db';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { databasePath } from '../database/init-db';
import bcrypt from 'bcrypt';
import { invitationTokens } from '../database/schema';
import {
	generateAccessToken,
	generateRefreshToken,
	UserTokenPayload,
	verifyRefreshToken,
} from './token-manipulator';
import invitationTokenModelFactory, {
	InvitationTokenModel,
} from '../models/invitation-token';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
//Defines the router for the authentication controllers.
const router: Router = Router();

export class AuthenticationJWTControllers {
	usersModel: UsersModel;
	invitationTokenModel: InvitationTokenModel;
	constructor(private db: BetterSQLite3Database) {
		//Defines the users model.
		this.usersModel = usersModelFactory(this.db);

		//Defines the invitation token model.
		this.invitationTokenModel = invitationTokenModelFactory(this.db);
	}

	/**
	 * Handles the login requests for new users.
	 * @param req - The request object.
	 * @param res - The response object.
	 */

	loginController = async (req: Request, res: Response): Promise<void> => {
		const { email, password }: LoginRequestBody = req.body;

		//Check if the user exists.
		const user: User | undefined = await this.usersModel.getUserByEmail(email);

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

		//Generate a JWT access token for the user.
		const accessToken: string = generateAccessToken({
			id: user.id.toString(),
			role: user.role,
			email: user.email,
			name: user.name,
			username: user.username,
		});

		//Generate a refresh token for the user.
		const refreshToken: string = generateRefreshToken({
			id: user.id.toString(),
			role: user.role,
			email: user.email,
			name: user.name,
			username: user.username,
		});

		//Attach the refresh token to the cookie of the user.
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000, // 1 day
		});

		//Stores the user in the session.
		req.user = {
			id: user.id.toString(),
			role: user.role,
		};

		//If the password is correct, return the access token.
		res.status(200).json({ accessToken });
	};

	/**
	 * Handles the register request for new users.
	 * @param req - The request object.
	 * @param res - The response object.
	 */

	registerController = async (req: Request, res: Response) => {
		try {
			//Take the new user parameters from the request body.
			const {
				username,
				password,
				name,
				email,
				invitationToken,
			}: RegisterRequestBody = req.body;

			//Check if the user already exists.
			const areDetailsValid: boolean | string =
				await this.usersModel.validateUniqueUsernameAndEmail({
					username,
					email,
					password,
					name,
					role: 'user',
				});

			//If the user already exists, return an error.
			if (areDetailsValid !== true) {
				res.status(400).json({ message: areDetailsValid });
				return;
			}

			//Check if the invitation token is valid.
			const isInvitationTokenValid: InvitationToken | false | undefined =
				await this.invitationTokenModel.isInvitationTokenValid(invitationToken);

			//If the invitation token is not valid, return an error.
			if (isInvitationTokenValid === false) {
				res
					.status(400)
					.json({ message: 'Invitation token has already been used.' });
				return;
			}

			//If the invitation token does not exist, return an error.
			if (isInvitationTokenValid === undefined) {
				res.status(400).json({ message: 'Invitation token does not exist.' });
				return;
			}

			//Consume the invitation token.
			await this.invitationTokenModel.consumeInvitationToken(
				isInvitationTokenValid,
			);

			//If the user does not exist, create a new user.
			await this.usersModel.createUser({
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
			console.error(error);
			res.status(500).json({ message: 'Internal server error.' });
		}
	};

	/**
	 * Handles the logout request for Google OAuth2.
	 * @param req - The request object.
	 * @param res - The response object.
	 */

	logoutController = (req: Request, res: Response) => {
		req.logout((err) => {
			if (err) {
				return res.status(500).json({ message: 'Error logging out.' });
			}

			// Only destroy session after successful logout
			req.session!.destroy((err) => {
				if (err) {
					return res.status(500).json({ message: 'Error destroying session.' });
				}
				req.user = undefined;
				res.clearCookie('connect.sid');
				res.clearCookie('refreshToken');
				res.status(200).json({ message: 'Logged out successfully.' });
			});
		});
	};

	/**
	 * Handles the refresh token request for JWT.
	 * @param req - The request object.
	 * @param res - The response object.
	 */

	refreshTokenController = async (req: Request, res: Response) => {
		const refreshToken: string = req.cookies.refreshToken;

		//If the refresh token is not present, return an error.
		if (!refreshToken) {
			return res
				.status(401)
				.json({ message: 'Invalid or expired refresh token.' });
		}

		try {
			const userDetails: UserTokenPayload = verifyRefreshToken(
				refreshToken,
			) as UserTokenPayload;

			//Generate a new access token for the user.
			const accessToken: string = generateAccessToken(userDetails);

			console.log(`Token has been refreshed for ${userDetails.id}`);

			res
				.status(200)
				.json({ message: 'Token refreshed successfully.', accessToken });
		} catch (error) {
			res.clearCookie('refreshToken');
			return res.redirect('/auth/login');
		}
	};
}
