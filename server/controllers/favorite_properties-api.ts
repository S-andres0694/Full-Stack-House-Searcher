import { Database } from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { Request, Response } from 'express';
import { FavoritePropertiesModel } from '../models/favorite_properties';
import favoritePropertiesModelFactory from '../models/favorite_properties';
import usersModelFactory, { UsersModel } from '../models/users';
import propertiesModelFactory, { PropertiesModel } from '../models/properties';
import { Favorite, NewFavorite, User } from '../types/table-types';
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
 * Class containing all of the favorite properties API endpoints and their handler functions.
 */

export class FavoritePropertiesApi {
	//Favorite Properties Model Instance
	private favoritePropertiesModel: FavoritePropertiesModel;
	//Users Model Instance
	private usersModel: UsersModel;
	//Properties Model Instance
	private propertiesModel: PropertiesModel;

	constructor(private db: NodePgDatabase<typeof schema>) {
		this.favoritePropertiesModel = favoritePropertiesModelFactory(this.db);
		this.usersModel = usersModelFactory(this.db);
		this.propertiesModel = propertiesModelFactory(this.db);
	}

	/**
	 * Retrieves all favorite properties for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	/**
	 * Retrieves all favorite properties for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	getAllFavoriteProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const userId: number = parseInt(request.params.userId);

			if (isNaN(userId)) {
				response.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userId)) === undefined) {
				response.status(404).json({ message: 'User not found' });
				return;
			}

			if (
				(request.user as User).role === 'admin' ||
				(request.user as User).id === userId
			) {
				const favoriteProperties: Favorite[] =
					await this.favoritePropertiesModel.getAllFavoriteProperties(userId);
				response.status(200).json({ favoriteProperties: favoriteProperties });
			} else {
				response.status(403).json({ message: 'Forbidden' });
			}
		} catch (error) {
			console.error(error);
			response
				.status(500)
				.json({ message: 'Failed to get favorite properties' });
		}
	};

	/**
	 * Adds a new favorite property record to the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	addFavoriteProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const userID: number = parseInt(request.params.userId);
		const propertyID: number = parseInt(request.body.propertyId);

		try {
			if (isNaN(userID)) {
				response.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(404).json({ message: 'User not found' });
				return;
			}

			if (
				(request.user as User).role === 'admin' ||
				(request.user as User).id === userID
			) {
				if (isNaN(propertyID)) {
					response.status(400).json({ message: 'Invalid property ID' });
					return;
				}

				if (
					(await this.propertiesModel.getPropertyById(propertyID)) === undefined
				) {
					response.status(404).json({ message: 'Property not found' });
					return;
				}

				const favoriteProperty: NewFavorite = {
					userId: userID,
					propertyId: propertyID,
				};

				await this.favoritePropertiesModel.addFavoriteProperty(
					favoriteProperty,
				);
				response.status(200).json({ message: 'Favorite property added' });
			} else {
				response.status(403).json({ message: 'Forbidden' });
			}
		} catch (error) {
			console.error(error);
			response.status(500).json({ message: 'Failed to add favorite property' });
		}
	};

	/**
	 * Deletes a favorite property record from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	deleteFavoriteProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const userID: number = parseInt(request.params.userId);
		const propertyID: number = parseInt(request.body.propertyId);

		try {
			if (isNaN(userID)) {
				response.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(404).json({ message: 'User not found' });
				return;
			}

			if (
				(request.user as User).role === 'admin' ||
				(request.user as User).id === userID
			) {
				if (isNaN(propertyID)) {
					response
						.status(400)
						.json({ message: 'Invalid or missing property ID' });
					return;
				}

				if (
					(await this.propertiesModel.getPropertyById(propertyID)) === undefined
				) {
					response.status(404).json({ message: 'Property not found' });
					return;
				}

				await this.favoritePropertiesModel.deleteFavoriteProperty(
					propertyID,
					userID,
				);

				response.status(200).json({ message: 'Favorite property deleted' });
			} else {
				response.status(403).json({ message: 'Forbidden' });
			}
		} catch (error) {
			console.error(error);
			response
				.status(500)
				.json({ message: 'Failed to delete favorite property' });
		}
	};

	/**
	 * Clears all favorite property records for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	clearFavoriteProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const userID: number = parseInt(request.params.userId);

		try {
			if (isNaN(userID)) {
				response.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(404).json({ message: 'User not found' });
				return;
			}

			if (
				(request.user as User).role === 'admin' ||
				(request.user as User).id === userID
			) {
				await this.favoritePropertiesModel.clearFavoriteProperties(userID);
				response.status(200).json({ message: 'Favorite properties cleared' });
			} else {
				response.status(403).json({ message: 'Forbidden' });
			}
		} catch (error) {
			console.error(error);
			response
				.status(500)
				.json({ message: 'Failed to clear favorite properties' });
		}
	};

	/**
	 * Retrieves the count of favorite properties for a specific user from the database.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */
	getFavoritePropertiesCount = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const userID: number = parseInt(request.params.userId);
		try {
			if (isNaN(userID)) {
				response.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			if ((await this.usersModel.getUserById(userID)) === undefined) {
				response.status(404).json({ message: 'User not found' });
				return;
			}

			if (
				(request.user as User).role === 'admin' ||
				(request.user as User).id === userID
			) {
				const count: number =
					await this.favoritePropertiesModel.getFavoritePropertiesCount(userID);
				response.status(200).json({ count: count });
			} else {
				response.status(403).json({ message: 'Forbidden' });
			}
		} catch (error) {
			console.error(error);
			response
				.status(500)
				.json({ message: 'Failed to get favorite properties count' });
		}
	};
}

/**
 * Factory function to create a new instance of the FavoritePropertiesApi class.
 * @param {Database} db - The database instance
 * @returns {FavoritePropertiesApi} A new instance of the FavoritePropertiesApi class
 */

export default function favoritePropertiesApiFactory(
	db: NodePgDatabase<typeof schema>,
): FavoritePropertiesApi {
	return new FavoritePropertiesApi(db);
}
