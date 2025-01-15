import { Application } from 'express';
import usersModelFactory, { UsersModel } from '../../models/users';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Server } from 'http';
import express from 'express';
import morgan from 'morgan';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import userRoutesFactory from '../../routes/user_routes';
import sessionMiddleware from '../../middleware/express-session-config';
import { passportObj } from '../../authentication/google-auth.config';
import cookieParser from 'cookie-parser';
import { user } from '../constants';
import request from 'supertest';
import favoritePropertiesRoutesFactory from '../../routes/favorite_properties-routes';
import propertiesRoutesFactory from '../../routes/properties_routes';
import rolesRoutesFactory from '../../routes/roles_routes';
import viewedPropertiesRoutesFactory from '../../routes/viewed_properties-routes';
import connectionGenerator, {
	initialValues,
	resetDatabase,
	testDatabaseConfiguration,
} from '../../database/init-db.v2';
import * as schema from '../../database/schema';

let app: Application;
let db: NodePgDatabase<typeof schema>;
const port: number = 4000;
let server: Server;
let adminAccessJwtToken: string;
let userAccessJwtToken: string;
let userModel: UsersModel;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD!;
const testUserEmail: string = process.env.TEST_USER_EMAIL!;
const testUserPassword: string = process.env.TEST_USER_PASSWORD!;
const ADMIN_USERNAME: string = process.env.ADMIN_USERNAME!;

beforeAll(async () => {
	app = express();
	db = connectionGenerator(testDatabaseConfiguration);
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
	app.use('/auth', authenticationRoutesFactory(db));

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

	app.use('/users', userRoutesFactory(db));
	app.use('/favorite_properties', favoritePropertiesRoutesFactory(db));
	app.use('/properties', propertiesRoutesFactory(db));
	app.use('/roles', rolesRoutesFactory(db));
	app.use('/viewed_properties', viewedPropertiesRoutesFactory(db));

	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});

beforeEach(async () => {
	await resetDatabase(db);
	await initialValues(db);
});

afterAll(() => {
	server.close();
});

describe('Authentication and Roles API Testing for the Users API.', () => {
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

	it('tests only admin users can access the getUserById endpoint', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users/${userID}`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);

		const userResponse: Response = await fetch(
			`http://localhost:${port}/users/${userID}`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can access the getAllUsers endpoint', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);

		const userResponse: Response = await fetch(
			`http://localhost:${port}/users`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can access the getUserByEmail endpoint', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users/email/${ADMIN_EMAIL}`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);

		const userResponse: Response = await fetch(
			`http://localhost:${port}/users/email/${ADMIN_EMAIL}`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can access the getUserId endpoint', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users/id/${ADMIN_USERNAME}`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);

		expect(adminResponse.status).toBe(200);

		const userResponse: Response = await fetch(
			`http://localhost:${port}/users/id/${ADMIN_USERNAME}`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can access the createUser endpoint', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/users`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
	});

	it('tests that only admin users can create a user', async () => {
		const adminResponse = await request(app)
			.post('/users')
			.send(user)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(201);

		const userResponse = await request(app)
			.post('/users')
			.send(user)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can delete a user', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;
		const adminResponse = await request(app)
			.delete(`/users/${userId}`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(204);

		const userResponse = await request(app)
			.delete(`/users/${userId}`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can check if a user has a role', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.get(`/users/${userId}/hasRole/user`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);

		const userResponse = await request(app)
			.get(`/users/${userId}/hasRole/user`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can get a user name', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.get(`/users/${userId}/name`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);

		const userResponse = await request(app)
			.get(`/users/${userId}/name`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can get a user email', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.get(`/users/${userId}/email`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);

		const userResponse = await request(app)
			.get(`/users/${userId}/email`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can update a user username', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;
		const adminResponse = await request(app)
			.put(`/users/${userId}/username`)
			.send({ newUsername: 'New Username' })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(204);

		const userResponse = await request(app)
			.put(`/users/${userId}/username`)
			.send({ newUsername: 'New Username2' })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(204);
	});

	it('tests that only admin users can update a user email', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;
		const adminResponse = await request(app)
			.put(`/users/${userId}/email`)
			.send({ newEmail: 'newemail@test.com' })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(204);

		const userResponse = await request(app)
			.put(`/users/${userId}/email`)
			.send({ newEmail: 'newemail2@test.com' })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(204);
	});
});

describe('Authentication and Roles API Testing for the Favorite Properties API.', () => {
	it('tests that only admin users can access the test endpoint in the favorite properties route', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/favorite_properties/test`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);

		expect(adminResponse.status).toBe(200);

		const userResponse = await fetch(
			`http://localhost:${port}/favorite_properties/test`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
	});

	it('tests that only admin users can access the getAllFavoriteProperties endpoint and that other users cannot access it', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.get(`/favorite_properties/${userId}`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);

		const userResponse = await request(app)
			.get(`/favorite_properties/${userId}`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Forbidden');
	});

	it('tests that only admin users can add a favorite property for a user and that other users cannot access it', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404); //Since we are not adding a property that exists
		expect(adminResponse.body.message).toBe('Property not found');
		const userResponse = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Forbidden');
	});

	it('tests that only admin users can delete a favorite property for a user and that other users cannot access it', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404); //Since we are not deleting a property that exists
		expect(adminResponse.body.message).toBe('Property not found');

		const userResponse = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Forbidden');
	});

	it('tests that only admin users can clear all favorite properties for a user and that other users cannot access it', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.delete(`/favorite_properties/${userId}/all`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);
		expect(adminResponse.body.message).toBe('Favorite properties cleared');

		const userResponse = await request(app)
			.delete(`/favorite_properties/${userId}/all`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Forbidden');
	});

	it('tests that only admin users can get the count of favorite properties for a user and that other users cannot access it', async () => {
		const userId: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const adminResponse = await request(app)
			.get(`/favorite_properties/${userId}/count`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);
		expect(adminResponse.body.count).toBe(0);

		const userResponse = await request(app)
			.get(`/favorite_properties/${userId}/count`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Forbidden');
	});
});

describe('Authentication and Roles API Testing for the Properties API.', () => {
	it('tests that only admin users can access the test endpoint in the properties route', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/properties/test`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);
		expect((await adminResponse.json()).message).toBe('Server is running');

		const userResponse: Response = await fetch(
			`http://localhost:${port}/properties/test`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
		expect((await userResponse.json()).message).toBe('Unauthorized');
	});

	it('tests that all users can get properties from the database', async () => {
		const userResponse = await request(app)
			.get('/properties')
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(200);

		const adminResponse = await request(app)
			.get('/properties')
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);
	});

	it('tests that all users can get a property by its ID', async () => {
		const adminResponse = await request(app)
			.get(`/properties/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');

		const userResponse = await request(app)
			.get(`/properties/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get a property by its identifier', async () => {
		const userResponse = await request(app)
			.get(`/properties/by-identifier/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/by-identifier/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the number of bedrooms for a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/bedrooms/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/bedrooms/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the monthly rent for a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/monthly-rent/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/monthly-rent/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the address for a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/address/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/address/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the contact phone for a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/contact-phone/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/contact-phone/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the summary for a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/summary/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/summary/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that all users can get the URL of a property', async () => {
		const userResponse = await request(app)
			.get(`/properties/url/1`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(404);
		expect(userResponse.body.error).toBe('Property not found');

		const adminResponse = await request(app)
			.get(`/properties/url/1`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});
});

describe('Authentication and Roles API Testing for the Roles API.', () => {
	it('tests that only admin users can access the test endpoint in the roles route', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/roles/test`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);
		expect((await adminResponse.json()).message).toBe('Server is running');

		const userResponse: Response = await fetch(
			`http://localhost:${port}/roles/test`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
		expect((await userResponse.json()).message).toBe('Unauthorized');
	});

	it('tests that only admin users can create a role', async () => {
		const userResponse = await request(app)
			.post('/roles')
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Unauthorized');

		const adminResponse = await request(app)
			.post('/roles')
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(400);
		expect(adminResponse.body.error).toBe('Name and description are required');
	});

	it('tests that only admin users can delete a role', async () => {
		const userResponse = await request(app)
			.delete('/roles/1')
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.message).toBe('Unauthorized');

		const adminResponse = await request(app)
			.delete('/roles/1')
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(200);
		expect(adminResponse.body.message).toBe('Role deleted');
	});
});

describe('Authentication and Roles API Testing for the Viewed Properties API.', () => {
	it('tests that only admin users can access the test endpoint in the viewed properties route', async () => {
		const adminResponse: Response = await fetch(
			`http://localhost:${port}/viewed_properties/test`,
			{
				headers: { Authorization: `Bearer ${adminAccessJwtToken}` },
			},
		);
		expect(adminResponse.status).toBe(200);
		expect((await adminResponse.json()).message).toBe('Server is running');

		const userResponse: Response = await fetch(
			`http://localhost:${port}/viewed_properties/test`,
			{
				headers: { Authorization: `Bearer ${userAccessJwtToken}` },
			},
		);
		expect(userResponse.status).toBe(403);
		expect((await userResponse.json()).message).toBe('Unauthorized');
	});

	it('tests that only admin users and the correct user can get all viewed properties for a user', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const userResponse = await request(app)
			.get(`/viewed_properties/${userID}`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		const adminResponse = await request(app)
			.get(`/viewed_properties/${userID}`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(400);
		expect(adminResponse.body.error).toBe('No properties found');
	});

	it('tests that only admin users and the correct user can add a property as viewed', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const userResponse = await request(app)
			.post(`/viewed_properties/${userID}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		const adminResponse = await request(app)
			.post(`/viewed_properties/${userID}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that only admin users and the correct user can add multiple properties as viewed', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const userResponse = await request(app)
			.post(`/viewed_properties/multiple/${userID}`)
			.send({ properties: [1, 2] })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		const adminResponse = await request(app)
			.post(`/viewed_properties/multiple/${userID}`)
			.send({ properties: [1, 2] })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property 1 not found');
	});

	it('tests that only admin users and the correct user can delete a viewed property', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		// Test user deleting from their own viewed list
		const userResponse = await request(app)
			.delete(`/viewed_properties/${userID}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		// Test admin deleting from any user's viewed list
		const adminResponse = await request(app)
			.delete(`/viewed_properties/${userID}`)
			.send({ propertyId: 1 })
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(404);
		expect(adminResponse.body.error).toBe('Property not found');
	});

	it('tests that only admin users and the correct user can clear all viewed properties', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const userResponse = await request(app)
			.delete(`/viewed_properties/${userID}/clear`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		const adminResponse = await request(app)
			.delete(`/viewed_properties/${userID}/clear`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(201);
		expect(adminResponse.body.message).toBe('Viewed properties cleared');
	});

	it('tests that only admin users and the correct user can get the last viewed property', async () => {
		const userID: number = (await userModel.getUserByEmail(ADMIN_EMAIL))!.id;

		const userResponse = await request(app)
			.get(`/viewed_properties/${userID}/last`)
			.set('Authorization', `Bearer ${userAccessJwtToken}`);
		expect(userResponse.status).toBe(403);
		expect(userResponse.body.error).toBe('Unauthorized');

		const adminResponse = await request(app)
			.get(`/viewed_properties/${userID}/last`)
			.set('Authorization', `Bearer ${adminAccessJwtToken}`);
		expect(adminResponse.status).toBe(400);
		expect(adminResponse.body.error).toBe('No viewed properties found');
	});
});
