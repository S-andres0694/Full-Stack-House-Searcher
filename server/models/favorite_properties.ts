import { favorites } from '../database/schema';
import { Favorite, NewFavorite } from '../types/table-types';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

/**
 * Class representing a model for favorite properties operations in the database.
 */
export class FavoritePropertiesModel {
	constructor(private db: NodePgDatabase<typeof schema>) {}

	/**
	 * Retrieves all favorite properties for a specific user from the database.
	 * @param {number} userId - The ID of the user whose favorite properties to retrieve
	 * @returns {Promise<Favorite[]>} A promise that resolves to an array of favorite properties
	 */
	async getAllFavoriteProperties(userId: number): Promise<Favorite[]> {
		return await this.db
			.select()
			.from(favorites)
			.where(eq(favorites.userId, userId));
	}

	/**
	 * Adds a new favorite property record to the database.
	 * @param {NewFavorite} favorite - The favorite property object to add
	 */
	async addFavoriteProperty(favorite: NewFavorite): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx.insert(favorites).values(favorite);
			});
		} catch (error) {
			throw new Error('Failed to add favorite property');
		}
	}

	/**
	 * Deletes a favorite property record from the database.
	 * @param {number} propertyID - The ID of the favorite property to delete
	 * @param {number} userID - The ID of the user whose favorite property to delete
	 * @returns {Promise<void>} A promise that resolves when the deletion is complete
	 */
	async deleteFavoriteProperty(
		propertyID: number,
		userID: number,
	): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx
					.delete(favorites)
					.where(
						and(
							eq(favorites.propertyId, propertyID),
							eq(favorites.userId, userID),
						),
					);
			});
		} catch (error) {
			throw new Error('Failed to delete favorite property');
		}
	}

	/**
	 * Clears all favorite property records for a specific user from the database.
	 * @param {number} userId - The ID of the user whose favorite properties to clear
	 * @returns {Promise<void>} A promise that resolves when the deletion is complete
	 */
	async clearFavoriteProperties(userId: number): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx.delete(favorites).where(eq(favorites.userId, userId));
			});
		} catch (error) {
			throw new Error('Failed to clear favorite properties');
		}
	}

	/**
	 * Retrieves the count of favorite properties for a specific user from the database.
	 * @param {number} userId - The ID of the user whose favorite properties count to retrieve
	 * @returns {Promise<number>} The count of favorite properties for the user
	 */
	async getFavoritePropertiesCount(userId: number): Promise<string> {
		const count: { count: number }[] = await this.db
			.select({ count: sql<number>`count(${favorites.id})` })
			.from(favorites)
			.where(eq(favorites.userId, userId));
		return count[0].count.toString();
	}
}

export default function favoritePropertiesModelFactory(
	db: NodePgDatabase<typeof schema>,
): FavoritePropertiesModel {
	return new FavoritePropertiesModel(db);
}
