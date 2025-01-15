import { Database } from 'better-sqlite3';
import { Request, response, Response } from 'express';
import viewedPropertiesModelFactory, {
	ViewedPropertiesModel,
} from '../models/viewed_properties';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { NewViewedProperty, Property, User } from '../types/table-types';
import usersModelFactory from '../models/users';
import { UsersModel } from '../models/users';
import { ViewedProperty } from '../types/table-types';
import propertiesModelFactory, { PropertiesModel } from '../models/properties';
import { UserTokenPayload } from '../authentication/token-manipulator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

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
	//Viewed Properties Model Instance
	private viewedPropertiesModel: ViewedPropertiesModel;
	//Users Model Instance
	private usersModel: UsersModel;
	//Properties Model Instance
	private propertiesModel: PropertiesModel;

	constructor(private db: NodePgDatabase<typeof schema>) {
		this.viewedPropertiesModel = viewedPropertiesModelFactory(this.db);
		this.usersModel = usersModelFactory(this.db);
		this.propertiesModel = propertiesModelFactory(this.db);
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			if (
				(request.user as User).role !== 'admin' &&
				(request.user as User).id !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				const properties: ViewedProperty[] | undefined =
					await this.viewedPropertiesModel.getAllViewedPropertiesFromUser(
						userID,
					);

				if (properties === undefined || properties.length === 0) {
					response.status(400).json({ error: 'No properties found' });
					return;
				}

				response.status(200).json(properties);
			}
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			if (
				(request.user as UserTokenPayload).role !== 'admin' &&
				parseInt((request.user as UserTokenPayload).id) !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				const propertyId: number = parseInt(request.body.propertyId);

				if (isNaN(propertyId)) {
					response.status(400).json({ error: 'Invalid property ID' });
					return;
				}

				if (
					(await this.propertiesModel.getPropertyById(propertyId)) === undefined
				) {
					response.status(404).json({ error: 'Property not found' });
					return;
				}

				const viewedProperty: NewViewedProperty = {
					userId: userID,
					propertyId: propertyId,
				};

				await this.viewedPropertiesModel.addPropertyAsViewed(viewedProperty);

				response.status(200).json({ message: 'Property added as viewed' });
			}
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			const propertyId: number = parseInt(request.body.propertyId);

			if (
				(request.user as UserTokenPayload).role !== 'admin' &&
				parseInt((request.user as UserTokenPayload).id) !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				if (isNaN(propertyId)) {
					response.status(400).json({ error: 'Invalid property ID' });
					return;
				}

				if (
					(await this.propertiesModel.getPropertyById(propertyId)) === undefined
				) {
					response.status(404).json({ error: 'Property not found' });
					return;
				}

				const viewedProperty: NewViewedProperty = {
					userId: userID,
					propertyId: propertyId,
				};

				await this.viewedPropertiesModel.deleteViewedProperty(viewedProperty);

				response.status(201).json({ message: 'Property deleted from viewed' });
			}
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			if (
				(request.user as UserTokenPayload).role !== 'admin' &&
				parseInt((request.user as UserTokenPayload).id) !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				await this.viewedPropertiesModel.clearViewedProperties(userID);
				response.status(201).json({ message: 'Viewed properties cleared' });
			}
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			if (
				(request.user as UserTokenPayload).role !== 'admin' &&
				parseInt((request.user as UserTokenPayload).id) !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				const lastViewedProperty: ViewedProperty | undefined =
					await this.viewedPropertiesModel.getLastViewedProperty(userID);

				if (lastViewedProperty === undefined) {
					response.status(400).json({ error: 'No viewed properties found' });
					return;
				}

				response.status(200).json(lastViewedProperty);
			}
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
				response.status(404).json({ error: 'User not found' });
				return;
			}

			if (
				(request.user as UserTokenPayload).role !== 'admin' &&
				parseInt((request.user as UserTokenPayload).id) !== userID
			) {
				response.status(403).json({ error: 'Unauthorized' });
				return;
			} else {
				const propertyIDs: any[] = request.body.properties;

				if (propertyIDs === undefined || propertyIDs.length === 0) {
					response.status(400).json({ error: 'No properties provided' });
					return;
				}

				// Validate all properties first
				for (const propertyID of propertyIDs) {
					if (isNaN(parseInt(propertyID))) {
						response.status(400).json({ error: 'Invalid property ID' });
						return;
					}

					if (
						(await this.propertiesModel.getPropertyById(
							parseInt(propertyID),
						)) === undefined
					) {
						response
							.status(404)
							.json({ error: `Property ${propertyID} not found` });
						return;
					}
				}

				await this.viewedPropertiesModel.addMultiplePropertiesAsViewed(
					userID,
					propertyIDs,
				);

				response
					.status(200)
					.json({ message: 'All properties added as viewed' });
			}
		} catch (error) {
			console.error(`Error adding multiple properties as viewed: ${error}`);
			response
				.status(500)
				.json({ error: 'Error adding multiple properties as viewed' });
		}
	};
}

/**
 * Factory function to create a new ViewedPropertiesApi instance.
 * @param {Database} db - The database instance
 * @returns {ViewedPropertiesApi} - The ViewedPropertiesApi instance
 */

export default function viewedPropertiesApiFactory(
	db: NodePgDatabase<typeof schema>,
): ViewedPropertiesApi {
	return new ViewedPropertiesApi(db);
}
