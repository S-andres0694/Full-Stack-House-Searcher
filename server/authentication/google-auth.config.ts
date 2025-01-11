import passport, { Profile } from 'passport';
import {
	Strategy as GoogleStrategy,
	VerifyCallback,
} from 'passport-google-oauth2';
import { UsersModel } from '../models/users';
import { User } from '../types/table-types';
import { Request } from 'express';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import connectionGenerator, {
	databasePath,
	dbProductionOptions,
} from '../database/init-db';
import { generateFromEmail } from 'unique-username-generator';
import bcrypt from 'bcrypt';
//Google Client ID and Client Secret to enable the OAuth2 authentication strategy.
const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET || '';

//Passport Object to use for the authentication strategy.
export const passportObj: passport.PassportStatic = passport;

//The users model to use for the authentication strategy.
const usersModel: UsersModel = new UsersModel(
	drizzle(connectionGenerator(databasePath, dbProductionOptions)),
);

//Sets up the Google authentication strategy through the Passport.js library.
passportObj.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/auth/google/callback', //TODO: Change to the URL to actually initialize the password to enable JWT authentication.
			passReqToCallback: true,
		},
		async (
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done: VerifyCallback,
		) => {
			//Get the user's email from the profile.
			const userEmail: string = profile.emails?.[0]?.value || '';

			//Get the user from the database.
			const user: User | undefined = await usersModel.getUserByEmail(userEmail);

			//If the user does not exist, create a new user.
			if (!user) {
				await usersModel.createUser({
					email: userEmail,
					password: bcrypt.hashSync('password', 10),
					name: profile.displayName,
					username: generateFromEmail(userEmail, 4),
					role: 'user',
				});

				//Get the new user.
				const newUser: User = (await usersModel.getUserByEmail(userEmail))!;

				//Store the user in the session.
				req.user = {
					id: newUser.id.toString(),
					role: newUser.role,
				};

				//Return the new user.
				return done(null, newUser);
			}

			//Store the user in the session.
			req.user = {
				id: user.id.toString(),
				role: user.role,
			};

			//If the user exists, return the user.
			return done(null, user);
		},
	),
);

/*
 * Serializes the user object to a session.
 * Defines how the user information is reduced to a unique identifier and saved in the session.
 */

passportObj.serializeUser((user: any, done: any) => {
	done(null, user.id);
});

/*
 * Deserializes the user object from the session.
 * Defines how the user information is retrieved from the session and restored to the user object. It reconstructs the user object from the session data.
 */

passportObj.deserializeUser((id: number, done: any) => {
	usersModel
		.getUserById(id)
		.then((user) => {
			done(null, user);
		})
		.catch((error) => {
			done(error, null);
		});
});
