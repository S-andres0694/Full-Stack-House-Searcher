import { FavoritePropertiesApi } from '../controllers/favorite_properties-api';

import { dbProductionOptions } from '../database/init-db';
import favoritePropertiesApiFactory from '../controllers/favorite_properties-api';
import { Database } from 'better-sqlite3';
import { Router } from 'express';
import { testApi } from '../controllers/favorite_properties-api';
import connectionGenerator from '../database/init-db';

export default function favoritePropertiesRoutesFactory(
	dbPath: string,
): Router {
	const router: Router = Router();
	const db: Database = connectionGenerator(dbPath, dbProductionOptions);
	const favoritePropertiesApi: FavoritePropertiesApi =
		favoritePropertiesApiFactory(db);

	//Tests that the route is alive
	router.get('/test', testApi);

	//Gets all favorite properties for a user
	router.get('/:userId', favoritePropertiesApi.getAllFavoriteProperties);

	//Adds a favorite property for a user
	router.post('/:userId', favoritePropertiesApi.addFavoriteProperty);

	//Deletes a favorite property for a user
	router.delete('/:userId', favoritePropertiesApi.deleteFavoriteProperty);

	//Clears all favorite properties for a user
	router.delete('/:userId/all', favoritePropertiesApi.clearFavoriteProperties);

	//Gets the count of favorite properties for a user
	router.get(
		'/:userId/count',
		favoritePropertiesApi.getFavoritePropertiesCount,
	);

	return router;
}
