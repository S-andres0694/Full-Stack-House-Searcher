import axios, {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';

/**
 * Axios instance for making requests to the server
 */

const instance: AxiosInstance = axios.create({
	baseURL: 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 1000,
});

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

export default instance;
