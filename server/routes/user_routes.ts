import { Router } from 'express';
import userApiFactory, { testApi, UserApi } from '../controllers/user_api';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';

export default function userRoutesFactory(
	db: NodePgDatabase<typeof schema>,
): Router {
	const router: Router = Router();
	const userApi: UserApi = userApiFactory(db);

	//Tests that the route is alive
	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		testApi,
	);

	//Gets a user's data from the server if the user is logged in through Google OAuth2
	router.get(
		'/google/whoami',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		userApi.getUserFromGoogleOAuth2,
	);

	//Gets a user by id
	router.get(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getUserById,
	);

	//Gets all users
	router.get(
		'/',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getAllUsers,
	);

	//Gets a user by email
	router.get(
		'/email/:email',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getUserByEmail,
	);

	//Gets a user's id by username
	router.get(
		'/id/:username',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getUserId,
	);

	//Creates a user
	router.post(
		'/',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.createUser,
	);

	//Deletes a user
	router.delete(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.deleteUser,
	);

	//Updates a user's username
	router.put(
		'/:id/username',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		userApi.updateUserUsername,
	);

	//Updates a user's email
	router.put(
		'/:id/email',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		userApi.updateUserEmail,
	);

	//Checks if a user has a role
	router.get(
		'/:id/hasRole/:role',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.hasRole,
	);

	//Gets a user's name
	router.get(
		'/:id/name',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getName,
	);

	//Gets a user's email
	router.get(
		'/:id/email',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		userApi.getEmail,
	);

	//Checks if an email exists
	router.get(
		'/check-email/:email',
		userApi.checkEmailExists,
	);

	//Checks if a username exists
	router.get(
		'/check-username/:username',
		userApi.checkUsernameExists,
	);

	return router;
}

