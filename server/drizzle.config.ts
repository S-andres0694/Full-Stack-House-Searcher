import { defineConfig } from "drizzle-kit";

//Configuration for the Drizzle
export default defineConfig({
  dialect: "sqlite",
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dbCredentials: {
    url: "./database/database.sqlite",
  },
  verbose: true,
});
