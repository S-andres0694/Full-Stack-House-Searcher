import { describe, it, expect } from "@jest/globals";
import { FavoritePropertiesModel } from "../../src/models/favorite_properties";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { testDbPath } from "../jest.setup";
import { dbTestOptions, initialValues, resetDatabase } from "../../src/database/init-db";
import connectionGenerator from "../../src/database/init-db";
import { Database } from "better-sqlite3";
import usersModelFactory, { UsersModel } from "../../src/models/users";
import propertiesModelFactory, { PropertiesModel } from "../../src/models/properties";
import { property, property2 } from "./constants";
import { user } from "./constants";

let db: Database;
let favoritePropertiesModel: FavoritePropertiesModel;
let drizzleORM: BetterSQLite3Database;
let usersModel: UsersModel;
let propertiesModel: PropertiesModel;

beforeAll(() => {
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
});

afterAll(() => {
    db.close();
});


describe("FavoritePropertiesModel", () => {
    it("should be able to add a favorite property", async () => {
        await usersModel.createUser(user);
        await propertiesModel.createProperty(property);
        const userId: number = await usersModel.getUserId(user.username)!;
        const propertyId: number = (await propertiesModel.getPropertyByAddress(property.address))!.id;
        await favoritePropertiesModel.addFavoriteProperty({ userId, propertyId });
        expect(await favoritePropertiesModel.getAllFavoriteProperties(userId)).toContainEqual({"id": 1, "userId": userId, "propertyId": propertyId});
    });

    it("should be able to delete a favorite property", async () => {
        await usersModel.createUser(user);
        await propertiesModel.createProperty(property);
        const userId: number = await usersModel.getUserId(user.username)!;
        const propertyId: number = (await propertiesModel.getPropertyByAddress(property.address))!.id;
        await favoritePropertiesModel.addFavoriteProperty({ userId, propertyId });
        await favoritePropertiesModel.deleteFavoriteProperty(userId, propertyId);
        expect(await favoritePropertiesModel.getAllFavoriteProperties(userId)).not.toContainEqual([property]);
    });

    it("should be able to get the count of favorite properties", async () => {
        await usersModel.createUser(user);
        await propertiesModel.createProperty(property);
        const userId: number = await usersModel.getUserId(user.username)!;
        const propertyId: number = (await propertiesModel.getPropertyByAddress(property.address))!.id;
        await favoritePropertiesModel.addFavoriteProperty({ userId, propertyId });
        expect(await favoritePropertiesModel.getFavoritePropertiesCount(userId)).toBe(1);
    });

    it("should be able to clear favorite properties", async () => {
        await usersModel.createUser(user);
        await propertiesModel.createProperty(property);
        await propertiesModel.createProperty(property2);
        const userId: number = await usersModel.getUserId(user.username)!;
        const propertyId: number = (await propertiesModel.getPropertyByAddress(property.address))!.id;
        const propertyId2: number = (await propertiesModel.getPropertyByAddress(property2.address))!.id;
        await favoritePropertiesModel.addFavoriteProperty({ userId, propertyId });
        await favoritePropertiesModel.addFavoriteProperty({ userId, propertyId: propertyId2 });
        await favoritePropertiesModel.clearFavoriteProperties(userId);
        expect(await favoritePropertiesModel.getFavoritePropertiesCount(userId)).toBe(0);
    });
});