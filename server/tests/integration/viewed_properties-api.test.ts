import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Application } from 'express';
import connectionGenerator, {
	dbProductionOptions,
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import { Server } from 'http';
import { dbTestOptions } from '../../database/init-db';
import { testDbPath } from '../jest.setup';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Database } from 'better-sqlite3';
import express from 'express';
import viewedPropertiesModelFactory from '../../models/viewed_properties';
import { ViewedPropertiesModel } from '../../models/viewed_properties';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import usersModelFactory, { UsersModel } from '../../models/users';
import viewedPropertiesRoutesFactory from '../../routes/viewed_properties-routes';
import morgan from 'morgan';
import request from 'supertest';
import { user, property, property2 } from '../constants';
import { Response as SupertestResponse } from 'supertest';
import { ViewedProperty } from '../../types/table-types';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import { passportObj } from '../../authentication/google-auth.config';
import cookieParser from 'cookie-parser';
import sessionMiddleware from '../../middleware/express-session-config';
import {
	addBearerToken,
	isUserLoggedInThroughGoogle,
} from '../../middleware/auth-middleware';
import { isUserLoggedInThroughJWT } from '../../middleware/auth-middleware';
import { Response } from 'supertest';
let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
const port: number = 4000;
let server: Server;
let viewedPropertiesModel: ViewedPropertiesModel;
let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let userID: number;
let propertyId: number;
let property2Id: number;
let accessJwtToken: string;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD!;

beforeAll(async () => {
	app = express();
	dbConnection = connectionGenerator(testDbPath, dbTestOptions);
	db = drizzle(dbConnection);
	viewedPropertiesModel = viewedPropertiesModelFactory(db);
	usersModel = usersModelFactory(db);
	propertiesModel = propertiesModelFactory(db);

	//Logging middleware
	app.use(morgan('common'));
	//Extra middleware
	app.use(express.json());

	//Authentication routes
	app.use('/auth', authenticationRoutesFactory(testDbPath));

	//Start the server to obtain the access token
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	//Login the admin user
	const response: Response = await request(app).post('/auth/login').send({
		email: ADMIN_EMAIL,
		password: ADMIN_PASSWORD,
	});

	if (response.status !== 200) {
		console.error(`Failed to login: ${response.status} and ${response.text}`);
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
		'/viewed-properties',
		addBearerToken(accessJwtToken),
		viewedPropertiesRoutesFactory(testDbPath),
	);

	//Start the server
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});

beforeEach(async () => {
	await resetDatabase(dbConnection, dbProductionOptions);
	await initialValues(dbConnection);
	await usersModel.createUser(user);
	userID = (await usersModel.getUserId(user.username))!;
	propertyId = await propertiesModel.createProperty(property);
	property2Id = await propertiesModel.createProperty(property2);
});

afterAll(() => {
	server.close();
});

describe('Viewed Properties API Testing', () => {
	it('Tests that the route is alive and that the server is running', async () => {
		const response: SupertestResponse = await request(app).get(
			'/viewed-properties/test',
		);
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Server is running');
	});

	it('Tests that you can get all viewed properties for a user', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: propertyId,
		});
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: property2Id,
		});
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/${userID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
		expect(response.body[0].propertyId).toBe(propertyId);
		expect(response.body[1].propertyId).toBe(property2Id);
	});

	it('it tests that when passing an non-number user id, the response is 400', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/notanumber`,
		);
		expect(response.status).toBe(400);
	});

	it('tests that when passing a user ID for a user that does not exists, the response is 404', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/100000000`,
		);
		expect(response.status).toBe(404);
	});

	it('tests that when retrieving properties for a user that has no properties, the response is 400', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/${userID}`,
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('No properties found');
	});

	it('tests that when adding a property as viewed, the response is 200', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/${userID}`)
			.send({
				propertyId: propertyId,
			});
		console.log(response.body);
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Property added as viewed');
		const properties: ViewedProperty[] | undefined =
			await viewedPropertiesModel.getAllViewedPropertiesFromUser(userID);
		expect(properties?.length).toBe(1);
		expect(properties?.[0].propertyId).toBe(propertyId);
	});

	it('tests that when adding a property with a non-number User ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/notanumber`)
			.send({
				propertyId: propertyId,
			});
		expect(response.status).toBe(400);
	});

	it('tests that when adding a property with a non-number property ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/${userID}`)
			.send({
				propertyId: 'notanumber',
			});
		expect(response.status).toBe(400);
	});

	it('tests that when adding a property with a User ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/100000000`)
			.send({
				propertyId: propertyId,
			});
		expect(response.status).toBe(404);
	});

	it('tests that when adding a property with a property ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/${userID}`)
			.send({
				propertyId: 100000000,
			});
		expect(response.status).toBe(404);
	});

	it('tests that when deleting a property from the viewed properties list, the response is 200', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: propertyId,
		});
		const response: SupertestResponse = await request(app)
			.delete(`/viewed-properties/${userID}`)
			.send({
				propertyId: propertyId,
			});
		expect(response.status).toBe(201);
		expect(response.body.message).toBe('Property deleted from viewed');
		expect(
			await viewedPropertiesModel.getAllViewedPropertiesFromUser(userID),
		).toEqual([]);
	});

	it('tests that when deleting a property with a non-number User ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.delete(`/viewed-properties/notanumber`)
			.send({
				propertyId: propertyId,
			});
		expect(response.status).toBe(400);
	});

	it('tests that when deleting a property with a non-number property ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.delete(`/viewed-properties/${userID}`)
			.send({
				propertyId: 'notanumber',
			});
		expect(response.status).toBe(400);
	});

	it('tests that when deleting a property with a User ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.delete(`/viewed-properties/100000000`)
			.send({
				propertyId: propertyId,
			});
		expect(response.status).toBe(404);
	});

	it('tests that when deleting a property with a property ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.delete(`/viewed-properties/${userID}`)
			.send({
				propertyId: 100000000,
			});
		expect(response.status).toBe(404);
	});

	it('tests that when clearing all viewed properties for a user, the response is 200', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: propertyId,
		});
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: property2Id,
		});
		const response: SupertestResponse = await request(app).delete(
			`/viewed-properties/${userID}/clear`,
		);
		expect(response.status).toBe(201);
		expect(response.body.message).toBe('Viewed properties cleared');
		expect(
			await viewedPropertiesModel.getAllViewedPropertiesFromUser(userID),
		).toEqual([]);
	});

	it('tests that when clearing all viewed properties for a user that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app).delete(
			`/viewed-properties/100000000/clear`,
		);
		expect(response.status).toBe(404);
	});

	it('tests that when passing a non-number User ID, the response is 400 when trying to clear all viewed properties', async () => {
		const response: SupertestResponse = await request(app).delete(
			`/viewed-properties/notanumber/clear`,
		);
		expect(response.status).toBe(400);
	});

	it('tests that when getting the last viewed property for a user, the response is 200', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: propertyId,
		});

		await viewedPropertiesModel.addPropertyAsViewed({
			userId: userID,
			propertyId: property2Id,
		});

		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/${userID}/last`,
		);

		expect(response.status).toBe(200);
		expect(response.body.propertyId).toBe(property2Id);
	});

	it('tests that when getting the last viewed property for a user that has no properties, the response is 400', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/${userID}/last`,
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('No viewed properties found');
	});

	it('tests that when getting the last viewed property for a user that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/100000000/last`,
		);
		expect(response.status).toBe(404);
	});

	it('tests that when passing a non-number User ID, the response is 400 when trying to get the last viewed property', async () => {
		const response: SupertestResponse = await request(app).get(
			`/viewed-properties/notanumber/last`,
		);
		expect(response.status).toBe(400);
	});

	it('tests that when adding multiple properties as viewed, the response is 200', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/multiple/${userID}`)
			.send({
				properties: [propertyId, property2Id],
			});
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('All properties added as viewed');
		const properties: ViewedProperty[] | undefined =
			await viewedPropertiesModel.getAllViewedPropertiesFromUser(userID);
		expect(properties?.length).toBe(2);
		expect(properties?.[0].propertyId).toBe(propertyId);
		expect(properties?.[1].propertyId).toBe(property2Id);
	});

	it('tests that when adding multiple properties as viewed with a non-number User ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/multiple/notanumber`)
			.send({
				properties: [propertyId, property2Id],
			});
		expect(response.status).toBe(400);
	});

	it('tests that when adding multiple properties as viewed with a non-number property ID, the response is 400', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/multiple/${userID}`)
			.send({
				properties: ['notanumber', property2Id],
			});
		expect(response.status).toBe(400);
	});

	it('tests that when adding multiple properties as viewed with a User ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/multiple/100000000`)
			.send({
				properties: [propertyId, property2Id],
			});
		expect(response.status).toBe(404);
	});

	it('tests that when adding multiple properties as viewed with a property ID that does not exist, the response is 404', async () => {
		const response: SupertestResponse = await request(app)
			.post(`/viewed-properties/multiple/${userID}`)
			.send({
				properties: [100000000, property2Id],
			});
		expect(response.status).toBe(404);
	});
});
