import { Router } from "express";
import userApiFactory, { testApi, UserApi } from "../controllers/user_api";
import { Database } from "better-sqlite3";
import connectionGenerator, { dbProductionOptions } from "../database/init-db";

export default function userRoutesFactory(dbPath: string): Router {
  const db: Database = connectionGenerator(dbPath, dbProductionOptions);
  const router: Router = Router();
  const userApi: UserApi = userApiFactory(db);
    
  router.get("/test", testApi);

  router.get("/:id", userApi.getUserById);

  router.get("/userByEmail/:email", userApi.getUserByEmail);

  router.get("/", userApi.getAllUsers);

  router.delete("/:id", userApi.deleteUser);

  router.put("/username/:id", userApi.updateUserUsername);

  router.put("/email/:id", userApi.updateUserEmail);

  router.get("/hasRole/:id/:role", userApi.hasRole);

  router.get("/name/:id", userApi.getName);

  router.get("/email/:id", userApi.getEmail);

  router.get("/ByUsername/:username", userApi.getUserId);

  router.post("/", userApi.createUser);

  return router;
}
