import { describe, it, expect } from "@jest/globals";
import { testDbPath } from "../jest.setup";
import connectionGenerator, {
  dbTestOptions,
  initialValues,
  resetDatabase,
} from "../../database/init-db";
import propertiesModelFactory, {
  PropertiesModel,
} from "../../models/properties";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { Database } from "better-sqlite3";
import { NewProperty, Property } from "../../models/table-types";
import { property, property2 } from "../constants";

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

describe("Properties Model Unit Tests", () => {
  //Test 1:
  it("should be able to get all properties", async () => {
    const properties = await propertiesModel.insertProperties([
      property,
      property2,
    ]);
    const retrievedProperties = await propertiesModel.getAllProperties();
    expect(retrievedProperties).toBeDefined();
    expect(retrievedProperties.length).toBe(2);
  });

  //Test 2:
  it("should be able to delete a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    await propertiesModel.deleteProperty(propertyId);
    const retrievedProperties = await propertiesModel.getAllProperties();
    expect(retrievedProperties).toBeDefined();
    expect(retrievedProperties.length).toBe(0);
  });

  //Test 3:
  it("should be able to get a property by id", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.id).toBe(propertyId);
  });

  //Test 4:
  it("should be able to get a property by address", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyByAddress(
      property.address
    );
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.id).toBe(propertyId);
  });

  //Test 5:
  it("should be able to get an identifier by id", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedIdentifier = await propertiesModel.getIdentifierById(
      propertyId
    );
    expect(retrievedIdentifier).toBeDefined();
    expect(retrievedIdentifier).toBe(property.identifier);
  });

  //Test 6:
  it("should be able to get a property by identifier", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyByIdentifier(
      property.identifier
    );
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.id).toBe(propertyId);
  });

  //Test 7:
  it("should be able to insert multiple properties", async () => {
    await propertiesModel.insertProperties([property, property2]);
    const retrievedProperties = await propertiesModel.getAllProperties();
    expect(retrievedProperties).toBeDefined();
    expect(retrievedProperties.length).toBe(2);
  });

  //Test 8:
  it("should be able to insert a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    expect(propertyId).toBeDefined();
    expect(propertyId).toBeGreaterThan(0);
  });

  //Test 9:
  it("should be able to update a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const updatedProperty = {
      ...property,
      address: "456 Main St, Anytown, USA",
    };
    await propertiesModel.updateProperty(propertyId, updatedProperty);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.address).toBe(updatedProperty.address);
  });

  //Test 10:
  it("should be able to get contact phone of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.contactPhone).toBe(property.contactPhone);
  });

  //Test 11:
  it("should be able to get summary of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.summary).toBe(property.summary);
  });

  //Test 12:
  it("should be able to get address of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.address).toBe(property.address);
  });

  //Test 13:
  it("should be able to get monthly rent of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.monthlyRent).toBe(property.monthlyRent);
  });

  //Test 14:
  it("should be able to get bedrooms of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.bedrooms).toBe(property.bedrooms);
  });

  //Test 15:
  it("should be able to get url of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.url).toBe(property.url);
  });

  //Test 16:
  it("should be able to get identifier of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyById(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.identifier).toBe(property.identifier);
  });

  //Test 17:
  it("should be able to get a property by url", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getPropertyByUrl(
      property.url
    );
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty?.id).toBe(propertyId);
  });

  //Test 18:
  it("should be able to ge the monthly rent of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getMonthlyRent(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty).toBe(property.monthlyRent);
  });

  //Test 19:
  it("should be able to get the address of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getAddress(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty).toBe(property.address);
  });

  //Test 20:
  it("should be able to get the contact phone of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getContactPhone(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty).toBe(property.contactPhone);
  });

  //Test 21:
  it("should be able to get the summary of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getSummary(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty).toBe(property.summary);
  });

  //Test 22:
  it("should be able to get the URL of a property", async () => {
    const propertyId: number = await propertiesModel.createProperty(property);
    const retrievedProperty = await propertiesModel.getUrl(propertyId);
    expect(retrievedProperty).toBeDefined();
    expect(retrievedProperty).toBe(property.url);
  });
});
