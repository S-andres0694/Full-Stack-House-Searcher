import axios, { AxiosInstance } from 'axios';

/**
 * Axios instance for making requests to the server
 */

const instance: AxiosInstance = axios.create({
	baseURL: process.env.SERVER_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 1000,
});

export default instance;
