//Defines the schema for the database.

import { sql } from 'drizzle-orm';
import { sqliteTable, unique } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';

//Defines the users table.
export const users = sqliteTable(
	'users',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		username: t.text('username').notNull(),
		name: t.text('name').notNull(),
		password: t.text('password').notNull(),
		email: t.text('email').notNull(),
		createdAt: t
			.integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		role: t
			.text('role')
			.notNull()
			.references(() => roles.roleName),
	},
	(table) => [unique().on(table.username, table.email)], //Creates a unique constraint on the username and email columns.
);

//Defines the properties table.
export const properties = sqliteTable(
	'properties',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		bedrooms: t.integer('bedrooms').notNull(),
		address: t.text('address').notNull(),
		monthlyRent: t.text('monthly_rent').notNull(),
		contactPhone: t.text('contact_phone').notNull(),
		summary: t.text('summary').notNull(),
		url: t.text('url').notNull(),
		identifier: t.integer('identifier').notNull(),
	},
	(table) => [],
);

//Defines the roles table.
export const roles = sqliteTable(
	'roles',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		roleName: t.text('role_name').notNull(),
		description: t.text('description'),
	},
	(table) => [unique().on(table.roleName)],
);

//Defines the favorites table.
export const favorites = sqliteTable(
	'favorites',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		userId: t
			.integer('user_id')
			.notNull()
			.references(() => users.id),
		propertyId: t
			.integer('property_id')
			.notNull()
			.references(() => properties.id),
	},
	(table) => [unique().on(table.userId, table.propertyId)],
); //Creates a unique constraint on the userId and propertyId columns.

//Defines the viewed properties table.
export const viewedProperties = sqliteTable(
	'viewed_properties',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		userId: t
			.integer('user_id')
			.notNull()
			.references(() => users.id),
		propertyId: t
			.integer('property_id')
			.notNull()
			.references(() => properties.id),
	},
	(table) => [unique().on(table.userId, table.propertyId)],
); //Creates a unique constraint on the userId and propertyId columns.

//Defines the invitation tokens table for each one of the users.
export const invitationTokens = sqliteTable(
	'invitation_tokens',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		token: t.text('token').notNull(),
	},
	(table) => [unique().on(table.token)],
);

//Defines a table for the invitation tokens that were already used before.
export const usedInvitationTokens = sqliteTable(
	'used_invitation_tokens',
	{
		id: t.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		used_tokenID: t
			.integer('used_token_id')
			.notNull()
			.references(() => invitationTokens.id),
	},
	(table) => [unique().on(table.used_tokenID)],
);
