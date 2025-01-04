import { FavoritePropertiesApi } from '../controllers/favorite_properties-api';

import { dbProductionOptions } from '../database/init-db';
import favoritePropertiesApiFactory from '../controllers/favorite_properties-api';
import { Database } from 'better-sqlite3';
import { Router } from 'express';
import { testApi } from '../controllers/favorite_properties-api';
import connectionGenerator from '../database/init-db';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';

export default function favoritePropertiesRoutesFactory(
	dbPath: string,
): Router {
	const router: Router = Router();
	const db: Database = connectionGenerator(dbPath, dbProductionOptions);
	const favoritePropertiesApi: FavoritePropertiesApi =
		favoritePropertiesApiFactory(db);

	//Tests that the route is alive
	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		testApi,
	);

	//Gets all favorite properties for a user
	router.get(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		favoritePropertiesApi.getAllFavoriteProperties,
	);

	//Adds a favorite property for a user
	router.post(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		favoritePropertiesApi.addFavoriteProperty,
	);

	//Deletes a favorite property for a user
	router.delete(
		'/:userId',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		favoritePropertiesApi.deleteFavoriteProperty,
	);

	//Clears all favorite properties for a user
	router.delete(
		'/:userId/all',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		favoritePropertiesApi.clearFavoriteProperties,
	);

	//Gets the count of favorite properties for a user
	router.get(
		'/:userId/count',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		favoritePropertiesApi.getFavoritePropertiesCount,
	);

	return router;
}
