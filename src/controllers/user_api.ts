import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Database } from "better-sqlite3";
import connectionGenerator from "../database/init-db";
import usersModelFactory, { UsersModel } from "../models/users";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { User, NewUser } from "../models/table-types";
import { Request, response, Response } from "express";

export class UserApi {
  //Database Connection Instance
  private drizzle: BetterSQLite3Database;
  //Users Model Instance
  private usersModel: UsersModel;

  constructor(private db: Database) {
    this.drizzle = drizzle(db);
    this.usersModel = usersModelFactory(this.drizzle);
  }

  /**
   * Gets a user by their ID.
   * @param {Request} request - The request object containing the user ID
   * @param {Response} response - The response object to send the user data
   */

  getUserById = async (request: Request, response: Response): Promise<void> => {
    try {
      const id: number = parseInt(request.params.id);
      const user: User | undefined = await this.usersModel.getUserById(id);
      if (!user) {
        response.status(404).json({ error: "User not found" });
        return;
      }
      response.json(user);
    } catch (error) {
      response.status(500).json({ error: "Failed to get user by ID" });
    }
  };

  /**
   * Gets a user by their email.
   * @param {Request} request - The request object containing the user email
   * @param {Response} response - The response object to send the user data
   */

  getUserByEmail = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const email: string = request.params.email;
      const user: User | undefined = await this.usersModel.getUserByEmail(
        email
      );
      if (!user) {
        response.status(404).json({ error: "User not found" });
        return;
      }
      response.json(user);
    } catch (error) {
      response.status(500).json({ error: "Failed to get user by email" });
    }
  };

  /**
   * Gets all users.
   * @param {Request} request - The request object
   * @param {Response} response - The response object to send the user data
   */

  getAllUsers = async (request: Request, response: Response): Promise<void> => {
    try {
      const users: User[] = await this.usersModel.getAllUsers();
      if (users.length === 0) {
        response.status(404).json({ error: "No users found" });
        return;
      }
      response.json(users);
    } catch (error) {
      response.status(500).json({ error: "Failed to get all users" });
    }
  };
  
  /**
   * Deletes a user by their ID.
   * @param {Request} request - The request object containing the user ID
   * @param {Response} response - The response object to send the user data
   */

  deleteUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const result: boolean | string = await this.usersModel.deleteUser(id);

    if (result === false) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    if (result === "Internal Database Failure") {
      response.status(500).json({ error: "Failed to delete user" });
      return;
    }

    if (result === true) {
      response.status(204).send();
    }
  };

  /**
   * Updates a user's username.
   * @param {Request} request - The request object containing the user username
   * @param {Response} response - The response object to send the user data
   */

  updateUserUsername = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const newUsername: string = request.body.newUsername;

    if (!newUsername) {
      response.status(400).json({ error: "New username is required" });
      return;
    }

    const result: boolean | string = await this.usersModel.updateUserUsername(
      id,
      newUsername
    );

    if (result === false) {
      response.status(404).json({ error: "Username already exists" });
      return;
    }

    if (result === "Internal Database Failure") {
      response.status(500).json({ error: "Failed to update user" });
      return;
    }

    if (result === true) {
      response.status(204).send();
    }
  };

  /**
   * Updates a user's email.
   * @param {Request} request - The request object containing the user email
   * @param {Response} response - The response object to send the user data
   */

  updateUserEmail = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const newEmail: string = request.body.newEmail;

    if (!newEmail) {
      response.status(400).json({ error: "New email is required" });
      return;
    }

    const result: boolean | string = await this.usersModel.updateUserEmail(
      id,
      newEmail
    );

    if (result === false) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    if (result === "Internal Database Failure") {
      response.status(500).json({ error: "Failed to update user" });
      return;
    }

    if (result === true) {
      response.status(204).send();
    }
  };
}

export default function userApiFactory(db: Database): UserApi {
  return new UserApi(db);
}
