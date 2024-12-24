import { dbTestOptions } from "../database/init-db";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Database } from "better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { databasePath, dbProductionOptions } from "../database/init-db";
import connectionGenerator from "../database/init-db";
import {
  roles,
  properties,
  favorites,
  users,
  viewedProperties,
} from "../database/schema";

// Define types based on schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type ViewedProperty = typeof viewedProperties.$inferSelect;
export type NewViewedProperty = typeof viewedProperties.$inferInsert;
