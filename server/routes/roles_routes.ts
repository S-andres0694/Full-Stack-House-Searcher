import { Router } from "express";
import rolesApiFactory, { RolesApi } from "../controllers/roles_api";
import { Database } from "better-sqlite3";
import connectionGenerator, { dbProductionOptions } from "../database/init-db";
import { testApi } from "../controllers/roles_api";

export default function rolesRoutesFactory(dbPath: string): Router {
    const router: Router = Router();
    const db: Database = connectionGenerator(dbPath, dbProductionOptions);
    const rolesApi: RolesApi = rolesApiFactory(db);

    //Tests that the route is alive  
    router.get("/test", testApi);

    //Creates a role
    router.post("/", rolesApi.createRole);

    //Deletes a role
    router.delete("/:id", rolesApi.deleteRole);

    //Gets all roles
    router.get("/", rolesApi.getAllRoles);

    //Checks if a role exists
    router.get("/:name", rolesApi.checkRoleExists);

    //Gets the ID of a role by its name
    router.get("/:name/id", rolesApi.getRoleId);

    //Gets the name of a role by its ID
    router.get("/:id/name", rolesApi.getRoleName);

    return router;
}