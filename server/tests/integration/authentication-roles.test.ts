import { Database } from 'better-sqlite3';
import { Application } from 'express';
import usersModelFactory, { UsersModel } from '../../models/users';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { request, Server } from 'http';
import {
	dbTestOptions,
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import connectionGenerator from '../../database/init-db';
import { testDbPath } from '../jest.setup';
import express from 'express';
import morgan from 'morgan';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import { isUserLoggedInThroughGoogle } from '../../middleware/auth-middleware';
import { isUserLoggedInThroughJWT } from '../../middleware/auth-middleware';
import { addBearerToken } from '../../middleware/auth-middleware';
import userRoutesFactory from '../../routes/user_routes';
import sessionMiddleware from '../../middleware/express-session-config';
import { passportObj } from '../../authentication/google-auth.config';
import cookieParser from 'cookie-parser';

let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
const port: number = 4000;
let server: Server;
let adminAccessJwtToken: string;
let userAccessJwtToken: string;
let userModel: UsersModel;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD!;
const testUserEmail: string = process.env.TEST_USER_EMAIL!;
const testUserPassword: string = process.env.TEST_USER_PASSWORD!;

beforeAll(async () => {
	app = express();
	dbConnection = connectionGenerator(testDbPath, dbTestOptions);
	db = drizzle(dbConnection);
	userModel = usersModelFactory(db);

	await userModel.createUser({
		username: 'A Test User',
		email: testUserEmail,
		password: testUserPassword,
		role: 'user',
		name: 'Test User',
	});

	//Logging middleware
	app.use(morgan('common'));
	//Extra middleware
	app.use(express.json());

	//Authentication routes
	app.use('/auth', authenticationRoutesFactory(testDbPath));

	//Start the server
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	//Login the Admin User
	const adminResponse: Response = await fetch(
		`http://localhost:${port}/auth/login`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
		},
	);

	adminAccessJwtToken = (await adminResponse.json()).accessToken;

	//Login the Test User
	const userResponse: Response = await fetch(
		`http://localhost:${port}/auth/login`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: testUserEmail,
				password: testUserPassword,
			}),
		},
	);

	userAccessJwtToken = (await userResponse.json()).accessToken;

	server.close();

	app.use(sessionMiddleware);
	app.use(cookieParser());
	app.use(passportObj.initialize());
	app.use(passportObj.session());

	app.use('/users', userRoutesFactory(testDbPath));

	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});

beforeEach(async () => {
	await resetDatabase(dbConnection, dbTestOptions);
	await initialValues(dbConnection);
});

afterAll(() => {
	server.close();
});

describe('Authentication and Roles API Testing', () => {
	it('tests that only the admin user can access the test endpoint in the users route', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users/test`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);
		expect((await adminResponse.json()).message).toBe('Server is running');

		const userResponse: Response = await fetch(
			`http://localhost:${port}/users/test`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});
});
