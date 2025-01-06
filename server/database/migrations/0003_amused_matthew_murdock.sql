CREATE TABLE `invitation_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_tokens_token_unique` ON `invitation_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `used_invitation_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`used_token_id` integer NOT NULL,
	FOREIGN KEY (`used_token_id`) REFERENCES `invitation_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `used_invitation_tokens_used_token_id_unique` ON `used_invitation_tokens` (`used_token_id`);