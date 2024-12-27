import { describe, it, expect } from '@jest/globals';
import { FavoritePropertiesModel } from '../../models/favorite_properties';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { testDbPath } from '../jest.setup';
import {
	dbTestOptions,
	initialValues,
	resetDatabase,
} from '../../database/init-db';
import connectionGenerator from '../../database/init-db';
import { Database } from 'better-sqlite3';
import usersModelFactory, { UsersModel } from '../../models/users';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import { property, property2 } from '../constants';
import { user } from '../constants';

let db: Database;
let favoritePropertiesModel: FavoritePropertiesModel;
let drizzleORM: BetterSQLite3Database;
let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let userId: number;
let propertyId: number;

beforeAll(async () => {
	db = connectionGenerator(testDbPath, dbTestOptions);
	drizzleORM = drizzle(db);
	favoritePropertiesModel = new FavoritePropertiesModel(drizzleORM);
	usersModel = usersModelFactory(drizzleORM);
	propertiesModel = propertiesModelFactory(drizzleORM);
});

beforeEach(async () => {
	db = connectionGenerator(testDbPath, dbTestOptions);
	await resetDatabase(db, dbTestOptions);
	await initialValues(db);
	await usersModel.createUser(user);
	await propertiesModel.createProperty(property);
	userId = (await usersModel.getUserId(user.username)) as number;
	propertyId = (await propertiesModel.getPropertyByIdentifier(
		property.identifier,
	))!.id;
});

afterAll(() => {
	db.close();
});

describe('FavoritePropertiesModel', () => {
	it('should be able to add a favorite property', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId,
			propertyId,
		});
		expect(
			await favoritePropertiesModel.getAllFavoriteProperties(userId),
		).toContainEqual({ id: 1, userId: userId, propertyId: propertyId });
	});

	it('should be able to delete a favorite property', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId,
			propertyId,
		});
		await favoritePropertiesModel.deleteFavoriteProperty(userId, propertyId);
		expect(
			await favoritePropertiesModel.getAllFavoriteProperties(userId),
		).not.toContainEqual([property]);
	});

	it('should be able to get the count of favorite properties', async () => {
		await favoritePropertiesModel.addFavoriteProperty({
			userId,
			propertyId,
		});
		expect(
			await favoritePropertiesModel.getFavoritePropertiesCount(userId),
		).toBe(1);
	});

	it('should be able to clear favorite properties', async () => {
		await propertiesModel.createProperty(property2);
		const propertyId2: number = (await propertiesModel.getPropertyByIdentifier(
			property2.identifier,
		))!.id;
		await favoritePropertiesModel.addFavoriteProperty({
			userId,
			propertyId,
		});
		await favoritePropertiesModel.addFavoriteProperty({
			userId,
			propertyId: propertyId2,
		});
		await favoritePropertiesModel.clearFavoriteProperties(userId);
		expect(
			await favoritePropertiesModel.getFavoritePropertiesCount(userId),
		).toBe(0);
	});
});
