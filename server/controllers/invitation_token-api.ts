import { Request, Response, RequestHandler } from 'express';
import invitationTokenModelFactory from '../models/invitation-token';
import { InvitationTokenModel } from '../models/invitation-token';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import randomstring from 'randomstring';
import { InvitationToken } from '../types/table-types';

/**
 * Test API to make sure that the endpoint is working.
 * @param {Request} request - The request object
 * @param {Response} response - The response object to send the user data
 */

export const testApi: RequestHandler = async (req: Request, res: Response) => {
	res.status(200).json({ message: 'Server is running' });
};

/**
 * Class containing all of the invitation token API endpoints and their handler functions.
 */

export default class InvitationTokenApi {
	//Invitation Token Model Instance
	private invitationTokenModel: InvitationTokenModel;

	constructor(private db: NodePgDatabase<typeof schema>) {
		this.invitationTokenModel = invitationTokenModelFactory(this.db);
	}

	/**
	 * Generates an invitation token for a user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */

	generateInvitationToken = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const invitationToken: string = randomstring.generate({
			length: 30,
			charset: 'alphanumeric',
		});
		try {
			this.invitationTokenModel.createInvitationToken(invitationToken);
			response.status(200).json({ token: invitationToken });
		} catch (error) {
			response
				.status(500)
				.json({ message: 'Failed to generate invitation token' });
		}
	};

	/**
	 * Verifies an invitation token for a user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */

	verifyInvitationToken = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		try {
			const invitationToken: InvitationToken | false | undefined =
				await this.invitationTokenModel.isInvitationTokenValid(
					request.params.token,
				);

			if (invitationToken === false) {
				response.status(200).json({ status: 'used' });
				return;
			}

			if (invitationToken === undefined) {
				response.status(200).json({ status: 'not found' });
				return;
			}

			response.status(200).json({ status: 'valid' });
		} catch (error) {
			response
				.status(500)
				.json({ message: 'Failed to verify invitation token' });
		}
	};

	/**
	 * Consumes an invitation token for a user.
	 * @param {Request} request - The request object
	 * @param {Response} response - The response object to send the user data
	 */

	consumeInvitationToken = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const invitationToken: string = request.params.token;
		try {
			const isValid: InvitationToken | false | undefined =
				await this.invitationTokenModel.isInvitationTokenValid(invitationToken);
			if (!isValid) {
				response
					.status(400)
					.json({ message: 'Invalid or already used invitation token' });
				return;
			}
			await this.invitationTokenModel.consumeInvitationToken(invitationToken);
			response
				.status(200)
				.json({ message: 'Invitation token consumed successfully' });
		} catch (error) {
			response
				.status(500)
				.json({ message: 'Failed to consume invitation token' });
		}
	};
}
