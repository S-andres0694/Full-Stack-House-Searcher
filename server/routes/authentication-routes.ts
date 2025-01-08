import { Router } from 'express';
import { passportObj } from '../authentication/google-auth.config';
import { AuthenticationJWTControllers } from '../authentication/authentication-JWT-controllers';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { dbProductionOptions } from '../database/init-db';
import connectionGenerator from '../database/init-db';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';

const authenticationRoutesFactory = (dbPath: string) => {
	const router: Router = Router();
	const authenticationJWTControllers: AuthenticationJWTControllers =
		new AuthenticationJWTControllers(
			drizzle(connectionGenerator(dbPath, dbProductionOptions)),
		);
	
	//Google Authentication Callback Route
	router.get(
		'/google',
		passportObj.authenticate('google', { scope: ['email', 'profile'] }),
	);

	//Google Authentication Callback Route
	//TODO: Change to the URL to actually initialize the password to enable JWT authentication.
	router.get('/google/callback', (req, res) => {
		passportObj.authenticate('google', {
			successRedirect: '/protected-test/test',
			failureRedirect: '/login',
		})(req, res);
	});

	//Login Route
	router.post('/login', authenticationJWTControllers.loginController);

	//Register Route
	router.post('/register', authenticationJWTControllers.registerController);

	//Refresh Token Route
	router.post('/refresh-token', authenticationJWTControllers.refreshTokenController);

	//Logout Route
	router.get(
		'/logout',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		authenticationJWTControllers.logoutController,
	);

	return router;
};

export default authenticationRoutesFactory;
