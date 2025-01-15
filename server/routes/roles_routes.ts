import { Router } from 'express';
import rolesApiFactory, { RolesApi } from '../controllers/roles_api';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { testApi } from '../controllers/roles_api';
import { requiresRoleOf } from '../middleware/auth-middleware';
import { isUserLoggedInThroughJWT } from '../middleware/auth-middleware';
import { isUserLoggedInThroughGoogle } from '../middleware/auth-middleware';
import { PoolConfig } from 'pg';

export default function rolesRoutesFactory(
	db: NodePgDatabase<typeof schema>,
): Router {
	const router: Router = Router();
	const rolesApi: RolesApi = rolesApiFactory(db);

	//Tests that the route is alive
	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		testApi,
	);

	//Creates a role
	router.post(
		'/',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		rolesApi.createRole,
	);

	//Deletes a role
	router.delete(
		'/:id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		rolesApi.deleteRole,
	);

	//Gets all roles
	router.get(
		'/',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		rolesApi.getAllRoles,
	);

	//Checks if a role exists
	router.get(
		'/:name',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin', 'user']),
		rolesApi.checkRoleExists,
	);

	//Gets the ID of a role by its name
	router.get(
		'/:name/id',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		rolesApi.getRoleId,
	);

	//Gets the name of a role by its ID
	router.get(
		'/:id/name',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		rolesApi.getRoleName,
	);

	return router;
}
