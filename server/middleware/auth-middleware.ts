import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { User } from '../models/table-types';
import {
	parseAccessToken,
	UserTokenPayload,
	verifyAccessToken,
} from '../authentication/token-manipulator';
import { JwtPayload } from 'jsonwebtoken';

/**
 * Middleware to check if the user is authenticated through the Google OAuth2 strategy.
 * If the user is not authenticated, it redirects to the login page.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */

export function isUserLoggedInThroughGoogle(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!req.cookies['connect.sid'] || req.get('X-Auth-Method') === 'JWT') {
		return next(); //If the user is logged in through JWT, skip the Google OAuth2 check.
	}

	console.log(req.cookies['connect.sid'], req.get('X-Auth-Method'));

	const user = req.user as User;
	console.log(user);
	console.log(`User ${user?.email} is logged in through Google OAuth2.`);
	res.setHeader('X-Auth-Method', 'Google OAuth2');
	next();
}

/**
 * Middleware to check if the user is authenticated through the JWT strategy.
 * If the user is not authenticated, it redirects to the login page.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */

export function isUserLoggedInThroughJWT(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.cookies['connect.sid'] || req.get('X-Auth-Method') === 'Google OAuth2') {
		return next(); //If the user is logged in through Google OAuth2, skip the JWT check.
	}

	const authHeader: string | undefined = req.headers['authorization'];
	const token: string | undefined = authHeader?.split(' ')[1];

	if (!token) {
		return res.status(401).json({ message: 'Access token missing' });
	}

	try {
		const payload: JwtPayload = verifyAccessToken(token);
		req.user = payload;
		res.setHeader('X-Auth-Method', 'JWT');
		console.log(`User ${payload.email} is logged in through JWT.`);
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired access token' });
	}
}

/**
 * Middleware to check if the user is able to access the route based on the role of the user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */

export function requiresRoleOf(requiredRoles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		checkUserRole(req, res, next, requiredRoles);
	};
}

/**
 * Checks if the user is authorized to access the route based on the role of the user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @param requiredRole - The role required to access the route.
 */

function checkUserRole(
	req: Request,
	res: Response,
	next: NextFunction,
	requiredRoles: string[],
) {
	const user: User = req.user as User;
	if (!requiredRoles.includes(user.role)) {
		return res.status(403).json({ message: 'Unauthorized' });
	}
	next();
}

/**
 * Middleware to automatically add a bearer token to the request.
 * @param token - The bearer token to add.
 */
export function addBearerToken(token: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		req.headers['authorization'] = `Bearer ${token}`;
		next();
	};
}
