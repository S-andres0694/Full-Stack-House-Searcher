/**
 * This file contains the services for the user dashboard.
 */

import { AxiosResponse } from 'axios';
import instance from './axios-instance';
import { ViewedProperties } from '../types/user-service-types';

/**
 * Shows all of the recently viewed properties for a user.
 * @param id - The id of the user to show the recently viewed properties for.
 * @returns an AxiosResponse<ViewedProperties[]> object verifying the result of the update operation.
 */
export const getUsersViewedProperties = async (
	id: number,
): Promise<ViewedProperties[]> => {
	try {
		const response: AxiosResponse<any> = await instance.get(
			`/viewed-properties/${id}`,
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}
		return response.data.properties as ViewedProperties[];
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Adds a property to the recently viewed properties for a user.
 * @param id - The id of the user to add the property to.
 * @param propertyId - The id of the property to add to the recently viewed properties.
 * @returns {boolean} - A boolean indicating the success of the operation.
 */
export const addPropertyToUsersViewedProperties = async (
	id: number,
	propertyId: number,
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.post(
			`/viewed-properties/${id}`,
			{ propertyId },
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}

		if (response.status === 200) {
			return true;
		}
		return false;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Deletes a property from the viewed properties list for a specific user.
 * @param {number} id - The id of the user to delete the property from.
 * @param {number} propertyId - The id of the property to delete from the viewed properties list.
 * @returns {boolean} - A boolean indicating the success of the operation.
 */
export const deletePropertyFromUsersViewedProperties = async (
	id: number,
	propertyId: number,
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.delete(
			`/viewed-properties/${id}`,
			{ data: { propertyId } },
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}

		if (response.status === 200) {
			return true;
		}
		return false;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Clears the history of the user's viewed properties.
 * @param {number} id - The id of the user to clear the viewed properties history for.
 * @returns {boolean} - A boolean indicating the success of the operation.
 */
export const clearUsersViewedProperties = async (
	id: number,
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.delete(
			`/viewed-properties/${id}/clear`,
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}

		if (response.status === 200) {
			return true;
		}
		return false;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Gets the last viewed property for a user.
 * @param {number} id - The id of the user to get the last viewed property for.
 * @returns {ViewedProperties} - The last viewed property for the user.
 */
export const getLastViewedProperty = async (
	id: number,
): Promise<ViewedProperties> => {
	try {
		const response: AxiosResponse<any> = await instance.get(
			`/viewed-properties/${id}/last`,
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}
		return response.data.property as ViewedProperties;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Inserts multiple properties into the viewed properties list for a user.
 * @param {number} id - The id of the user to insert the properties into.
 * @param {number[]} propertyIds - The ids of the properties to insert into the viewed properties list.
 * @returns {boolean} - A boolean indicating the success of the operation.
 */
export const insertMultiplePropertiesIntoUsersViewedProperties = async (
	id: number,
	propertyIds: number[],
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.post(
			`/viewed-properties/multiple/${id}`,
			{ propertyIds },
		);
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}
		return response.status === 200;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
