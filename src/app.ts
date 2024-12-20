import express, { Application } from "express";
import morgan from "morgan";
import path from "path";
import { databaseCreator } from "./database/init-db";


//Express application
const app: Application = express();

//Logging middleware
app.use(morgan("common"));

//Static file serving
app.use(express.static(path.join(__dirname, "dist/public")));

//Extra middleware
app.use(express.json());

//Start the database in the server.
databaseCreator(__dirname + "/database/database.sqlite");

//Export the app for other files to use.
export default app;
