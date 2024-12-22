import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { roles } from "../database/schema";
import { Role } from "./table-types";
import connectionGenerator, { databasePath } from "../database/init-db";
import { eq } from "drizzle-orm";

const databaseConnection = connectionGenerator(databasePath);
const db: BetterSQLite3Database = drizzle({ client: databaseConnection });

/**
 * Class representing a model for role operations in the database.
 */
class RolesModel {
    constructor(private db: BetterSQLite3Database) { }

    /**
     * Creates a new role in the database.
     * @param {string} name - The name of the role to create
     * @returns {Promise<Role>} The newly created role
     */
    async createRole(name: string): Promise<Role> {
        const [role] = await this.db
            .insert(roles)
            .values({ roleName: name })
            .returning();
        return role;
    }

    /**
     * Removes a role from the database.
     * @param {number} roleId - The ID of the role to remove
     * @returns {Promise<Role | undefined>} The deleted role if found, undefined otherwise
     */
    async deleteRole(roleId: number): Promise<Role | undefined> {
        const [deletedRole] = await this.db
            .delete(roles)
            .where(eq(roles.id, roleId))
            .returning();
        return deletedRole;
    }
}

export default function rolesModelFactory(db: BetterSQLite3Database): RolesModel {
    return new RolesModel(db);
}
