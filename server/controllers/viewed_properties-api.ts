import { Database } from 'better-sqlite3';
import { Request, response, Response } from 'express';
import viewedPropertiesModelFactory, {
	ViewedPropertiesModel,
} from '../models/viewed_properties';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { NewViewedProperty, Property } from '../models/table-types';
import usersModelFactory from '../models/users';
import { UsersModel } from '../models/users';
import { ViewedProperty } from '../models/table-types';
import propertiesModelFactory, { PropertiesModel } from '../models/properties';
import { properties } from '../database/schema';
/**
 * Test API to make sure that the endpoint is working.
 * @param {Request} request - The request object
 * @param {Response} response - The response object to send the user data
 */

export const testApi = async (
	request: Request,
	response: Response,
): Promise<void> => {
	response.status(200).json({ message: 'Server is running' });
};

/**
 * Class containing all of the viewed properties API endpoints and their handler functions.
 */

export class ViewedPropertiesApi {
	//Database Connection Instance
	private drizzle: BetterSQLite3Database;
	//Viewed Properties Model Instance
	private viewedPropertiesModel: ViewedPropertiesModel;
	//Users Model Instance
	private usersModel: UsersModel;
	//Properties Model Instance
	private propertiesModel: PropertiesModel;

	constructor(private db: Database) {
		this.drizzle = drizzle(db);
		this.viewedPropertiesModel = viewedPropertiesModelFactory(this.drizzle);
		this.usersModel = usersModelFactory(this.drizzle);
		this.propertiesModel = propertiesModelFactory(this.drizzle);
	}

	/**
	 * Retrieves all viewed properties for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	getViewedProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			const properties: ViewedProperty[] | undefined =
				await this.viewedPropertiesModel.getAllViewedPropertiesFromUser(userID);

			if (properties === undefined) {
				response.status(400).json({ error: 'No properties found' });
				return;
			}

			response.status(200).json(properties);
		} catch (error) {
			console.error(`Error retrieving properties: ${error}`);
			response.status(500).json({ error: 'Error retrieving properties' });
		}
	};

	/**
	 * Adds a property to the viewed properties list for a specific user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	addPropertyAsViewed = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			const propertyId: number = parseInt(request.body.propertyId);

			if (isNaN(propertyId)) {
				response.status(400).json({ error: 'Invalid property ID' });
				return;
			}

			if (
				(await this.propertiesModel.getPropertyById(propertyId)) === undefined
			) {
				response.status(400).json({ error: 'Property not found' });
				return;
			}

			const viewedProperty: NewViewedProperty = {
				userId: userID,
				propertyId: propertyId,
			};

			await this.viewedPropertiesModel.addPropertyAsViewed(viewedProperty);

			response.status(200).json({ message: 'Property added as viewed' });
		} catch (error) {
			console.error(`Error adding property: ${error}`);
			response.status(500).json({ error: 'Error adding property' });
		}
	};

	/**
	 * Deletes a property from the viewed properties list for a specific user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	deletePropertyFromViewed = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			const propertyId: number = parseInt(request.body.propertyId);

			if (isNaN(propertyId)) {
				response.status(400).json({ error: 'Invalid property ID' });
				return;
			}

			if (
				(await this.propertiesModel.getPropertyById(propertyId)) === undefined
			) {
				response.status(400).json({ error: 'Property not found' });
				return;
			}

			const viewedProperty: NewViewedProperty = {
				userId: userID,
				propertyId: propertyId,
			};

			await this.viewedPropertiesModel.deleteViewedProperty(viewedProperty);

			response.status(201).json({ message: 'Property deleted from viewed' });
		} catch (error) {
			console.error(`Error deleting property: ${error}`);
			response.status(500).json({ error: 'Error deleting property' });
		}
	};

	/**
	 * Clears all viewed properties for a specific user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	clearViewedProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			await this.viewedPropertiesModel.clearViewedProperties(userID);

			response.status(201).json({ message: 'Viewed properties cleared' });
		} catch (error) {
			console.error(`Error clearing viewed properties: ${error}`);
			response.status(500).json({ error: 'Error clearing viewed properties' });
		}
	};

	/**
	 * Retrieves the last viewed property for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	getLastViewedProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			const lastViewedProperty: ViewedProperty | undefined =
				await this.viewedPropertiesModel.getLastViewedProperty(userID);

			if (lastViewedProperty === undefined) {
				response.status(400).json({ error: 'No viewed properties found' });
				return;
			}

			response.status(200).json(lastViewedProperty);
		} catch (error) {
			console.error(`Error retrieving last viewed property: ${error}`);
			response
				.status(500)
				.json({ error: 'Error retrieving last viewed property' });
		}
	};

	/**
	 * Adds multiple properties as viewed for a specific user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	addMultiplePropertiesAsViewed = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userID: number = parseInt(request.params.userId);

			if (isNaN(userID)) {
				response.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(400).json({ error: 'User not found' });
				return;
			}

			const propertyIDs: any[] = request.body.properties;

			if (propertyIDs.length === 0) {
				response.status(400).json({ error: 'No properties provided' });
				return;
			}

			propertyIDs.forEach(async (propertyID) => {
				if (isNaN(parseInt(propertyID))) {
					response.status(400).json({ error: 'Invalid property ID' });
					return;
				}

				if (
					(await this.propertiesModel.getPropertyById(parseInt(propertyID))) ===
					undefined
				) {
					response.status(400).json({ error: 'Property not found' });
					return;
				}

				await this.viewedPropertiesModel.addPropertyAsViewed({
					userId: userID,
					propertyId: parseInt(propertyID),
				});
			});

			response.status(200).json({ message: 'All properties added as viewed' });
		} catch (error) {
			console.error(`Error adding multiple properties as viewed: ${error}`);
			response
				.status(500)
				.json({ error: 'Error adding multiple properties as viewed' });
		}
	};
}
