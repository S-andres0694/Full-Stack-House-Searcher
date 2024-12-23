import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { favorites } from "../database/schema";
import { Favorite, NewFavorite } from "./table-types";
import { eq, sql } from "drizzle-orm";


/**
 * Class representing a model for favorite properties operations in the database.
 */
class FavoritePropertiesModel {
    constructor(private db: BetterSQLite3Database) { }

    /**
     * Retrieves all favorite properties for a specific user from the database.
     * @param {number} userId - The ID of the user whose favorite properties to retrieve
     * @returns {Promise<Favorite[]>} A promise that resolves to an array of favorite properties
     */
    async getAllFavoriteProperties(userId: number): Promise<Favorite[]> {
        return await this.db.select().from(favorites).where(eq(favorites.userId, userId));
    }

    /**
     * Adds a new favorite property record to the database.
     * @param {NewFavorite} favorite - The favorite property object to add
     * @returns {Promise<number>} The ID of the newly created favorite property
     */
    async addFavoriteProperty(favorite: NewFavorite): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.insert(favorites).values(favorite);
            });
        } catch (error) {
            throw new Error("Failed to add favorite property");
        }
    }

    /**
     * Deletes a favorite property record from the database.
     * @param {number} id - The ID of the favorite property to delete
     * @returns {Promise<void>} A promise that resolves when the deletion is complete
     */
    async deleteFavoriteProperty(id: number): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.delete(favorites).where(eq(favorites.id, id));
            });
        } catch (error) {
            throw new Error("Failed to delete favorite property");
        }
    }

    /**
     * Clears all favorite property records for a specific user from the database.
     * @param {number} userId - The ID of the user whose favorite properties to clear
     * @returns {Promise<void>} A promise that resolves when the deletion is complete
     */
    async clearFavoriteProperties(userId: number): Promise<void> {
        try {
            this.db.transaction(async (tx) => {
                await tx.delete(favorites).where(eq(favorites.userId, userId));
            });
        } catch (error) {
            throw new Error("Failed to clear favorite properties");
        }
    }

    /**
     * Retrieves the count of favorite properties for a specific user from the database.
     * @param {number} userId - The ID of the user whose favorite properties count to retrieve
     * @returns {Promise<number>} The count of favorite properties for the user
     */
    async getFavoritePropertiesCount(userId: number): Promise<number> {
        const [count] = await this.db.select({ count: sql<number>`count(${favorites.id})` }).from(favorites).where(eq(favorites.userId, userId));
        return count.count;
    }
}

export default function favoritePropertiesModelFactory(db: BetterSQLite3Database): FavoritePropertiesModel {
    return new FavoritePropertiesModel(db);
}