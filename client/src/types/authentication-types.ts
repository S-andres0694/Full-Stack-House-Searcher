/**
 * This file contains the types for the authentication services.
 */

/**
 * This type represents the request body for the login with JWT strategy.
 * @property email - The email of the user.
 * @property password - The password of the user.
 */

export type LoginWithJWTRequest = {
	email: string;
	password: string;
};

/**
 * This type represents the request body when registering a new user.
 * @property email - The email of the user.
 * @property password - The password of the user.
 * @property role - The role of the user.
 */
export type RegisterRequest = {
	email: string;
	password: string;
	confirmPassword: string;
	name: string;
	username: string;
	invitationToken: string;
};

/**
 * This type represents the user object.
 * @property id - The id of the user.
 * @property role - The role of the user.
 * @property email - The email of the user.
 * @property name - The name of the user.
 * @property username - The username of the user.
 */

export type User = {
	id: string;
	role: string;
	email: string;
	name: string;
	username: string;
};

/**
 * This type represents the response from the server when logging out.
 * @property message - The message from the server.
 */

export type LogoutResponse = {
	message: string;
};

/**
 * This type represents the response body for the login with JWT strategy.
 * @property message - The message from the server.
 */

export type LoginResponse = {
	accessToken: string;
};
