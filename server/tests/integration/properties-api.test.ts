import { Application } from 'express';
import { PropertiesApi } from '../../controllers/properties_api';
import { Database } from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { Server } from 'http';
import request from 'supertest';
import express from 'express';
import connectionGenerator, {
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import { dbTestOptions } from '../../database/init-db';
import { testDbPath } from '../jest.setup';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import morgan from 'morgan';
import propertiesRoutesFactory from '../../routes/properties_routes';
import { properties } from '../../database/schema';
import {
	NewProperty,
	Property,
	RightmoveProperty,
} from '../../models/table-types';
import { property } from '../../tests/constants';

let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
let propertiesApi: PropertiesApi;
const port: number = 4000;
let server: Server;
let propertiesModel: PropertiesModel;

const testProperty: NewProperty = {
	bedrooms: 3,
	address: '123 Main St, London, SW1A 1AA',
	monthlyRent: '1000',
	contactPhone: '07890123456',
	summary: 'A lovely property',
	url: 'https://www.rightmove.co.uk/property-to-rent/property-1234567890.html',
	identifier: 1234567890,
};

beforeAll(() => {
	app = express();
	dbConnection = connectionGenerator(testDbPath, dbTestOptions);
	db = drizzle(dbConnection);
	propertiesModel = propertiesModelFactory(db);
	app.use(morgan('common'));
	app.use(express.json());
	app.use('/properties', propertiesRoutesFactory(testDbPath));
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

describe('Properties API Testing', () => {
	it('tests that the endpoint works and that the server is running', async () => {
		const response = await request(app).get('/properties/test');
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Server is running');
	});

	xit('tests that the rightmove properties endpoint works', async () => {
		const response = await request(app).get('/properties/rightmove').send({
			identifier: 'REGION^1245',
			sort: 'newestListed',
			radius: 10,
			bedrooms: '3,5',
			furnishedType: 'furnished',
			typeOfLet: 'longTerm',
			page: 1,
		});
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('properties');
		expect(response.body.properties).toBeInstanceOf(Array<RightmoveProperty>);
		expect(response.body.properties.length).toBeGreaterThan(0);
	});

	it('tests that the rightmove properties endpoint returns a 400 error if the request body is missing required fields', async () => {
		const response = await request(app).get('/properties/rightmove').send({
			identifier: 'REGION^1245',
			sort: 'newestListed',
			furnishedType: 'furnished',
			typeOfLet: 'longTerm',
			page: 1,
		});
		expect(response.status).toBe(400);
		expect(response.body.error).toBe(
			'Missing required properties in request body',
		);
	});

	xit('tests that when calling the rightmove endpoint, the properties are added to the database', async () => {
		const response = await request(app).get('/properties/rightmove').send({
			identifier: 'REGION^1245',
			sort: 'newestListed',
			radius: 10,
			bedrooms: '3,5',
			furnishedType: 'furnished',
			typeOfLet: 'longTerm',
			page: 1,
		});
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('properties');
		expect(response.body.properties).toBeInstanceOf(Array<RightmoveProperty>);
		expect(response.body.properties.length).toBeGreaterThan(0);

		const rightmoveProperties: Array<RightmoveProperty> =
			response.body.properties;

		for (const property of rightmoveProperties) {
			expect(
				await propertiesModel.getPropertyByIdentifier(property.identifier),
			).toBeDefined();
		}
	});

	xit('tests that when calling the getProperties endpoint, all of the properties are returned', async () => {
		//Populate the database
		const rightmoveRequest = await request(app)
			.get('/properties/rightmove')
			.send({
				identifier: 'REGION^1245',
				sort: 'newestListed',
				radius: 10,
				bedrooms: '3,5',
				furnishedType: 'furnished',
				typeOfLet: 'longTerm',
				page: 1,
			});

		expect(rightmoveRequest.status).toBe(200);
		expect(rightmoveRequest.body).toHaveProperty('properties');
		expect(rightmoveRequest.body.properties).toBeInstanceOf(Array<NewProperty>);
		expect(rightmoveRequest.body.properties.length).toBeGreaterThan(0);

		//Get all of the properties from the first request
		const properties: Array<NewProperty> = rightmoveRequest.body.properties;

		//Get all of the properties from the database
		const databaseProperties = (await request(app).get('/properties')).body
			.properties;

		expect(databaseProperties).toBeInstanceOf(Array<Property>);
		expect(databaseProperties.length).toBeGreaterThan(0);
		expect(databaseProperties.length).toBe(properties.length);
	});

	it('tests that the getPropertyById endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('property');
		expect(response.body.property.id).toBe(insertedPropertyID);
	});

	it('tests that the getPropertyById endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get('/properties/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getPropertyById endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get('/properties/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests the getPropertyByIdentifier endpoint', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/by-identifier/1234567890`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('property');
		expect(response.body.property.identifier).toBe(1234567890);
		expect(response.body.property.id).toBe(insertedPropertyID);
	});

	it('tests that the getPropertyByIdentifier endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get(
			'/properties/by-identifier/9999999999',
		);
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getPropertyByIdentifier endpoint returns a 400 error if the identifier is not a number', async () => {
		const response = await request(app).get(
			'/properties/by-identifier/notANumber',
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid identifier');
	});

	it('tests that the getBedrooms endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/bedrooms/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('bedrooms');
		expect(response.body.bedrooms).toBe(3);
	});

	it('tests that the getBedrooms endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get('/properties/bedrooms/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getBedrooms endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get('/properties/bedrooms/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getMonthlyRent endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/monthly-rent/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('monthlyRent');
		expect(response.body.monthlyRent).toBe('1000');
	});

	it('tests that the getMonthlyRent endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get(
			'/properties/monthly-rent/9999999999',
		);
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getMonthlyRent endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get(
			'/properties/monthly-rent/notANumber',
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getAddress endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/address/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('address');
		expect(response.body.address).toBe('123 Main St, London, SW1A 1AA');
	});

	it('tests that the getAddress endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get('/properties/address/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getAddress endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get('/properties/address/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getSummary endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/summary/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('summary');
		expect(response.body.summary).toBe('A lovely property');
	});

	it('tests that the getSummary endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get('/properties/summary/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getSummary endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get('/properties/summary/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getUrl endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/url/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('url');
		expect(response.body.url).toBe(
			'https://www.rightmove.co.uk/property-to-rent/property-1234567890.html',
		);
	});

	it('tests that the getUrl endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get('/properties/url/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getUrl endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get('/properties/url/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getContactPhone endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/contact-phone/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('contactPhone');
		expect(response.body.contactPhone).toBe('07890123456');
	});

	it('tests that the getContactPhone endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get(
			'/properties/contact-phone/9999999999',
		);
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getContactPhone endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get(
			'/properties/contact-phone/notANumber',
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getIdentifier endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).get(
			`/properties/identifier/${insertedPropertyID}`,
		);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('identifier');
		expect(response.body.identifier).toBe(1234567890);
	});

	it('tests that the getIdentifier endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get(
			'/properties/identifier/9999999999',
		);
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the getIdentifier endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).get(
			'/properties/identifier/notANumber',
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the updateProperty endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app)
			.put(`/properties/${insertedPropertyID}`)
			.send({
				...property,
			});
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message');
		expect(response.body.message).toBe('Property updated successfully');
	});
	it('tests that the updateProperty endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).put('/properties/9999999999').send({
			bedrooms: 4,
		});
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the updateProperty endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).put('/properties/notANumber').send({
			bedrooms: 4,
		});
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the updateProperty endpoint returns a 400 error if the request body is missing required fields', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).put(
			`/properties/${insertedPropertyID}`,
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Missing required field: identifier');
	});

	it('tests that the deleteProperty endpoint works', async () => {
		const insertedPropertyID: number = await propertiesModel.createProperty(
			testProperty,
		);
		const response = await request(app).delete(
			`/properties/${insertedPropertyID}`,
		);
		expect(response.status).toBe(204);
		expect(response.body).toStrictEqual({});

		const property = await propertiesModel.getPropertyById(insertedPropertyID);
		expect(property).toBeUndefined();
	});

	it('tests that the deleteProperty endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).delete('/properties/9999999999');
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});

	it('tests that the deleteProperty endpoint returns a 400 error if the property ID is not a number', async () => {
		const response = await request(app).delete('/properties/notANumber');
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getIdentifier endpoint returns a 400 error if the identifier is not a number', async () => {
		const response = await request(app).get(
			'/properties/identifier/notANumber',
		);
		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID');
	});

	it('tests that the getIdentifier endpoint returns a 404 error if the property is not found', async () => {
		const response = await request(app).get(
			'/properties/identifier/9999999999',
		);
		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Property not found');
	});
});
