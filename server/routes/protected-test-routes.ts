import { Router } from 'express';
import { isUserLoggedInThroughGoogle } from '../middleware/auth-middleware';
import { User } from '../models/table-types';

export const protectedTestRoutesFactory = (dbPath: string) => {
	const router: Router = Router();

	router.get('/test', isUserLoggedInThroughGoogle, (req, res) => {
		const user = req.user as User;
		res.status(200).json({
			message: `Hello ${user.name}!`,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			},
		});
	});

	return router;
};

export default protectedTestRoutesFactory;
