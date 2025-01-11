PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitation_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_invitation_tokens`("id", "token") SELECT "id", "token" FROM `invitation_tokens`;--> statement-breakpoint
DROP TABLE `invitation_tokens`;--> statement-breakpoint
ALTER TABLE `__new_invitation_tokens` RENAME TO `invitation_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_tokens_token_unique` ON `invitation_tokens` (`token`);