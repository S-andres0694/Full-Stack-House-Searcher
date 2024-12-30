import app from '../app';
import { Router } from 'express';
import { passportObj } from '../authentication/google-auth.config';

const authenticationRoutesFactory = (dbPath: string) => {
	const router: Router = Router();

	//Google Authentication Callback Route
	router.get('/google', passportObj.authenticate('google', { scope: ['email', 'profile'] }));

	//Google Authentication Callback Route
	//TODO: Change to the URL to actually initialize the password to enable JWT authentication.
	router.get('/google/callback', (req, res) => {
		res.status(200).send('Hello World');
	});

	return router;
};

export default authenticationRoutesFactory;
