import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Router } from "express";
import * as schema from '../database/schema';
import userApiFactory from "../controllers/user_api";
import { UserApi } from "../controllers/user_api";


export default function publicRoutesFactory(
	db: NodePgDatabase<typeof schema>,
): Router {
    const router: Router = Router();
    const userApi: UserApi = userApiFactory(db);

	//Checks if an email exists
	router.get('/check-email/:email', userApi.checkEmailExists);

	//Checks if a username exists
	router.get('/check-username/:username', userApi.checkUsernameExists);

	return router;
}
