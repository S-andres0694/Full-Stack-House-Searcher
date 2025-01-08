import axiosInstance from './axios-instance';

/**
 * This file contains the authentication services for the application.
 */

/**
 * This function is used to login the user through the Google OAuth2 Strategy.
 * @param code - The code received from the Google OAuth2 Strategy.
 * @returns A promise that resolves to the user's data.
 */

export const loginWithGoogleOAuth2 = async () => {
	const response = await axiosInstance.get('/auth/google');
	return response.data;
};
