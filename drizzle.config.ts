import { defineConfig } from "drizzle-kit";

//Configuration for the Drizzle
export default defineConfig({
  dialect: "sqlite", 
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dbCredentials: {
      url: "./src/database/database.sqlite",
  },
  verbose: true,
});
