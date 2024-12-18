import express, { Application } from "express";
import morgan from "morgan";
import path from "path";

//Express application
const app: Application = express();

//Logging middleware
app.use(morgan("common"));

//Static file serving
app.use(express.static(path.join(__dirname, "dist/public")));

//Extra middleware
app.use(express.json());

//Export the app for other files to use.
export default app;
