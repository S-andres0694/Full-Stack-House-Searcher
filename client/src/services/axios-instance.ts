import axios, {
	AxiosInstance,
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

export default instance;
