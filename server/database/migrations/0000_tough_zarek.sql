CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`property_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_user_id_property_id_unique` ON `favorites` (`user_id`,`property_id`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bedrooms` integer NOT NULL,
	`address` text NOT NULL,
	`monthly_rent` text NOT NULL,
	`contact_phone` text NOT NULL,
	`summary` text NOT NULL,
	`url` text NOT NULL,
	`identifier` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `properties_address_url_identifier_unique` ON `properties` (`address`,`url`,`identifier`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_role_name_unique` ON `roles` (`role_name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`role` text NOT NULL,
	FOREIGN KEY (`role`) REFERENCES `roles`(`role_name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_email_unique` ON `users` (`username`,`email`);--> statement-breakpoint
CREATE TABLE `viewed_properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`property_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `viewed_properties_user_id_property_id_unique` ON `viewed_properties` (`user_id`,`property_id`);