import { sql } from 'drizzle-orm';
import { pgTable, unique } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

//Defines the users table.
export const users = pgTable(
	'users',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		username: t.text('username').notNull(),
		name: t.text('name').notNull(),
		password: t.text('password').notNull(),
		email: t.text('email').notNull(),
		createdAt: t
			.timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		role: t
			.text('role')
			.notNull()
			.references(() => roles.roleName),
	},
	(table) => [unique().on(table.username, table.email)],
); // Creates a unique constraint on the username and email columns.

// Defines the properties table.
export const properties = pgTable(
	'properties',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		bedrooms: t.integer('bedrooms').notNull(),
		address: t.text('address').notNull(),
		monthlyRent: t.text('monthly_rent').notNull(),
		contactPhone: t.text('contact_phone').notNull(),
		summary: t.text('summary').notNull(),
		url: t.text('url').notNull(),
		identifier: t.integer('identifier').notNull(),
	},
	(table) => [unique().on(table.identifier)],
);

// Defines the roles table.
export const roles = pgTable(
	'roles',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		roleName: t.text('role_name').notNull(),
		description: t.text('description'),
	},
	(table) => [unique().on(table.roleName)],
);

// Defines the favorites table.
export const favorites = pgTable(
	'favorites',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
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
); // Creates a unique constraint on the userId and propertyId columns.

// Defines the viewed properties table.
export const viewedProperties = pgTable(
	'viewed_properties',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
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
); // Creates a unique constraint on the userId and propertyId columns.

// Defines the invitation tokens table for each one of the users.
export const invitationTokens = pgTable(
	'invitation_tokens',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		token: t.text('token').notNull(),
	},
	(table) => [unique().on(table.token)],
);

// Defines a table for the invitation tokens that were already used before.
export const usedInvitationTokens = pgTable(
	'used_invitation_tokens',
	{
		id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		used_tokenID: t
			.integer('used_token_id')
			.notNull()
			.references(() => invitationTokens.id),
	},
	(table) => [unique().on(table.used_tokenID)],
);
