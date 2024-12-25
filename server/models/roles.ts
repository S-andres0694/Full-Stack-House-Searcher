import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { roles } from '../database/schema';
import { Role } from './table-types';
import { eq } from 'drizzle-orm';

/**
 * Class representing a model for role operations in the database.
 */
export class RolesModel {
  constructor(private db: BetterSQLite3Database) {}

  /**
   * Creates a new role in the database.
   * @param {string} name - The name of the role to create
   * @returns {Promise<Role>} The newly created role
   */
  async createRole(name: string, description: string): Promise<void> {
    try {
      this.db.transaction(async (tx) => {
        await tx
          .insert(roles)
          .values({ roleName: name, description: description });
      });
    } catch (error: any) {
      console.error(`Error creating role: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Removes a role from the database.
   * @param {number} roleId - The ID of the role to remove
   */
  async deleteRole(roleId: number): Promise<void> {
    try {
      this.db.transaction(async (tx) => {
        await tx.delete(roles).where(eq(roles.id, roleId));
      });
    } catch (error: any) {
      console.error(`Error deleting role: ${error.stack}`);
      throw error;
    }
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
    const role = await this.db
      .select()
      .from(roles)
      .where(eq(roles.roleName, roleName));
    return role.length > 0;
  }

  /**
   * Retrieves the ID of a role by its name.
   * @param {string} roleName - The name of the role to retrieve the ID for
   * @returns {Promise<number | undefined>} The ID of the role if found, undefined otherwise
   */
  async getRoleId(roleName: string): Promise<number | undefined> {
    const role = await this.db
      .select()
      .from(roles)
      .where(eq(roles.roleName, roleName));
    return role[0]?.id;
  }

  /**
   * Retrieves the name of a role by its ID.
   * @param {number} roleId - The ID of the role to retrieve the name for
   * @returns {Promise<string | undefined>} The name of the role if found, undefined otherwise
   */
  async getRoleName(roleId: number): Promise<string | undefined> {
    const role = await this.db.select().from(roles).where(eq(roles.id, roleId));
    return role[0]?.roleName;
  }
}

export default function rolesModelFactory(
  db: BetterSQLite3Database,
): RolesModel {
  return new RolesModel(db);
}
