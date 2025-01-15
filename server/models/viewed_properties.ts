import { viewedProperties } from '../database/schema';
import { NewViewedProperty, ViewedProperty } from '../types/table-types';
import { eq, sql, desc, and } from 'drizzle-orm';
import { users, properties } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

/**
 * Class representing a model for viewed properties operations in the database.
 */
export class ViewedPropertiesModel {
	constructor(private db: NodePgDatabase<typeof schema>) {}

	/**
	 * Retrieves all viewed properties for a specific user from the database.
	 * @param {number} userId - The ID of the user whose viewed properties to retrieve
	 * @returns {Promise<ViewedProperty[] | undefined>} A promise that resolves to an array of viewed properties or undefined if no properties are found
	 */
	async getAllViewedPropertiesFromUser(
		userId: number,
	): Promise<ViewedProperty[] | undefined> {
		const properties: ViewedProperty[] = await this.db
			.select()
			.from(viewedProperties)
			.where(eq(viewedProperties.userId, userId));
		return properties;
	}

	/**
	 * Creates a new viewed property record in the database.
	 * @param {NewViewedProperty} viewedProperty - The viewed property object to create
	 * @returns {Promise<number>} The ID of the newly created viewed property
	 */
	async addPropertyAsViewed(viewedProperty: NewViewedProperty): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx.insert(viewedProperties).values(viewedProperty);
			});
		} catch (error) {
			throw new Error('Failed to add property as viewed');
		}
	}

	/**
	 * Deletes a viewed property record from the database.
	 * @param {NewViewedProperty} viewedProperty - The viewed property object to delete
	 * @returns {Promise<void>} A promise that resolves when the deletion is complete
	 */
	async deleteViewedProperty(viewedProperty: NewViewedProperty): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx
					.delete(viewedProperties)
					.where(
						and(
							eq(viewedProperties.propertyId, viewedProperty.propertyId),
							eq(viewedProperties.userId, viewedProperty.userId),
						),
					);
			});
		} catch (error) {
			throw new Error('Failed to delete viewed property');
		}
	}

	/**
	 * Clears all viewed property records for a specific user from the database.
	 * @param {number} userId - The ID of the user whose viewed properties to clear
	 * @returns {Promise<void>} A promise that resolves when the deletion is complete
	 */
	async clearViewedProperties(userId: number): Promise<void> {
		try {
			await this.db.transaction(async (tx) => {
				await tx
					.delete(viewedProperties)
					.where(eq(viewedProperties.userId, userId));
			});
		} catch (error) {
			throw new Error('Failed to clear viewed properties');
		}
	}

	/**
	 * Retrieves the count of viewed properties for a specific user from the database.
	 * @param {number} userId - The ID of the user whose viewed properties count to retrieve
	 * @returns {Promise<number>} The count of viewed properties for the user
	 */
	async getViewedPropertiesCount(userId: number): Promise<string> {
		const count: { count: number }[] = await this.db
			.select({ count: sql<number>`count(${viewedProperties.id})` })
			.from(viewedProperties)
			.where(eq(viewedProperties.userId, userId));
		return count[0].count.toString();
	}

	/**
	 * Retrieves the last viewed property for a specific user from the database.
	 * @param {number} userId - The ID of the user whose last viewed property to retrieve
	 * @returns {Promise<ViewedProperty | undefined>} The last viewed property for the user, or undefined if none exists
	 */
	async getLastViewedProperty(
		userId: number,
	): Promise<ViewedProperty | undefined> {
		const [lastViewedProperty]: ViewedProperty[] = await this.db
			.select()
			.from(viewedProperties)
			.where(eq(viewedProperties.userId, userId))
			.orderBy(desc(viewedProperties.id))
			.limit(1);
		return lastViewedProperty;
	}

	/**
	 * Adds multiple properties as viewed for a specific user.
	 * @param {number} userId - The ID of the user to add the properties to
	 * @param {number[]} propertyIds - The IDs of the properties to add
	 * @returns {Promise<void>} A promise that resolves when the addition is complete
	 */
	async addMultiplePropertiesAsViewed(
		userId: number,
		propertyIds: number[],
	): Promise<void> {
		try {
			// Check if user exists using Drizzle ORM SQL
			const userExists = await this.db
				.select({
					exists: sql<boolean>`exists(select 1 from users where id = ${userId})`,
				})
				.from(users)
				.then(([result]) => result.exists);
			if (!userExists) {
				throw new Error(`User with ID ${userId} does not exist`);
			}

			// Check if all properties exist using Drizzle ORM SQL
			for (const propertyId of propertyIds) {
				const propertyExists = await this.db
					.select({
						exists: sql<boolean>`exists(select 1 from properties where id = ${propertyId})`,
					})
					.from(properties)
					.then(([result]) => result.exists);
				if (!propertyExists) {
					throw new Error(`Property with ID ${propertyId} does not exist`);
				}
			}

			await this.db.transaction(async (tx) => {
				await tx
					.insert(viewedProperties)
					.values(propertyIds.map((propertyId) => ({ userId, propertyId })));
			});
		} catch (error) {
			throw new Error('Failed to add multiple properties as viewed');
		}
	}
}

export default function viewedPropertiesModelFactory(
	db: NodePgDatabase<typeof schema>,
): ViewedPropertiesModel {
	return new ViewedPropertiesModel(db);
}
