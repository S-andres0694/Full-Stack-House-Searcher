import { Database } from 'better-sqlite3';
import { Router } from 'express';
import viewedPropertiesApiFactory, {
	ViewedPropertiesApi,
	testApi,
} from '../controllers/viewed_properties-api';
import { dbProductionOptions } from '../database/init-db';
import connectionGenerator from '../database/init-db';

export default function viewedPropertiesRoutesFactory(dbPath: string): Router {
	const router: Router = Router();
	const db: Database = connectionGenerator(dbPath, dbProductionOptions);
	const viewedPropertiesApi: ViewedPropertiesApi =
		viewedPropertiesApiFactory(db);

	//Tests that the endpoint is alive
	router.get('/test', testApi);

	//Gets all viewed properties for a user
	router.get('/:userId', viewedPropertiesApi.getViewedProperties);

	//Adds a property as viewed
	router.post('/:userId', viewedPropertiesApi.addPropertyAsViewed);

	//Adds multiple properties as viewed
	router.post(
		'/multiple/:userId',
		viewedPropertiesApi.addMultiplePropertiesAsViewed,
	);

	//Deletes a property from the viewed properties list for a specific user
	router.delete('/:userId', viewedPropertiesApi.deletePropertyFromViewed);

	//Clears all viewed properties for a specific user
	router.delete('/:userId/clear', viewedPropertiesApi.clearViewedProperties);

	//Gets the last viewed property for a specific user
	router.get('/:userId/last', viewedPropertiesApi.getLastViewedProperty);

	return router;
}
