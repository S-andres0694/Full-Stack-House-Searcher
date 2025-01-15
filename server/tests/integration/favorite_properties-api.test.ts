import { Application } from 'express';
import favoritePropertiesApiFactory, {
	FavoritePropertiesApi,
} from '../../controllers/favorite_properties-api';
import favoritePropertiesModelFactory, {
	FavoritePropertiesModel,
} from '../../models/favorite_properties';
import { Database } from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import usersModelFactory, { UsersModel } from '../../models/users';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import { Server } from 'http';
import request from 'supertest';
import express from 'express';
import connectionGenerator, {
	initialValues,
	resetDatabase,
	testDatabaseConfiguration,
} from '../../database/init-db.v2';
import { testApi } from '../../controllers/favorite_properties-api';
import morgan from 'morgan';
import favoritePropertiesRoutesFactory from '../../routes/favorite_properties-routes';
import { property, property2, user } from '../constants';
import { Response } from 'supertest';
import { Favorite } from '../../types/table-types';
import authenticationRoutesFactory from '../../routes/authentication-routes';
import { isUserLoggedInThroughJWT } from '../../middleware/auth-middleware';
import { isUserLoggedInThroughGoogle } from '../../middleware/auth-middleware';
import sessionMiddleware from '../../middleware/express-session-config';
import { passportObj } from '../../authentication/google-auth.config';
import cookieParser from 'cookie-parser';
import { addBearerToken } from '../../middleware/auth-middleware';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

let app: Application;
let db: NodePgDatabase<typeof schema>;
const port: number = 4000;
let server: Server;
let favoritePropertiesModel: FavoritePropertiesModel;
let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let userId: number;
let propertyId: number;
let propertyId2: number;
let accessJwtToken: string;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD!;

beforeAll(async () => {
	app = express();
	db = connectionGenerator(testDatabaseConfiguration);
	app.use(morgan('common'));
	app.use(express.json());
	//Authentication routes
	app.use('/auth', authenticationRoutesFactory(db));

	//Start the server
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

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

	app.use(
		'/favorite_properties',
		addBearerToken(accessJwtToken),
		favoritePropertiesRoutesFactory(db),
	);
	server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
	usersModel = usersModelFactory(db);
	propertiesModel = propertiesModelFactory(db);
	favoritePropertiesModel = favoritePropertiesModelFactory(db);
});

beforeEach(async () => {
	await resetDatabase(db);
	await initialValues(db);
	propertyId = await propertiesModel.createProperty(property);
	propertyId2 = await propertiesModel.createProperty(property2);
	await usersModel.createUser(user);
	userId = (await usersModel.getUserId(user.username))!;
});

afterAll(() => {
	server.close();
});

describe('Favorite Properties API', () => {
	it('tests that the route is alive and that the server is running', async () => {
		await request(app).get('/favorite_properties/test').expect(200);
	});

	it('tests that the getAllFavoriteProperties endpoint returns all favorite properties for a user', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId,
		});

		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId2,
		});

		const response: Response = await request(app)
			.get(`/favorite_properties/${userId}`)
			.expect(200);

		expect(response.body.favoriteProperties.length).toEqual(2);
		expect(response.body.favoriteProperties[0].propertyId).toEqual(propertyId);
		expect(response.body.favoriteProperties[1].propertyId).toEqual(propertyId2);
	});

	it('tests that the getAllFavoriteProperties endpoint returns an empty array if no favorite properties are found', async () => {
		const response: Response = await request(app)
			.get(`/favorite_properties/${userId}`)
			.expect(200);

		expect(response.body.favoriteProperties.length).toEqual(0);
	});

	it('tests that the getAllFavoriteProperties endpoint returns a 404 error if the user is not found', async () => {
		const response: Response = await request(app)
			.get(`/favorite_properties/999`)
			.expect(404);
	});

	it('tests that the getAllFavoriteProperties endpoint returns a 400 error if the user ID is not a number', async () => {
		const response: Response = await request(app)
			.get(`/favorite_properties/notanumber`)
			.expect(400);
	});

	it('tests that the addFavoriteProperty endpoint adds a favorite property to the database', async () => {
		const response: Response = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({ propertyId: propertyId })
			.expect(200);

		expect(response.body.message).toEqual('Favorite property added');
		const favoriteProperties: Favorite[] =
			await favoritePropertiesModel.getAllFavoriteProperties(userId);
		expect(favoriteProperties.length).toEqual(1);
		expect(favoriteProperties[0].propertyId).toEqual(propertyId);
	});

	it('tests that the addFavoriteProperty endpoint returns a 404 error if the property is not found', async () => {
		const response: Response = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({ propertyId: 999 })
			.expect(404);
	});

	it('tests that the addFavoriteProperty endpoint returns a 400 error if the property ID is not a number', async () => {
		const response: Response = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({ propertyId: 'notanumber' })
			.expect(400);
	});

	it('tests that the addFavoriteProperty endpoint returns a 400 error if the user ID is not a number', async () => {
		const response: Response = await request(app)
			.post(`/favorite_properties/notanumber`)
			.send({ propertyId: propertyId })
			.expect(400);
	});

	it('tests that the addFavoriteProperty endpoint returns a 400 error if you do not pass a property ID', async () => {
		const response: Response = await request(app)
			.post(`/favorite_properties/${userId}`)
			.send({})
			.expect(400);
	});

	it('tests that the deleteFavoriteProperty endpoint deletes a favorite property from the database', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId,
		});

		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: propertyId })
			.expect(200);

		expect(response.body.message).toEqual('Favorite property deleted');
		const favoriteProperties: Favorite[] =
			await favoritePropertiesModel.getAllFavoriteProperties(userId);
		expect(favoriteProperties.length).toEqual(0);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 404 error if the user is not found', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/999`)
			.expect(404);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 400 error if the user ID is not a number', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/notanumber`)
			.expect(400);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 400 error if the property ID is not a number', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: 'notanumber' })
			.expect(400);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 400 error if you do not pass a property ID', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({})
			.expect(400);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 404 error if the property is not found', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: 999 })
			.expect(404);
	});

	it('tests that the deleteFavoriteProperty endpoint returns a 400 error if the property ID is not a number', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}`)
			.send({ propertyId: 'notanumber' })
			.expect(400);
	});

	it('tests that the clearFavoriteProperties endpoint clears all favorite properties for a user', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId,
		});

		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId2,
		});

		const response: Response = await request(app)
			.delete(`/favorite_properties/${userId}/all`)
			.expect(200);

		expect(response.body.message).toEqual('Favorite properties cleared');
		const favoriteProperties: Favorite[] =
			await favoritePropertiesModel.getAllFavoriteProperties(userId);
		expect(favoriteProperties.length).toEqual(0);
	});

	it('tests that the clearFavoriteProperties endpoint returns a 404 error if the user is not found', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/999/all`)
			.expect(404);
	});

	it('tests that the clearFavoriteProperties endpoint returns a 400 error if the user ID is not a number', async () => {
		const response: Response = await request(app)
			.delete(`/favorite_properties/notanumber/all`)
			.expect(400);
	});

	it('tests that the getFavoritePropertiesCount endpoint returns the correct count of favorite properties for a user', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId,
		});

		await favoritePropertiesModel.addFavoriteProperty({
			userId: userId,
			propertyId: propertyId2,
		});

		const response: Response = await request(app)
			.get(`/favorite_properties/${userId}/count`)
			.expect(200);

		expect(response.body.count).toEqual(2);
	});

	it('tests that the getFavoritePropertiesCount endpoint returns a 404 error if the user is not found', async () => {
		const response: Response = await request(app)
			.get(`/favorite_properties/999/count`)
			.expect(404);
	});

	it('tests that the getFavoritePropertiesCount endpoint returns a 400 error if the user ID is not a number', async () => {
		const response: Response = await request(app)
			.get(`/favorite_properties/notanumber/count`)
			.expect(400);
	});
});
