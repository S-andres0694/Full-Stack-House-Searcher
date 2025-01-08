import { User } from '../types/authentication-types';
import jwt from 'jsonwebtoken';
import axiosInstance from '../services/axios-instance';
import {
	AxiosResponse,
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosError,
} from 'axios';

/**
 * This file contains the utilities for the authentication services.
 */

/**
 * This function is used to retrieve the user's data from a JWT Token.
 * @param token - The JWT Token.
 * @returns The user's data.
 */

export const getUserFromJWTToken = (token: string): User => {
	try {
		const decodedToken = jwt.decode(token) as User;
		if (
			decodedToken &&
			decodedToken.id &&
			decodedToken.email &&
			decodedToken.role &&
			decodedToken.name &&
			decodedToken.username
		) {
			return decodedToken;
		} else {
			throw new Error('Invalid token: Missing required user properties');
		}
	} catch (error) {
		throw new Error('Invalid token');
	}
};

/**
 * This function is used to retrieve the user's data from the server if the user is logged in through Google OAuth2.
 * @param the userID from the Google OAuth2 strategy.
 * @returns The user's data.
 */

export const getUserFromGoogleOAuth2 = async (): Promise<User> => {
	try {
		const response: AxiosResponse = await axiosInstance.get(
			'/auth/google/whoami',
		);
		const user: User = response.data.user;
		return user;
	} catch (error) {
		throw new Error('Failed to retrieve user data');
	}
};

/**
 * Adds interceptors to the axios instance to add the token to the headers once the user is logged in.
 * @param instance - The axios instance
 * @param token - The token to add to the headers
 */

export const addAccessTokenInterceptorToInstance = async (
	instance: AxiosInstance,
	token: string,
): Promise<void> => {
	instance.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			config.headers.Authorization = `Bearer ${token}`;
			return config;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		},
	);
};

/**
 * Adds interceptors to the axios instance to refresh the token if the user is logged in.
 * @param instance - The axios instance
 */

export const addRefreshTokenInterceptorToInstance = async (
	instance: AxiosInstance,
): Promise<void> => {
	instance.interceptors.response.use(async (response: AxiosResponse) => {
		if (
			response.status === 401 &&
			response.data.message === 'Invalid or expired access token'
		) {
			try {
				const refreshTokenRequest: Response = await fetch(
					'http://localhost:3000/auth/refresh-token',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						credentials: 'include',
					},
				);
				const textResponse = await refreshTokenRequest.json();
				const accessToken: string = textResponse.accessToken;
				await addAccessTokenInterceptorToInstance(instance, accessToken);
			} catch (error) {
				window.location.href = '/auth/login';
			}
		}
		return response;
	});
};
