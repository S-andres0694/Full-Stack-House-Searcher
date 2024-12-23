import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Database } from "better-sqlite3";
import connectionGenerator, { dbTestOptions, initialValues, resetDatabase } from "../../src/database/init-db";
import propertiesModelFactory, { PropertiesModel } from "../../src/models/properties";
import viewedPropertiesModelFactory, { ViewedPropertiesModel } from "../../src/models/viewed_properties";
import usersModelFactory, { UsersModel } from "../../src/models/users";
import { testDbPath } from "../jest.setup";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { property, property2, user, user2 } from "./constants";
import { ViewedProperty } from "../../src/models/table-types";

let usersModel: UsersModel;
let propertiesModel: PropertiesModel;
let viewedPropertiesModel: ViewedPropertiesModel;   
let db: Database;
let drizzleORM: BetterSQLite3Database;

beforeAll(() => {
    db = connectionGenerator(testDbPath, dbTestOptions);
    drizzleORM = drizzle(db);
    usersModel = usersModelFactory(drizzleORM);
    propertiesModel = propertiesModelFactory(drizzleORM);
    viewedPropertiesModel = viewedPropertiesModelFactory(drizzleORM);
});

beforeEach(async () => {
    await resetDatabase(db, dbTestOptions);
    await initialValues(db);
});

afterAll(() => {
    if (db) {
        db.close();
    }
});

describe("Viewed Properties Model Unit Tests", () => {
    it("should be able to add a property as viewed", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        const viewedProperties: ViewedProperty[] = await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
        expect(viewedProperties.length).toBe(1);
        expect(viewedProperties[0].propertyId).toBe(propertyId);
    });

    it("should be able to get all viewed properties from a user", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        const viewedProperties: ViewedProperty[] = await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
        expect(viewedProperties.length).toBe(1);
        expect(viewedProperties[0].propertyId).toBe(propertyId);
    });

    it("should be able to delete a viewed property", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        await viewedPropertiesModel.deleteViewedProperty(propertyId);
        const viewedProperties: ViewedProperty[] = await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
        expect(viewedProperties.length).toBe(0);
    });

    it("should be able to clear all viewed properties from a user", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        await viewedPropertiesModel.clearViewedProperties(userId);
        const viewedProperties: ViewedProperty[] = await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
        expect(viewedProperties.length).toBe(0);
    });

    it("should be able to get the count of viewed properties for a user", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        const count: number = await viewedPropertiesModel.getViewedPropertiesCount(userId);
        expect(count).toBe(1);
    });

    it("should be able to get the last viewed property for a user", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        await viewedPropertiesModel.addPropertyAsViewed({ userId, propertyId });
        const lastViewedProperty: ViewedProperty | undefined = await viewedPropertiesModel.getLastViewedProperty(userId);
        expect(lastViewedProperty).toBeDefined();
        expect(lastViewedProperty?.propertyId).toBe(propertyId);
    });

    it("should be able to add multiple properties as viewed", async () => {
        const propertyId: number = await propertiesModel.createProperty(property);
        await usersModel.createUser(user);
        const userId: number = await usersModel.getUserId(user.username)!;
        const propertyId2: number = await propertiesModel.createProperty(property2);
        await viewedPropertiesModel.addMultiplePropertiesAsViewed(userId, [
            { ...property, id: propertyId }, 
            { ...property2, id: propertyId2 }
        ]);
        const viewedProperties: ViewedProperty[] = await viewedPropertiesModel.getAllViewedPropertiesFromUser(userId);
        expect(viewedProperties.length).toBe(2);
        expect(viewedProperties[0].propertyId).toBe(propertyId);
        expect(viewedProperties[1].propertyId).toBe(propertyId2);
    });
});
