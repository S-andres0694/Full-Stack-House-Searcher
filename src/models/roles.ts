import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { roles } from "../database/schema";
import { Role } from "./table-types";
import { eq } from "drizzle-orm";

/**
 * Class representing a model for role operations in the database.
 */
export class RolesModel {
    constructor(private db: BetterSQLite3Database) { }

    /**
     * Creates a new role in the database.
     * @param {string} name - The name of the role to create
     * @returns {Promise<Role>} The newly created role
     */
    async createRole(name: string, description: string): Promise<Role> {
        const [role] = await this.db
            .insert(roles)
            .values({ roleName: name, description: description })
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

    /**
     * Retrieves all roles from the database.
     * @returns {Promise<Role[]>} A promise that resolves to an array of roles
     */
    async getAllRoles(): Promise<Role[]> {
        const rolesArray: Role[] = await this.db.select().from(roles);
        return rolesArray;
    }

    /**
     * Check if a role exists in the database.
     * @param {string} roleName - The name of the role to check
     * @returns {Promise<boolean>} A promise that resolves to true if the role exists, false otherwise
     */
    async checkRoleExists(roleName: string): Promise<boolean> {
        const role = await this.db.select().from(roles).where(eq(roles.roleName, roleName));
        return role.length > 0;
    }
}

export default function rolesModelFactory(db: BetterSQLite3Database): RolesModel {
    return new RolesModel(db);
}
