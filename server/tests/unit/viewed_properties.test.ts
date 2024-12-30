import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Database } from 'better-sqlite3';
import connectionGenerator, {
	dbTestOptions,
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import viewedPropertiesModelFactory, {
	ViewedPropertiesModel,
} from '../../models/viewed_properties';
import usersModelFactory, { UsersModel } from '../../models/users';
import { testDbPath } from '../jest.setup';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { property, property2, user, user2 } from '../constants';
import { ViewedProperty } from '../../models/table-types';

let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let viewedPropertiesModel: ViewedPropertiesModel;
let db: Database;
let drizzleORM: BetterSQLite3Database;
let userId: number;
let propertyId: number;
let property2Id: number;

beforeAll(async () => {
	db = connectionGenerator(testDbPath, dbTestOptions);
	drizzleORM = drizzle(db);
	usersModel = usersModelFactory(drizzleORM);
	propertiesModel = propertiesModelFactory(drizzleORM);
	viewedPropertiesModel = viewedPropertiesModelFactory(drizzleORM);
});

beforeEach(async () => {
	await resetDatabase(db, dbTestOptions);
	await initialValues(db);
	await usersModel.createUser(user);
	await propertiesModel.createProperty(property);
	await propertiesModel.createProperty(property2);
	userId = (await usersModel.getUserId(user.username)) as number;
	propertyId = (await propertiesModel.getPropertyByIdentifier(
		property.identifier,
	))!.id;
	property2Id = (await propertiesModel.getPropertyByIdentifier(
		property2.identifier,
	))!.id;
});

afterAll(() => {
	if (db) {
		db.close();
	}
});

describe('Viewed Properties Model Unit Tests', () => {
	it('should be able to add a property as viewed', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		const viewedProperties: ViewedProperty[] =
			(await viewedPropertiesModel.getAllViewedPropertiesFromUser(
				userId,
			)) as ViewedProperty[];
		expect(viewedProperties.length).toBe(1);
		expect(viewedProperties[0].propertyId).toBe(propertyId);
	});

	it('should be able to get all viewed properties from a user', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		const viewedProperties: ViewedProperty[] =
			(await viewedPropertiesModel.getAllViewedPropertiesFromUser(
				userId,
			)) as ViewedProperty[];
		expect(viewedProperties.length).toBe(1);
		expect(viewedProperties[0].propertyId).toBe(propertyId);
	});

	it('should be able to delete a viewed property', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		await viewedPropertiesModel.deleteViewedProperty({
			userId,
			propertyId,
		});
		const viewedProperties: ViewedProperty[] =
			(await viewedPropertiesModel.getAllViewedPropertiesFromUser(
				userId,
			)) as ViewedProperty[];
		expect(viewedProperties.length).toBe(0);
	});

	it('should be able to clear all viewed properties from a user', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		await viewedPropertiesModel.clearViewedProperties(userId);
		const viewedProperties: ViewedProperty[] =
			(await viewedPropertiesModel.getAllViewedPropertiesFromUser(
				userId,
			)) as ViewedProperty[];
		expect(viewedProperties.length).toBe(0);
	});

	it('should be able to get the count of viewed properties for a user', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		const count: number = await viewedPropertiesModel.getViewedPropertiesCount(
			userId,
		);
		expect(count).toBe(1);
	});

	it('should be able to get the last viewed property for a user', async () => {
		await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
		const lastViewedProperty: ViewedProperty | undefined =
			await viewedPropertiesModel.getLastViewedProperty(userId);
		expect(lastViewedProperty).toBeDefined();
		expect(lastViewedProperty?.propertyId).toBe(propertyId);
	});

	it('should be able to add multiple properties as viewed', async () => {
		await viewedPropertiesModel.addMultiplePropertiesAsViewed(userId, [
			propertyId,
			property2Id,
		]);
		const viewedProperties: ViewedProperty[] | undefined =
			await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
		expect(viewedProperties?.length).toBe(2);
		expect(viewedProperties?.[0].propertyId).toBe(propertyId);
		expect(viewedProperties?.[1].propertyId).toBe(property2Id);
	});

	it('should thrown an error when adding multiple properties as viewed with a non-existent User ID', async () => {
		await expect(
			viewedPropertiesModel.addMultiplePropertiesAsViewed(100000000, [
				propertyId,
				property2Id,
			]),
		).rejects.toThrow();
	});
});
