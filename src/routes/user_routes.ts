import { Router } from "express";
import userApiFactory, { UserApi } from "../controllers/user_api";
import { Database } from "better-sqlite3";
import connectionGenerator, { dbProductionOptions } from "../database/init-db";
import app from "../app";

const dbPath: string = __dirname + "/../database/database.sqlite";
const db: Database = connectionGenerator(dbPath, dbProductionOptions);
const router: Router = Router();
const userApi: UserApi = userApiFactory(db);

router.get("/userByID/:id", userApi.getUserById);

router.get("/userByEmail/:email", userApi.getUserByEmail);

router.get("/allUsers", userApi.getAllUsers);

router.delete("/deleteUser/:id", userApi.deleteUser);

router.put("/updateUserUsername/:id", userApi.updateUserUsername);

router.put("/updateUserEmail/:id", userApi.updateUserEmail);

export default router;
