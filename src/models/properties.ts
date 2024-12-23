import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { properties } from "../database/schema";
import { NewProperty, Property } from "./table-types";


/**
 * Class representing a model for property operations in the database.
 */
export class PropertiesModel {
  constructor(private db: BetterSQLite3Database) {}

  /**
   * Retrieves all properties from the database.
   * @returns {Promise<Property[]>} A promise that resolves to an array of properties
   */
  async getAllProperties(): Promise<Property[]> {
    return await this.db.select().from(properties);
  }

  /**
   * Retrieves a property by its identifier.
   * @param {number} identifier - The identifier of the property to retrieve
   * @returns {Promise<Property | undefined>} A promise that resolves to the property if found, undefined otherwise
   */
  async getPropertyById(identifier: number): Promise<Property | undefined> {
    const [propertyRecord]: Property[] = await this.db
      .select()
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord;
  }

  /**
   * Retrieves a property by its URL.
   * @param {string} url - The URL of the property to retrieve
   * @returns {Promise<Property | undefined>} A promise that resolves to the property if found, undefined otherwise
   */
  async getPropertyByUrl(url: string): Promise<Property | undefined> {
    const [propertyRecord]: Property[] = await this.db
      .select()
      .from(properties)
      .where(eq(properties.url, url));
    return propertyRecord;
  }

  /**
   * Retrieves the number of bedrooms for a property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<number | undefined>} A promise that resolves to the number of bedrooms if found, undefined otherwise
   */
  async getBedrooms(identifier: number): Promise<number | undefined> {
    const [propertyRecord]: { bedrooms: number }[] = await this.db
      .select({ bedrooms: properties.bedrooms })
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord?.bedrooms;
  }

  /**
   * Retrieves the monthly rent for a property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<number | undefined>} A promise that resolves to the monthly rent if found, undefined otherwise
   */
  async getMonthlyRent(identifier: number): Promise<string | undefined> {
    const [propertyRecord]: { monthlyRent: string }[] = await this.db
      .select({ monthlyRent: properties.monthlyRent })
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord?.monthlyRent;
  }
    
    /**
     * Retrieves the address for a property by its identifier.
     * @param {number} identifier - The identifier of the property
     * @returns {Promise<string | undefined>} A promise that resolves to the address if found, undefined otherwise
     */
    async getAddress(identifier: number): Promise<string | undefined> {
        const [propertyRecord]: { address: string }[] = await this.db
          .select({ address: properties.address })
          .from(properties)
          .where(eq(properties.id, identifier));
        return propertyRecord?.address;
    }

  /**
   * Retrieves the contact phone for a property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<string | undefined>} A promise that resolves to the contact phone if found, undefined otherwise
   */
  async getContactPhone(identifier: number): Promise<string | undefined> {
    const [propertyRecord]: { contactPhone: string }[] = await this.db
      .select({ contactPhone: properties.contactPhone })
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord?.contactPhone;
  }

  /**
   * Retrieves the summary for a property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<string | undefined>} A promise that resolves to the summary if found, undefined otherwise
   */
  async getSummary(identifier: number): Promise<string | undefined> {
    const [propertyRecord]: { summary: string }[] = await this.db
      .select({ summary: properties.summary })
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord?.summary;
  }

  /**
   * Retrieves the URL for a property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<string | undefined>} A promise that resolves to the URL if found, undefined otherwise
   */
  async getUrl(identifier: number): Promise<string | undefined> {
    const [propertyRecord]: { url: string }[] = await this.db
      .select({ url: properties.url })
      .from(properties)
      .where(eq(properties.id, identifier));
    return propertyRecord?.url;
  }

  /**
   * Creates a new property record in the database.
   * @param {NewProperty} property - The property object to create
   * @returns {Promise<number>} The ID of the newly created property
   */
  async createProperty(property: NewProperty): Promise<number> {
    const [propertyRecord] = await this.db.insert(properties).values(property).returning({ id: properties.id });
    return propertyRecord.id;
  }

  /**
   * Deletes a property from the database.
   * @param {number} identifier - The identifier of the property to delete
   * @returns {Promise<void>} A promise that resolves when the property is deleted
   */
  async deleteProperty(identifier: number): Promise<void> {
    await this.db.delete(properties).where(eq(properties.id, identifier));
  }

  /**
   * Updates a property in the database.
   * @param {number} identifier - The identifier of the property to update
   * @param {NewProperty} property - The property object to update
   * @returns {Promise<void>} A promise that resolves when the property is updated
   */
  async updateProperty(identifier: number, property: NewProperty): Promise<void> {
    await this.db.update(properties).set(property).where(eq(properties.id, identifier));
  }

  /**
   * Allows for a insertion of multiple properties into the database.
   * @param {NewProperty[]} properties - The array of properties to insert
   * @returns {Promise<void>} A promise that resolves when the properties are inserted
   */
  
  async insertProperties(propertiesArray: NewProperty[]): Promise<void> {
    await this.db.insert(properties).values(propertiesArray);
  }

  /**
   * Obtains the identifier of a property by its ID.
   * @param {number} id - The ID of the property
   * @returns {Promise<number | undefined>} A promise that resolves to the identifier if found, undefined otherwise
   */
  async getIdentifierById(id: number): Promise<number | undefined> {
    const [propertyRecord]: { identifier: number }[] = await this.db
      .select({ identifier: properties.identifier })
      .from(properties)
      .where(eq(properties.id, id));
    return propertyRecord?.identifier;
  }

  /**
   * Retrieves the property by its address.
   * @param {string} address - The address of the property
   * @returns {Promise<Property | undefined>} A promise that resolves to the property if found, undefined otherwise
   */
  async getPropertyByAddress(address: string): Promise<Property | undefined> {
    const [propertyRecord]: Property[] = await this.db.select().from(properties).where(eq(properties.address, address));
    return propertyRecord;
  }

  /**
   * Retrieves the property by its identifier.
   * @param {number} identifier - The identifier of the property
   * @returns {Promise<Property | undefined>} A promise that resolves to the property if found, undefined otherwise
   */
  async getPropertyByIdentifier(identifier: number): Promise<Property | undefined> {
    const [propertyRecord]: Property[] = await this.db.select().from(properties).where(eq(properties.identifier, identifier));
    return propertyRecord;
  }
}

/**
 * Factory function to create an instance of PropertiesModel.
 * @param {BetterSQLite3Database} db - The database connection instance
 * @returns {PropertiesModel} An instance of PropertiesModel
 */
export default function propertiesModelFactory(
  db: BetterSQLite3Database
): PropertiesModel {
  return new PropertiesModel(db);
}

