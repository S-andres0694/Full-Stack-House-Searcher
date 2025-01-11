import { AxiosResponse } from 'axios';
import { userInfoAdminDashboard } from '../types/admin-types';
import instance from './axios-instance';

/**
 * Gets all public user information for the admin dashboard.
 * @returns AxiosResponse<userInfoAdminDashboard[]>
 */

const getAllUsersForDashboard = async (): Promise<
	AxiosResponse<userInfoAdminDashboard[]>
> => {
	try {
		const response: AxiosResponse<userInfoAdminDashboard[]> =
			await instance.get('/users');
		if (response.status !== 200) {
			throw new Error('Failed to fetch users');
		}
		return response;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Allows you to update a user's email.
 * @param id - The id of the user to update.
 * @param newEmail - The new email to update the user to.
 * @returns a boolean verifying the result of the update operation.
 */

const updateUserEmail = async (
	id: number,
	newEmail: string,
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.put(
			`/users/${id}/email`,
			{ newEmail },
		);

		//Handle all errors using the message in the response.
		if (response.status >= 400) {
			throw new Error(response.data.error);
		}

		return true;
	} catch (error: any) {
		console.error(error.message);
		throw error;
	}
};

/**
 * Allows you to update a user's username.
 * @param id - The id of the user to update.
 * @param newUsername - The new username to update the user to.
 * @returns a boolean verifying the result of the update operation.
 */

const updateUserUsername = async (
	id: number,
	newUsername: string,
): Promise<boolean> => {
	try {
		const response: AxiosResponse<any> = await instance.put(
			`/users/${id}/username`,
			{ newUsername },
		);

		if (response.status >= 400) {
			throw new Error(response.data.error);
		}

		return true;
	} catch (error: any) {
		console.error(error.message);
		throw error;
	}
};

/** */
