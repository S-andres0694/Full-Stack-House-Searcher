import app from '../app';
import { Router } from 'express';
import { passportObj } from '../authentication/google-auth.config';
import {
	loginController,
	logoutController,
	registerController,
} from '../authentication/authentication-JWT-controllers';

const authenticationRoutesFactory = (dbPath: string) => {
	const router: Router = Router();

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
	router.post('/login', loginController);

	//Register Route
	router.post('/register', registerController);

	//Logout Route
	router.get('/logout', logoutController);

	return router;
};

export default authenticationRoutesFactory;
