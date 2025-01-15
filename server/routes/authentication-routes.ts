import { Router } from 'express';
import { passportObj } from '../authentication/google-auth.config';
import { AuthenticationJWTControllers } from '../authentication/authentication-JWT-controllers';
import connectionGenerator from '../database/init-db.v2';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

const authenticationRoutesFactory = (
	db: NodePgDatabase<typeof schema>,
): Router => {
	const router: Router = Router();
	const authenticationJWTControllers: AuthenticationJWTControllers =
		new AuthenticationJWTControllers(db);

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
	router.post(
		'/refresh-token',
		authenticationJWTControllers.refreshTokenController,
	);

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
