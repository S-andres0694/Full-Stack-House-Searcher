import { Router } from 'express';
import propertiesApiFactory, {
	PropertiesApi,
	testApi,
} from '../controllers/properties_api';
import connectionGenerator from '../database/init-db';
import { dbProductionOptions } from '../database/init-db';
import { Database } from 'better-sqlite3';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';

export default function propertiesRoutesFactory(dbPath: string): Router {
	const router: Router = Router();
	const db: Database = connectionGenerator(dbPath, dbProductionOptions);
	const propertiesApi: PropertiesApi = propertiesApiFactory(db);

	//Tests that the route is alive
	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		testApi,
	);

	//Gets properties from the Rightmove API
	router.get(
		'/rightmove',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getRightmoveProperties,
	);

	//Gets properties from the database
	router.get(
		'/',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getProperties,
	);

	//Gets a property by its ID
	router.get(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getPropertyById,
	);

	//Gets a property by its identifier
	router.get(
		'/by-identifier/:identifier',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getPropertyByIdentifier,
	);

	//Gets the number of bedrooms for a property
	router.get(
		'/bedrooms/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getBedrooms,
	);

	//Gets the monthly rent for a property
	router.get(
		'/monthly-rent/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getMonthlyRent,
	);

	//Gets the identifier for a property
	router.get(
		'/identifier/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getIdentifier,
	);

	//Gets the address for a property
	router.get(
		'/address/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getAddress,
	);

	//Gets the contact phone for a property
	router.get(
		'/contact-phone/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getContactPhone,
	);

	//Gets the summary for a property
	router.get(
		'/summary/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getSummary,
	);

	//Updates a property
	router.put(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		propertiesApi.updateProperty,
	);

	//Deletes a property
	router.delete(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		propertiesApi.deleteProperty,
	);

	//Gets the URL of a property in Rightmove
	router.get(
		'/url/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		propertiesApi.getUrl,
	);

	return router;
}
