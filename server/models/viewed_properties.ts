import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { viewedProperties } from "../database/schema";
import { NewViewedProperty, Property, ViewedProperty } from "./table-types";
import { eq, sql, desc } from "drizzle-orm";
/**
 * Class representing a model for viewed properties operations in the database.
 */
export class ViewedPropertiesModel {
    constructor(private db: BetterSQLite3Database) { }

    /**
     * Retrieves all viewed properties for a specific user from the database.
     * @param {number} userId - The ID of the user whose viewed properties to retrieve
     * @returns {Promise<ViewedProperty[]>} A promise that resolves to an array of viewed properties
     */
    async getAllViewedPropertiesFromUser(userId: number): Promise<ViewedProperty[]> {
        return await this.db
            .select()
            .from(viewedProperties)
            .where(eq(viewedProperties.userId, userId));
    }

    /**
     * Creates a new viewed property record in the database.
     * @param {NewViewedProperty} viewedProperty - The viewed property object to create
     * @returns {Promise<number>} The ID of the newly created viewed property
     */
    async addPropertyAsViewed(viewedProperty: NewViewedProperty): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.insert(viewedProperties).values(viewedProperty);
            });
        } catch (error) {
            throw new Error("Failed to add property as viewed");
        }
    }

    /**
     * Deletes a viewed property record from the database.
     * @param {number} id - The ID of the viewed property to delete
     * @returns {Promise<void>} A promise that resolves when the deletion is complete
     */
    async deleteViewedProperty(id: number): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.delete(viewedProperties).where(eq(viewedProperties.id, id));
            });
        } catch (error) {
            throw new Error("Failed to delete viewed property");
        }
    }

    /**
     * Clears all viewed property records for a specific user from the database.
     * @param {number} userId - The ID of the user whose viewed properties to clear
     * @returns {Promise<void>} A promise that resolves when the deletion is complete
     */
    async clearViewedProperties(userId: number): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.delete(viewedProperties).where(eq(viewedProperties.userId, userId));
            });
        } catch (error) {
            throw new Error("Failed to clear viewed properties");
        }
    }

    /**
     * Retrieves the count of viewed properties for a specific user from the database.
     * @param {number} userId - The ID of the user whose viewed properties count to retrieve
     * @returns {Promise<number>} The count of viewed properties for the user
     */
    async getViewedPropertiesCount(userId: number): Promise<number> {
        const [count] = await this.db.select({ count: sql<number>`count(${viewedProperties.id})` }).from(viewedProperties).where(eq(viewedProperties.userId, userId));
        return count.count;
    }

    /**
     * Retrieves the last viewed property for a specific user from the database.
     * @param {number} userId - The ID of the user whose last viewed property to retrieve
     * @returns {Promise<ViewedProperty | undefined>} The last viewed property for the user, or undefined if none exists
     */
    async getLastViewedProperty(userId: number): Promise<ViewedProperty | undefined> {
        const [lastViewedProperty]: ViewedProperty[] = await this.db.select().from(viewedProperties).where(eq(viewedProperties.userId, userId)).orderBy(desc(viewedProperties.id)).limit(1);
        return lastViewedProperty;
    }

    /**
     * Adds multiple properties as viewed for a specific user.
     * @param {number} userId - The ID of the user who viewed the properties
     * @param {Property[]} properties - Array of properties to mark as viewed
     * @returns {Promise<number>} How many properties were added as viewed.
     */
    async addMultiplePropertiesAsViewed(userId: number, properties: Property[]): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                properties.forEach(async (property) => {
                    await tx.insert(viewedProperties).values({
                        userId: userId,
                        propertyId: property.id
                    });
                });
            });
        } catch (error) {
            throw new Error("Failed to add multiple properties as viewed");
        }
    }
}

export default function viewedPropertiesModelFactory(db: BetterSQLite3Database): ViewedPropertiesModel {
    return new ViewedPropertiesModel(db);
}