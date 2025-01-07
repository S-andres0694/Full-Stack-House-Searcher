import express from 'express';
import { Application } from 'express';
import { Database } from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { Server } from 'http';
import connectionGenerator, {
	dbTestOptions,
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import invitationTokenModelFactory, {
	InvitationTokenModel,
} from '../../models/invitation-token';
import { testDbPath } from '../jest.setup';
import usersModelFactory, { UsersModel } from '../../models/users';
import morgan from 'morgan';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import { user, independentUser } from '../../tests/constants';
import { InvitationToken, RegisterRequestBody } from '../../models/table-types';
import { invitationTokens } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { User } from '../../models/table-types';

let app: Application;
let dbConnection: Database;
const port: number = 4000;
let server: Server;
let invitationTokenModel: InvitationTokenModel;
let db: BetterSQLite3Database;
let usersModel: UsersModel;

beforeAll(async () => {
	app = express();
	dbConnection = connectionGenerator(testDbPath, dbTestOptions);
	db = drizzle(dbConnection);
	invitationTokenModel = invitationTokenModelFactory(db);
	usersModel = usersModelFactory(db);

	//Logging middleware
	app.use(morgan('common'));
	//Extra middleware
	app.use(express.json());

	//Add the authentication routes
	app.use('/auth', authenticationRoutesFactory(testDbPath));

	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});

beforeEach(async () => {
	await resetDatabase(dbConnection, dbTestOptions);
	await initialValues(dbConnection);
});

describe('Tests that when registering as a new user, an invitation token is created', () => {
	it('should create an invitation token', async () => {
		const invitationToken: string = '1234567890';
		await invitationTokenModel.createInvitationToken(invitationToken);
		//Check that the invitation token was created
		const invitationTokenRecord: InvitationToken[] = await db
			.select()
			.from(invitationTokens)
			.where(eq(invitationTokens.token, invitationToken));
		expect(invitationTokenRecord).toBeDefined();
		expect(invitationTokenRecord[0].token).toBe(invitationToken);
	});

	it('shows that consuming the token removes marks it as invalid', async () => {
		const invitationToken: string = '1234567890';
		const invitationTokenRecord: InvitationToken | undefined =
			await invitationTokenModel.createInvitationToken(invitationToken);
		expect(invitationTokenRecord).toBeDefined();
		expect(invitationTokenRecord).not.toBeUndefined();
		await invitationTokenModel.consumeInvitationToken(
			invitationTokenRecord as InvitationToken,
		);
		expect(
			await invitationTokenModel.isInvitationTokenValid(invitationToken),
		).toBe(false);
	});

	it('shows a user is able to register with an invitation token', async () => {
		const invitationToken: string = '1234567890';
		const invitationTokenRecord: InvitationToken | undefined =
			await invitationTokenModel.createInvitationToken(invitationToken);
		expect(invitationTokenRecord).toBeDefined();
		const registerRequestBody: RegisterRequestBody = {
			email: user.email,
			password: user.password,
			name: user.name,
			username: user.username,
			invitationToken: invitationToken,
		};

		const registerResponse: Response = await fetch(
			`http://localhost:${port}/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registerRequestBody),
			},
		);
		expect(registerResponse.status).toBe(200);
		const jsonResponse = await registerResponse.json();
		expect(jsonResponse.message).toBe('User created successfully.');
		const userRecord: User | undefined = await usersModel.getUserByUsername(
			user.username,
		);
		expect(userRecord).toBeDefined();
		expect(userRecord).not.toBeUndefined();
		expect(userRecord?.email).toBe(user.email);
		expect(userRecord?.username).toBe(user.username);
		expect(userRecord?.name).toBe(user.name);
		expect(userRecord?.role).toBe('user');
	});

	it('shows that a user cannot register with an invalid invitation token', async () => {
		const invitationToken: string = '1234567890';
		const invitationTokenRecord: InvitationToken | undefined =
			await invitationTokenModel.createInvitationToken(invitationToken);
		expect(invitationTokenRecord).toBeDefined();
		const registerRequestBody: RegisterRequestBody = {
			email: user.email,
			password: user.password,
			name: user.name,
			username: user.username,
			invitationToken: invitationToken,
		};

		const registerResponse: Response = await fetch(
			`http://localhost:${port}/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registerRequestBody),
			},
		);

		expect(registerResponse.status).toBe(200);
		const jsonResponse = await registerResponse.json();
		expect(jsonResponse.message).toBe('User created successfully.');
		const userRecord: User | undefined = await usersModel.getUserByUsername(
			user.username,
		);
		expect(userRecord).toBeDefined();

		const independentUserRequest: RegisterRequestBody = {
			email: independentUser.email,
			password: independentUser.password,
			name: independentUser.name,
			username: independentUser.username,
			invitationToken: invitationToken,
		};

		const registerResponse2: Response = await fetch(
			`http://localhost:${port}/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(independentUserRequest),
			},
		);
		expect(registerResponse2.status).toBe(400);
		const jsonResponse2 = await registerResponse2.json();
		expect(jsonResponse2.message).toBe(
			'Invitation token has already been used.',
		);
	});

	it('shows that a user cannot register with a non-existent invitation token', async () => {
		const invitationToken: string = '1234567890';
		const registerRequestBody: RegisterRequestBody = {
			email: user.email,
			password: user.password,
			name: user.name,
			username: user.username,
			invitationToken: invitationToken,
		};
		const registerResponse: Response = await fetch(
			`http://localhost:${port}/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registerRequestBody),
			},
		);
		expect(registerResponse.status).toBe(400);
		const jsonResponse = await registerResponse.json();
		expect(jsonResponse.message).toBe('Invitation token does not exist.');
	});
});

afterAll(async () => {
	server.close();
});
