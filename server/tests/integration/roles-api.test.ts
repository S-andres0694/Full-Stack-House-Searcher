import request from 'supertest';
import { Application, response } from 'express';
import { testDbPath } from '../jest.setup';
import { RolesModel } from '../../models/roles';
import {
	dbTestOptions,
	resetDatabase,
	initialValues,
} from '../../database/init-db';
import { Database } from 'better-sqlite3';
import rolesModelFactory from '../../models/roles';
import connectionGenerator from '../../database/init-db';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import express from 'express';
import { Server } from 'http';
import morgan from 'morgan';
import rolesRoutesFactory from '../../routes/roles_routes';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import sessionMiddleware from '../../middleware/express-session-config';
import { passportObj } from '../../authentication/google-auth.config';
import cookieParser from 'cookie-parser';
import { isUserLoggedInThroughGoogle } from '../../middleware/auth-middleware';
import { addBearerToken } from '../../middleware/auth-middleware';
import { isUserLoggedInThroughJWT } from '../../middleware/auth-middleware';
import { Response } from 'supertest';

let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
let rolesModel: RolesModel;
const port: number = 4000;
let server: Server;
let accessJwtToken: string;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD!;

beforeAll(async () => {
	app = express();
	dbConnection = connectionGenerator(testDbPath, dbTestOptions);
	db = drizzle(dbConnection);
	rolesModel = rolesModelFactory(db);
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

	//Login the admin user
	const response: Response = await request(app).post('/auth/login').send({
		email: ADMIN_EMAIL,
		password: ADMIN_PASSWORD,
	});

	if (response.status !== 200) {
		console.error(`Failed to login: ${response.status} and ${response.body}`);
		throw new Error('Failed to login');
	} else {
		console.log('Access token has been retrieved');
		accessJwtToken = response.body.accessToken;
	}

	server.close();

	//Session middleware
	app.use(sessionMiddleware);

	//Cookie parser middleware
	app.use(cookieParser());

	//Passport middleware
	app.use(passportObj.initialize());
	app.use(passportObj.session());

	//Routes
	app.use(
		'/roles',
		addBearerToken(accessJwtToken),
		isUserLoggedInThroughGoogle,
		isUserLoggedInThroughJWT,
		rolesRoutesFactory(testDbPath),
	);

	//Start the server
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});

beforeEach(async () => {
	await resetDatabase(dbConnection, dbTestOptions);
	await initialValues(dbConnection);
});

describe('Roles API Testing', () => {
	it('tests that the endpoint works and that the server is running', async () => {
		const response = await request(app).get('/roles/test');
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Server is running');
	});

	it('tests that the create role endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		const response = await request(app).post('/roles').send(newRole);
		expect(response.status).toBe(201);
		expect(response.body.message).toBe('Role created');

		// Verify role was created in database
		const roleId: number = (await rolesModel.getRoleId(newRole.name))!;
		const roleExists = await rolesModel.checkRoleExists(newRole.name);
		expect(roleExists).toBe(true);
	});

	it('tests that the create role endpoint fails when the role already exists', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const response = await request(app).post('/roles').send(newRole);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Role already exists');
	});

	it('tests that the create role endpoint fails when required fields are missing', async () => {
		const response = await request(app).post('/roles').send({});
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Name and description are required');
	});

	it('tests that the getAllRoles endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const response = await request(app).get('/roles');
		expect(response.status).toBe(200);
		expect(response.body.length).toBeGreaterThan(0);
		expect(
			response.body.some((role: any) => role.roleName === newRole.name),
		).toBe(true);
	});

	it('tests that the deleteRole endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const roleId = await rolesModel.getRoleId(newRole.name);
		const response = await request(app).delete(`/roles/${roleId}`);
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Role deleted');

		// Verify role was deleted from database
		const roleExists = await rolesModel.checkRoleExists(newRole.name);
		expect(roleExists).toBe(false);
	});

	it('tests that the deleteRole endpoint fails when the role does not exist', async () => {
		const response = await request(app).delete('/roles/1000000');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Role not found');
	});

	it('tests that the checkRoleExists endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const response = await request(app).get(`/roles/${newRole.name}`);
		expect(response.status).toBe(200);
		expect(response.body.exists).toBe(true);
	});

	it('tests that the checkRoleExists endpoint fails when the role does not exist', async () => {
		const response = await request(app).get('/roles/nonexistentrole');
		expect(response.status).toBe(200);
		expect(response.body.exists).toBe(false);
	});

	it('tests that the getRoleId endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const response = await request(app).get(`/roles/${newRole.name}/id`);
		expect(response.status).toBe(200);
		expect(response.body.id).toBeDefined();
	});

	it('tests that the getRoleId endpoint fails when the role does not exist', async () => {
		const response = await request(app).get('/roles/nonexistentrole/id');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Role not found');
	});

	it('tests that the getRoleName endpoint works', async () => {
		const newRole = {
			name: 'testrole',
			description: 'Test role description',
		};
		await rolesModel.createRole(newRole.name, newRole.description);
		const roleId = await rolesModel.getRoleId(newRole.name);
		const response = await request(app).get(`/roles/${roleId}/name`);
		expect(response.status).toBe(200);
		expect(response.body.name).toBe(newRole.name);
	});
});

afterAll(() => {
	server.close();
});
