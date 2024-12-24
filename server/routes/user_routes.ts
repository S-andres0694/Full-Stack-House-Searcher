import { Router } from "express";
import userApiFactory, { testApi, UserApi } from "../controllers/user_api";
import { Database } from "better-sqlite3";
import connectionGenerator, { dbProductionOptions } from "../database/init-db";

export default function userRoutesFactory(dbPath: string): Router {
  const db: Database = connectionGenerator(dbPath, dbProductionOptions);
  const router: Router = Router();
  const userApi: UserApi = userApiFactory(db);
    
  //Tests that the route is alive  
  router.get("/test", testApi);

  //Gets a user by id
  router.get("/:id", userApi.getUserById);

  //Gets all users
  router.get("/", userApi.getAllUsers);

  //Gets a user by email
  router.get("/email/:email", userApi.getUserByEmail);

  //Gets a user's id by username
  router.get("/id/:username", userApi.getUserId);

  //Creates a user
  router.post("/", userApi.createUser);

  //Deletes a user
  router.delete("/:id", userApi.deleteUser);

  //Updates a user's username
  router.put("/:id/username", userApi.updateUserUsername);

  //Updates a user's email
  router.put("/:id/email", userApi.updateUserEmail);

  //Checks if a user has a role
  router.get("/:id/hasRole/:role", userApi.hasRole);

  //Gets a user's name
  router.get("/:id/name", userApi.getName);

  //Gets a user's email
  router.get("/:id/email", userApi.getEmail);

  return router;
}
