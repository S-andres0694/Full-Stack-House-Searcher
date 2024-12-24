import { Request, Response } from "express";
import rolesModelFactory from "../models/roles";
import { RolesModel } from "../models/roles";
import { Database } from "better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import usersModelFactory, { UsersModel } from "../models/users";
import { drizzle } from "drizzle-orm/better-sqlite3";
/**
 * Test API to make sure that the endpoint is working.
 * @param {Request} request - The request object
 * @param {Response} response - The response object to send the user data
 */

export const testApi = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ message: "Server is running" });
};

export class RolesApi {
    //Database Connection Instance
    private drizzle: BetterSQLite3Database;
    //Roles Model Instance
    private rolesModel: RolesModel;
    //Users Model Instance
    private usersModel: UsersModel;

    constructor(private db: Database) {
        this.drizzle = drizzle(db);
        this.rolesModel = rolesModelFactory(this.drizzle);
        this.usersModel = usersModelFactory(this.drizzle);
    }

    /**
     * Creates a new role in the database.
     * @param {Request} request - The request object containing the role name and description
     * @param {Response} response - The response object to send the role data
     */
    createRole = async (request: Request, response: Response): Promise<void> => {
        const { name, description } = request.body;
        if (!name || !description) {
            response.status(400).json({ error: "Name and description are required" });
            return;
        }

        if (await this.rolesModel.checkRoleExists(name)) {
            response.status(400).json({ error: "Role already exists" });
            return;
        }

        await this.rolesModel.createRole(name, description);
        response.status(201).json({ message: "Role created" });
    };

    /**
     * Removes a role from the database.
     * @param {Request} request - The request object containing the role ID
     * @param {Response} response - The response object to send the role data
     */
    deleteRole = async (request: Request, response: Response): Promise<void> => {
        const { id } = request.params;
        const roleName: string | undefined = await this.rolesModel.getRoleName(parseInt(id));

        if (!roleName) {
            response.status(404).json({ error: "Role not found" });
            return;
        }

        await this.rolesModel.deleteRole(parseInt(id));
        response.status(200).json({ message: "Role deleted" });
    };

    /**
     * Retrieves all roles from the database.
     * @param {Request} request - The request object
     * @param {Response} response - The response object to send the role data
     */

    getAllRoles = async (request: Request, response: Response): Promise<void> => {
        const roles = await this.rolesModel.getAllRoles();

        if (roles.length === 0) {
            response.status(404).json({ error: "No roles found" });
            return;
        }

        response.status(200).json(roles);
    };

    /**
     * Checks if a role exists in the database.
     * @param {Request} request - The request object containing the role name
     * @param {Response} response - The response object to send the role data
     */
    checkRoleExists = async (request: Request, response: Response): Promise<void> => {
        const { name } = request.params;

        if (!name) {
            response.status(400).json({ error: "Name is required" });
            return;
        }

        const roleExists = await this.rolesModel.checkRoleExists(name);
        response.status(200).json({ exists: roleExists });
    };

    /**
     * Retrieves the ID of a role by its name.
     * @param {Request} request - The request object containing the role name
     * @param {Response} response - The response object to send the role data
     */
    getRoleId = async (request: Request, response: Response): Promise<void> => {
        const { name } = request.params;

        if (!name) {
            response.status(400).json({ error: "Name is required" });
            return;
        }

        const roleId = await this.rolesModel.getRoleId(name);

        if (!roleId) {
            response.status(404).json({ error: "Role not found" });
            return;
        }

        response.status(200).json({ id: roleId });
    };

    /**
     * Retrieves the name of a role by its ID.
     * @param {Request} request - The request object containing the role ID
     * @param {Response} response - The response object to send the role data
     */
    getRoleName = async (request: Request, response: Response): Promise<void> => {
        const { id } = request.params;
        const roleName = await this.rolesModel.getRoleName(parseInt(id));
        response.status(200).json({ name: roleName });
    };
}

export default function rolesApiFactory(db: Database): RolesApi {
    return new RolesApi(db);
}