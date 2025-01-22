import { Request, Response } from 'express';
import propertiesModelFactory from '../models/properties';
import { PropertiesModel } from '../models/properties';
import {
	NewProperty,
	Property,
	RightmoveProperty,
	RightmoveRequestBody,
} from '../types/table-types';
import axios, { AxiosResponse } from 'axios';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

/**
 * Test API to make sure that the endpoint is working.
 * @param {Request} request - The request object
 * @param {Response} response - The response object to send the user data
 */

export const testApi = async (
	request: Request,
	response: Response,
): Promise<void> => {
	response.status(200).json({ message: 'Server is running' });
};

/**
 * Class containing all of the properties API endpoints and their handler functions.
 */

export class PropertiesApi {
	//Properties Model Instance
	private propertiesModel: PropertiesModel;
	//API Key to make calls to the Rightmove API
	private apiKey: string;
	//API Host to make calls to the Rightmove API
	private apiHost: string;

	constructor(private db: NodePgDatabase<typeof schema>) {
		this.propertiesModel = propertiesModelFactory(this.db);
		this.apiKey = process.env.API_KEY || '';
		this.apiHost = process.env.API_HOST || '';
	}

	/**
	 * Retrieves all properties from the Rightmove API.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */
	getProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const properties: Array<Property> =
				await this.propertiesModel.getAllProperties();
			response.status(200).json({ properties: properties });
		} catch (error) {
			console.error(`Error retrieving properties: ${error}`);
			response.status(500).json({ error: 'Error retrieving properties' });
		}
	};

	/**
	 * Retrieves properties from the Rightmove API.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the properties data
	 */

	getRightmoveProperties = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		// Validate required properties exist in request body
		if (
			!request.body.identifier ||
			!request.body.sort ||
			!request.body.radius ||
			!request.body.bedrooms ||
			!request.body.furnishedType ||
			!request.body.typeOfLet ||
			request.body.page === undefined
		) {
			response
				.status(400)
				.json({ error: 'Missing required properties in request body' });
			return;
		}

		//Collect all of the request body properties
		const rightmoveRequestBody: RightmoveRequestBody = {
			identifier: request.body.identifier,
			sort: request.body.sort,
			radius: request.body.radius,
			bedrooms: request.body.bedrooms,
			furnishedType: request.body.furnishedType,
			typeOfLet: request.body.typeOfLet,
			page: request.body.page,
		};

		//Make the API call
		try {
			const rightmoveResponse: AxiosResponse = await axios.get(
				'https://uk-real-estate-rightmove.p.rapidapi.com/properties/search-rent',
				{
					params: rightmoveRequestBody,
					headers: {
						'x-rapidapi-key': this.apiKey,
						'x-rapidapi-host': this.apiHost,
					},
				},
			);
			const properties: Array<RightmoveProperty> =
				rightmoveResponse.data.data.properties;

			const convertedProperties: Array<NewProperty> =
				await this.convertRightmoveProperties(...properties);

			await this.addProperty(convertedProperties);
			response.status(200).json({ properties: convertedProperties });
		} catch (error) {
			console.error(`Error retrieving properties: ${error}`);
			response.status(500).json({ error: 'Error retrieving properties' });
		}
	};

	/**
	 * Allows for the conversion of the Rightmove API response to the database schema.
	 * @param {RightmoveResponse} rightmoveResponse - The response object from the Rightmove API
	 * @returns {Array<Property>} The properties array
	 */
	private convertRightmoveProperties = async (
		...rightmoveProperties: Array<RightmoveProperty>
	): Promise<Array<NewProperty>> => {
		const properties: Array<NewProperty> = [];
		rightmoveProperties.forEach((property: RightmoveProperty) => {
			properties.push({
				bedrooms: property.bedrooms,
				identifier: property.identifier,
				address: property.address,
				monthlyRent: property.monthlyRent.toString(),
				contactPhone: property.branch.contactTelephoneNumber as string,
				summary: property.summary,
				url: `https://www.rightmove.co.uk/properties/${property.identifier}`,
			});
		});
		return properties;
	};

	/**
	 * Adds a new property to the database from the Rightmove API response
	 * @param {Request} request - The request object containing the property data
	 * @param {Response} response - The response object
	 */
	private addProperty = async (
		properties: Array<NewProperty>,
	): Promise<void> => {
		try {
			await this.propertiesModel.insertProperties(properties);
		} catch (error) {
			console.error(`Error adding properties to the database: ${error}`);
			throw error;
		}
	};

	/**
	 * Retrieves a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getPropertyById = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);
			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}
			const property: Property | undefined =
				await this.propertiesModel.getPropertyById(id);
			if (!property) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}
			response.status(200).json({ property: property });
		} catch (error) {
			response.status(400).json({ error: 'Invalid ID' });
			return;
		}
	};

	/**
	 * Retrieves a property by its URL.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getPropertyByUrl = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const url: string = request.params.url;
		const property: Property | undefined =
			await this.propertiesModel.getPropertyByUrl(url);
		if (!property) {
			response.status(404).json({ error: 'Property not found' });
			return;
		}
		response.status(200).json({ property: property });
	};

	/**
	 * Retrieves a property by its identifier.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */

	getPropertyByIdentifier = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const identifier: number = parseInt(request.params.identifier);
			if (isNaN(identifier)) {
				response.status(400).json({ error: 'Invalid identifier' });
				return;
			}

			const property: Property | undefined =
				await this.propertiesModel.getPropertyByIdentifier(identifier);

			if (!property) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ property: property });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving property' });
			return;
		}
	};

	/**
	 * Retrieves the number of bedrooms for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getBedrooms = async (request: Request, response: Response): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const bedrooms: number | undefined =
				await this.propertiesModel.getBedrooms(id);

			if (!bedrooms) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ bedrooms: bedrooms });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving bedrooms' });
			return;
		}
	};

	/**
	 * Retrieves the monthly rent for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getMonthlyRent = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const monthlyRent: string | undefined =
				await this.propertiesModel.getMonthlyRent(id);

			if (!monthlyRent) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}
			response.status(200).json({ monthlyRent: monthlyRent });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving monthly rent' });
			return;
		}
	};

	/**
	 * Retrieves the address for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getAddress = async (request: Request, response: Response): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const address: string | undefined = await this.propertiesModel.getAddress(
				id,
			);

			if (!address) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ address: address });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving address' });
			return;
		}
	};

	/**
	 * Retrieves the contact phone for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getContactPhone = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const contactPhone: string | undefined =
				await this.propertiesModel.getContactPhone(id);

			if (!contactPhone) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ contactPhone: contactPhone });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving contact phone' });
			return;
		}
	};

	/**
	 * Retrieves the summary for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getSummary = async (request: Request, response: Response): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const summary: string | undefined = await this.propertiesModel.getSummary(
				id,
			);

			if (!summary) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ summary: summary });
		} catch (error) {
			console.error(`Error retrieving summary: ${error}`);
			response.status(500).json({ error: 'Error retrieving summary' });
			return;
		}
	};

	/**
	 * Retrieves the URL for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getUrl = async (request: Request, response: Response): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const url: string | undefined = await this.propertiesModel.getUrl(id);

			if (!url) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ url: url });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving URL' });
			return;
		}
	};

	/**
	 * Deletes a property from the database by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	deleteProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			if (!(await this.propertiesModel.getPropertyById(id))) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			await this.propertiesModel.deleteProperty(id);
			response.status(204).send();
		} catch (error) {
			response.status(500).json({ error: 'Error deleting property' });
			return;
		}
	};

	/**
	 * Updates a property in the database by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	updateProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			if (!(await this.propertiesModel.getPropertyById(id))) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			const property = request.body;
			const requiredFields: string[] = [
				'identifier',
				'bedrooms',
				'address',
				'monthlyRent',
				'summary',
				'contactPhone',
				'url',
			];

			for (const field of requiredFields) {
				if (!(field in property)) {
					response
						.status(400)
						.json({ error: `Missing required field: ${field}` });
					return;
				}
			}

			await this.propertiesModel.updateProperty(id, property);
			response.status(200).json({ message: 'Property updated successfully' });
		} catch (error) {
			response.status(500).json({ error: 'Error updating property' });
			return;
		}
	};

	/**
	 * Retrieves the identifier for a property by its ID.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	getIdentifier = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const id: number = parseInt(request.params.id);

			if (isNaN(id)) {
				response.status(400).json({ error: 'Invalid ID' });
				return;
			}

			const identifier: number | undefined =
				await this.propertiesModel.getIdentifier(id);

			if (!identifier) {
				response.status(404).json({ error: 'Property not found' });
				return;
			}

			response.status(200).json({ identifier: identifier });
		} catch (error) {
			response.status(500).json({ error: 'Error retrieving identifier' });
			return;
		}
	};

	/**
	 * Inserts a property into the database
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object
	 */
	insertProperty = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const property: NewProperty = {
				bedrooms: request.body.bedrooms,
				address: request.body.address,
				monthlyRent: request.body.monthlyRent,
				contactPhone: request.body.contactPhone,
				summary: request.body.summary,
				url: request.body.url,
				identifier: request.body.identifier,
			};

			if (
				!property.bedrooms ||
				!property.address ||
				!property.monthlyRent ||
				!property.contactPhone ||
				!property.summary ||
				!property.url ||
				!property.identifier
			) {
				response
					.status(400)
					.json({ error: 'Missing required property fields' });
				return;
			}

			const id: number = await this.propertiesModel.createProperty(property);
			response
				.status(200)
				.json({ message: 'Property inserted successfully', id: id });
		} catch (error) {
			response.status(500).json({ error: 'Error inserting property' });
			return;
		}
	};
}

/**
 * Factory function to create a new PropertiesApi instance.
 * @param {Database} db - The database instance
 * @returns {PropertiesApi} The PropertiesApi instance
 */

export default function propertiesApiFactory(
	db: NodePgDatabase<typeof schema>,
): PropertiesApi {
	return new PropertiesApi(db);
}
