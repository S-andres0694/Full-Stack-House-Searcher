import { describe, it, expect } from '@jest/globals';
import favoritePropertiesModelFactory, {
	FavoritePropertiesModel,
} from '../../models/favorite_properties';
import {
	initialValues,
	resetDatabase,
	testDatabaseConfiguration,
} from '../../database/init-db.v2';
import connectionGenerator from '../../database/init-db.v2';
import usersModelFactory, { UsersModel } from '../../models/users';
import propertiesModelFactory, {
	PropertiesModel,
} from '../../models/properties';
import { property, property2 } from '../constants';
import { user } from '../constants';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

let db: NodePgDatabase<typeof schema>;
let favoritePropertiesModel: FavoritePropertiesModel;
let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let userId: number;
let propertyId: number;

beforeAll(async () => {
	db = connectionGenerator(testDatabaseConfiguration);
	favoritePropertiesModel = favoritePropertiesModelFactory(db);
	usersModel = usersModelFactory(db);
	propertiesModel = propertiesModelFactory(db);
});

beforeEach(async () => {
	db = connectionGenerator(testDatabaseConfiguration);
	await resetDatabase(db);
	await initialValues(db);
	await usersModel.createUser(user);
	await propertiesModel.createProperty(property);
	userId = (await usersModel.getUserId(user.username)) as number;
	propertyId = (await propertiesModel.getPropertyByIdentifier(
		property.identifier,
	))!.id;
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
		).toBe('1');
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
		).toBe('0');
	});
});
