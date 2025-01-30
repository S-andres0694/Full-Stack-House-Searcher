import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Router } from 'express';
import * as schema from '../database/schema';
import InvitationTokenApi from '../controllers/invitation_token-api';
import { testApi } from '../controllers/invitation_token-api';
import { requiresRoleOf } from '../middleware/auth-middleware';
import { isUserLoggedInThroughGoogle } from '../middleware/auth-middleware';
import { isUserLoggedInThroughJWT } from '../middleware/auth-middleware';

export default function invitationTokenRoutesFactory(
	db: NodePgDatabase<typeof schema>,
): Router {
	const router: Router = Router();
	const invitationTokenApi: InvitationTokenApi = new InvitationTokenApi(db);

	//Tests that the route is alive
	router.get('/test', testApi);

	//Generates an invitation token
	router.post(
		'/generate',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		invitationTokenApi.generateInvitationToken,
	);

	//Verifies an invitation token
	router.get('/verify/:token', invitationTokenApi.verifyInvitationToken);

	//Consumes an invitation token
	router.post(
		'/consume/:token',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		invitationTokenApi.consumeInvitationToken,
	);

	return router;
}
