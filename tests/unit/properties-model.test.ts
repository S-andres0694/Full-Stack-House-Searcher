import { describe, it, expect } from "@jest/globals";
import { testDbPath } from "../jest.setup";
import connectionGenerator, { dbTestOptions, initialValues, resetDatabase } from "../../src/database/init-db";
import propertiesModelFactory, { PropertiesModel } from "../../src/models/properties";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { Database } from "better-sqlite3";
import { NewProperty, Property } from "../../src/models/table-types";

let db: Database;
let propertiesModel: PropertiesModel;
let drizzleORM: BetterSQLite3Database;

beforeAll(() => {
  db = connectionGenerator(testDbPath, dbTestOptions);
  drizzleORM = drizzle(db);
  propertiesModel = propertiesModelFactory(drizzleORM);
});

beforeEach(async () => {
  db = connectionGenerator(testDbPath, dbTestOptions);
  await resetDatabase(db, dbTestOptions);
  await initialValues(db);
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

const property: NewProperty = {
  url: "https://www.example.com",
  address: "123 Main St, Anytown, USA",
  summary: "This is an example property",
  monthlyRent: "1000",
  contactPhone: "1234567890",
  bedrooms: 3,
  identifier: 2783423,
};

const property2: NewProperty = {
  url: "https://www.example2.com",
  address: "456 Main St, Anytown, USA",
  summary: "This is another example property",
  monthlyRent: "1500",
  contactPhone: "1234567890",
  bedrooms: 4,
  identifier: 2783424,
};

describe("Properties Model Unit Tests", () => {
  it("should be able to get all properties", async () => {
    const properties = await propertiesModel.insertProperties([property, property2]);
    const retrievedProperties = await propertiesModel.getAllProperties();
    expect(retrievedProperties).toBeDefined();
    expect(retrievedProperties.length).toBe(2);
  });

  it("should be able to delete a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    await propertiesModel.deleteProperty(propertyId);
    const retrievedProperties = await propertiesModel.getAllProperties();
    expect(retrievedProperties).toBeDefined();
    expect(retrievedProperties.length).toBe(0);
  });
});
