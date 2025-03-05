import axios, { AxiosInstance } from 'axios';

/**
 * Axios instance for making requests to the server
 */

const instance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 1000,
});

export default instance;
