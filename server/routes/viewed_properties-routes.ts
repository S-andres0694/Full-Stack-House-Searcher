import { Router } from 'express';
import viewedPropertiesApiFactory, {
	ViewedPropertiesApi,
	testApi,
} from '../controllers/viewed_properties-api';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

export default function viewedPropertiesRoutesFactory(
	db: NodePgDatabase<typeof schema>,
): Router {
	const router: Router = Router();
	const viewedPropertiesApi: ViewedPropertiesApi =
		viewedPropertiesApiFactory(db);

	//Tests that the endpoint is alive
	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		testApi,
	);

	//Gets all viewed properties for a user
	router.get(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.getViewedProperties,
	);

	//Adds a property as viewed
	router.post(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.addPropertyAsViewed,
	);

	//Adds multiple properties as viewed
	router.post(
		'/multiple/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.addMultiplePropertiesAsViewed,
	);

	//Deletes a property from the viewed properties list for a specific user
	router.delete(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.deletePropertyFromViewed,
	);

	//Clears all viewed properties for a specific user
	router.delete(
		'/:userId/clear',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.clearViewedProperties,
	);

	//Gets the last viewed property for a specific user
	router.get(
		'/:userId/last',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		viewedPropertiesApi.getLastViewedProperty,
	);

	return router;
}
