import { User } from '../types/authentication-types';
import jwt from 'jsonwebtoken';

/**
 * This file contains the utilities for the authentication services.
 */

/**
 * This function is used to retrieve the user's data from a JWT Token.
 * @param token - The JWT Token.
 * @returns The user's data.
 */

export const getUserFromJWTToken = (token: string): User => {
	try {
		const decodedToken = jwt.decode(token) as User;
		if (
			decodedToken &&
			decodedToken.id &&
			decodedToken.email &&
			decodedToken.role &&
			decodedToken.name &&
			decodedToken.username
		) {
			return decodedToken;
		} else {
			throw new Error('Invalid token: Missing required user properties');
		}
	} catch (error) {
		throw new Error('Invalid token');
	}
};

/**
 * This function is used to retrieve the user's data from the server if the user is logged in through Google OAuth2.
 * @param the userID from the Google OAuth2 strategy.
 * @returns The user's data.
 */

export const getUserFromGoogleOAuth2 = async (): Promise<User> => {
	try {
		const userRequest: Response = await fetch(
			`${process.env.SERVER_URL}/users/google/whoami`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			},
		);
		const user: User = await userRequest.json();
		return user;
	} catch (error) {
		throw new Error('Failed to retrieve user data');
	}
};
