import express, { Application } from "express";
import morgan from "morgan";
import path from "path";
import { createBackup, databaseCreator, dbProductionOptions, initialValues, runMigrations } from './database/init-db';
import connectionGenerator from './database/init-db';
import { drizzle } from "drizzle-orm/better-sqlite3";
import userRoutes from "./routes/user_routes";
import { UsersModel } from "./models/users";

//Express application
const app: Application = express();

const dbPath = __dirname + "/database/database.sqlite";
const db = connectionGenerator(dbPath, dbProductionOptions);

//Logging middleware
app.use(morgan("common"));

//Static file serving
app.use(express.static(path.join(__dirname, "dist/public")));

//Extra middleware
app.use(express.json());

//Routes
app.use("/users", userRoutes);

// Initialize models
const models = {
  usersModel: new UsersModel(drizzle(db))
};

// Add models to app.locals
app.locals.models = models;

//Start the database in the server.
(async () => {
  const initializationStatus = await databaseCreator(dbPath, dbProductionOptions);
  runMigrations(drizzle(db), __dirname + "/database/migrations");
  await initialValues(db);
  if (initializationStatus) {
    console.log("Database initialized successfully.");
  } else {
    console.error("Database initialization failed.");
  }
})();

//Export the app for other files to use.
export default app;
