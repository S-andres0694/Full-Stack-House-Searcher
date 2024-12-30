import { Router } from 'express';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
	requiresRoleOf,
} from '../middleware/auth-middleware';
import { User } from '../models/table-types';

export const protectedTestRoutesFactory = (dbPath: string) => {
	const router: Router = Router();

	router.get(
		'/test',
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		requiresRoleOf(['admin']),
		(req, res) => {
			res.status(200).json({
				message: `Hello There!`,
			});
		},
	);

	return router;
};

export default protectedTestRoutesFactory;
