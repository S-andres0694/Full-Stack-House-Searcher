import jwt from 'jsonwebtoken';
import { Request } from 'express';

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

export type UserTokenPayload = {
	id: string;
	role: string;
};

/**
 * Generates a JWT token for the given user passed as a parameter.
 * @param user - The user to be encoded in the token.
 * @returns The JWT token.
 */

export function generateAccessToken(user: UserTokenPayload): string {
	return jwt.sign(user, ACCESS_JWT_SECRET, {
		expiresIn: '1h',
	});
}

/**
 * Generates a refresh token for the given payload.
 * @param user - The user to be encoded in the token.
 * @returns The refresh token.
 */

export function generateRefreshToken(user: UserTokenPayload): string {
	return jwt.sign(user, REFRESH_JWT_SECRET, {
		expiresIn: '1d',
	});
}

/**
 * Verifies the refresh token.
 * @param token - The token to be verified.
 * @returns The decoded token.
 */

export function verifyRefreshToken(token: string): jwt.JwtPayload {
	return jwt.verify(token, REFRESH_JWT_SECRET) as jwt.JwtPayload;
}

/**
 * Verifies the access token.
 * @param token - The token to be verified.
 * @returns The decoded token.
 */

export function verifyAccessToken(token: string): jwt.JwtPayload {
	return jwt.verify(token, ACCESS_JWT_SECRET) as jwt.JwtPayload;
}

/**
 * Parses the access token and returns the token payload.
 * @param token - The token to be parsed.
 * @returns The token payload.
 */

export function parseAccessToken(req: Request): UserTokenPayload {
	const token: string = req.get('Authorization')?.split(' ')[1] || '';

	if (!token) {
		throw new Error('No token on the request');
	}

	return verifyAccessToken(token) as UserTokenPayload;
}
