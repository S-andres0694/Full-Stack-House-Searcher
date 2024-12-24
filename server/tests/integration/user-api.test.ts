import request from "supertest";
import { Application } from "express";
import express from "express";
import { testDbPath } from "../jest.setup";
import {
  dbTestOptions,
  initialValues,
  resetDatabase,
} from "../../database/init-db";
import connectionGenerator from "../../database/init-db";
import { Database } from "better-sqlite3";
import morgan from "morgan";
import userRoutesFactory from "../../routes/user_routes";
import { user, user2 } from "../constants";
import { NewUser, User } from "../../models/table-types";
import { Server } from "http";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import usersModelFactory from "../../models/users";
import { UsersModel } from "../../models/users";
import { users } from "../../database/schema";

let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
const port: number = 4000;
let server: Server;
let userModel: UsersModel;

beforeAll(() => {
  app = express();
  dbConnection = connectionGenerator(testDbPath, dbTestOptions);
  db = drizzle(dbConnection);
  userModel = usersModelFactory(db);

  //Logging middleware
  app.use(morgan("common"));
  //Extra middleware
  app.use(express.json());
  //Routes
  app.use("/users", userRoutesFactory(testDbPath));
  //Start the server
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

beforeEach(async () => {
  await resetDatabase(dbConnection, dbTestOptions);
  await initialValues(dbConnection);
});

describe("User API Testing", () => {
  it("tests that the endpoint works and that the server is running", async () => {
    const response = await request(app).get("/users/test");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Server is running");
  });

  it("tests that the create user endpoint works", async () => {
    //Checks the response behavior
    const response = await request(app).post("/users").send(user);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    //Checks the database behavior
    const addedUser: User = (await userModel.getUserByUsername(user.username))!;
    expect(addedUser.username).toBe(user.username);
    expect(addedUser.email).toBe(user.email);
    expect(addedUser.name).toBe(user.name);
    expect(addedUser.role).toBe(user.role);
  });
});

afterAll(() => {
  //Close the server
  server.close();
});
