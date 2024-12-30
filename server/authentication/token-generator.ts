import jwt from 'jsonwebtoken';
import { User } from '../models/table-types';

/*
    Access token for the JWT Authentication process.
    This token is used to authenticate the user in the application.
*/
const ACCESS_JWT_SECRET: string = process.env.ACCESS_JWT_SECRET || '';

/*
    Refresh token for the JWT Authentication process.
    This token is used to refresh the access token when it expires.
*/
const REFRESH_JWT_SECRET: string = process.env.REFRESH_JWT_SECRET || '';

/**
 * Generates a JWT token for the given user passed as a parameter.
 * @param user - The user to be encoded in the token.
 * @returns The JWT token.
 */

export function generateAccessToken(user: User): string {
	return jwt.sign({ id: user.id, role: 'user' }, ACCESS_JWT_SECRET, {
		expiresIn: '1h',
	});
}

/**
 * Generates a refresh token for the given payload.
 * @param user - The user to be encoded in the token.
 * @returns The refresh token.
 */

export function generateRefreshToken(user: User): string {
	return jwt.sign({ id: user.id, role: 'user' }, REFRESH_JWT_SECRET, {
		expiresIn: '1d',
	});
}
