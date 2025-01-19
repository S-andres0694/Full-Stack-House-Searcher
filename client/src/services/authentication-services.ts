import { AxiosResponse } from 'axios';
import axiosInstance from './axios-instance';
import {
	LogoutResponse,
	LoginResponse,
	RegisterRequest,
	LoginWithJWTRequest,
} from '../types/authentication-types';
import {
	addAccessTokenInterceptorToInstance,
	addRefreshTokenInterceptorToInstance,
} from '../utils/authentication-utilities';

/**
 * This file contains the authentication services for the application.
 */

/**
 * Makes a request to the server to login the user through the Google OAuth2 Strategy.
 */

export const loginWithGoogleOAuth2 = async (): Promise<void> => {
	try {
		window.location.href = `${axiosInstance.defaults.baseURL}/auth/google`;
	} catch (error) {
		throw new Error('Failed to login with Google OAuth2');
	}
};

/**
 * Makes a request to the server to logout the user.
 * @returns A promise that resolves to the logout response.
 */

export const logout = async (): Promise<LogoutResponse> => {
	try {
		const response: AxiosResponse = await axiosInstance.get('/auth/logout');
		if (response.status === 200) {
			const logoutResponse: LogoutResponse = response.data;
			return logoutResponse;
		} else {
			throw new Error('Failed to logout');
		}
	} catch (error) {
		throw new Error('Failed to logout');
	}
};

/**
 * Makes a request to the server to register a new user.
 * @param registerRequest - The request to register a new user.
 */

export const register = async (
	registerRequest: RegisterRequest,
): Promise<void> => {
	const response: AxiosResponse = await axiosInstance.post(
		'/auth/register',
		registerRequest,
	);
	if (
		response.status === 200 &&
		response.data.message === 'User created successfully.'
	) {
		window.location.href = '/login';
	} else {
		throw new Error(response.data.message);
	}
};

/**
 * Makes a request to the server to login through the JWT Strategy.
 * @param loginRequest - The request to login.
 * @returns A promise that resolves to the access token.
 */

export const loginThroughJWT = async (
	loginRequest: LoginWithJWTRequest,
): Promise<void> => {
	const response: AxiosResponse = await axiosInstance.post(
		'/auth/login',
		loginRequest,
	);
	if (response.status === 200) {
		const loginResponse: LoginResponse = response.data;
		const accessToken: string = loginResponse.accessToken;
		//Once the user is logged in, add the interceptors to automatically attach the token and to make requests to refresh the token when necessary.
		await addAccessTokenInterceptorToInstance(axiosInstance, accessToken);
		await addRefreshTokenInterceptorToInstance(axiosInstance);
	} else {
		throw new Error(response.data.message);
	}
};

/**
 * Checks if an email exists in the database.
 * @param email - The email to check.
 * @returns A promise that resolves to a boolean.
 */

export const checkEmailExists = async (email: string): Promise<boolean> => {
	const response: AxiosResponse = await axiosInstance.get(
		`/users/check-email?email=${email}`,
	);
	if (response.status === 200) {
		return response.data.exists;
	} else {
		throw new Error(response.data.error);
	}
};
