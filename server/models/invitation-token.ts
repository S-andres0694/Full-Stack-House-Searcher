import { eq } from 'drizzle-orm';
import { invitationTokens, usedInvitationTokens } from '../database/schema';
import { InvitationToken, UsedInvitationToken } from '../types/table-types';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

export class InvitationTokenModel {
	constructor(private db: NodePgDatabase<typeof schema>) {}

	/**
	 * Checks if an invitation token is valid.
	 * @param {string} invitationToken - The invitation token to check
	 * @returns {Promise<InvitationToken | false | undefined>} The invitation token if it is valid, false if it has been used, undefined if it does not exist
	 */
	async isInvitationTokenValid(
		invitationToken: string,
	): Promise<InvitationToken | false | undefined> {
		const invitationTokenRecord: InvitationToken[] | undefined = await this.db
			.select()
			.from(invitationTokens)
			.where(eq(invitationTokens.token, invitationToken));

		if (invitationTokenRecord.length === 0) {
			return undefined;
		}

		if (await this.hasInvitationTokenBeenUsed(invitationTokenRecord[0].token)) {
			return false;
		}

		return invitationTokenRecord[0];
	}

	/**
	 * Consumes the invitation token by placing it in the used_invitation_tokens table.
	 * @param {string} invitationToken - The invitation token to consume
	 * @returns {Promise<void>}
	 */

	async consumeInvitationToken(invitationToken: string): Promise<void> {
		try {
			const invitationTokenID: number | undefined =
				await this.getInvitationTokenID(invitationToken);
			if (invitationTokenID === undefined) {
				throw new Error('Invitation token ID not found');
			}
			await this.db.transaction(async (tx) => {
				await tx
					.insert(usedInvitationTokens)
					.values({ used_tokenID: invitationTokenID });
			});
		} catch (error) {
			throw new Error('Failed to consume invitation token');
		}
	}

	/**
	 * Gets the ID of an invitation token.
	 * @param {string} invitationToken - The invitation token to get the ID of
	 * @returns {Promise<number | undefined>} The ID of the invitation token, undefined if it does not exist
	 */

	private async getInvitationTokenID(
		invitationToken: string,
	): Promise<number | undefined> {
		const invitationTokenRecord: InvitationToken[] | undefined = await this.db
			.select()
			.from(invitationTokens)
			.where(eq(invitationTokens.token, invitationToken));

		return invitationTokenRecord[0].id;
	}

	/**
	 * Checks if an invitation token has been used before.
	 * @param {number} id - The ID of the invitation token to check
	 * @returns {Promise<boolean>} True if the invitation token has been used, false otherwise
	 */

	private async hasInvitationTokenBeenUsed(
		invitationToken: string,
	): Promise<boolean> {
		const invitationTokenID: number | undefined = await this.db
			.select()
			.from(invitationTokens)
			.where(eq(invitationTokens.token, invitationToken))
			.then((result) => result[0].id);

		if (invitationTokenID === undefined) {
			return false;
		}

		const invitationTokenRecord: UsedInvitationToken[] = await this.db
			.select()
			.from(usedInvitationTokens)
			.where(eq(usedInvitationTokens.used_tokenID, invitationTokenID));

		return invitationTokenRecord.length > 0;
	}

	/**
	 * Creates an invitation token for a user.
	 * @param {string} invitationToken - The invitation token to create
	 * @returns {Promise<void>}
	 */

	async createInvitationToken(
		invitationToken: string,
	): Promise<InvitationToken | undefined> {
		try {
			const result = await this.db.transaction(async (tx) => {
				return await tx
					.insert(invitationTokens)
					.values({ token: invitationToken })
					.returning();
			});
			return result[0];
		} catch (error) {
			console.error('Failed to create invitation token:', error);
			return undefined;
		}
	}
}

/**
 * Factory function to create an instance of InvitationTokenModel.
 * @param {NodePgDatabase<typeof schema>} db - The database connection instance
 * @returns {InvitationTokenModel} An instance of InvitationTokenModel
 */

export default function invitationTokenModelFactory(
	db: NodePgDatabase<typeof schema>,
): InvitationTokenModel {
	return new InvitationTokenModel(db);
}
