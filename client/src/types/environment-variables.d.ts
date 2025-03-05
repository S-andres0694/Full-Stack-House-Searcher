/// <reference types="vite/client" />

/**
 * Environment variables for the client.
 */

interface ImportMetaEnv {
	/**
	 * The URL of the my server.
	 */
	readonly VITE_API_URL: string;
	//Add more env vars here.
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
