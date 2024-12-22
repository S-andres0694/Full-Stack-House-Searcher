import { roles, properties, favorites, users, viewedProperties } from "../database/schema";

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