import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';
import {
	createBackup,
	databaseCreator,
	dbProductionOptions,
	initialValues,
	runMigrations,
} from './database/init-db';
import connectionGenerator from './database/init-db';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import userRoutesFactory from './routes/user_routes';
import { UsersModel } from './models/users';
import { Database } from 'better-sqlite3';
import propertiesRoutesFactory from './routes/properties_routes';
import rolesRoutesFactory from './routes/roles_routes';
import viewedPropertiesRoutesFactory from './routes/viewed_properties-routes';
import authenticationRoutesFactory from './routes/authentication-routes';
import sessionMiddleware from './middleware/express-session-config';
import { passportObj } from './authentication/google-auth.config';
import {
	isUserLoggedInThroughGoogle,
	isUserLoggedInThroughJWT,
} from './middleware/auth-middleware';
import cookieParser from 'cookie-parser';
//Express application
const app: Application = express();

const dbPath: string =
	process.env.DB_PATH || __dirname + '/database/database.sqlite';
const migrationsPath: string =
	process.env.MIGRATIONS_PATH || __dirname + '/database/migrations';
const db: Database = connectionGenerator(dbPath, dbProductionOptions);

//Logging middleware
app.use(morgan('common'));

//Static file serving
app.use(express.static(path.join(__dirname, 'dist/public')));

//Extra middleware
app.use(express.json());

//Session middleware
app.use(sessionMiddleware);

//Cookie parser middleware
app.use(cookieParser());

//Passport middleware
app.use(passportObj.initialize());
app.use(passportObj.session());

//Routes with authentication support
app.use('/users', userRoutesFactory(dbPath));
app.use('/properties', propertiesRoutesFactory(dbPath));
app.use('/roles', rolesRoutesFactory(dbPath));
app.use('/viewed-properties', viewedPropertiesRoutesFactory(dbPath));

//Authentication routes
app.use('/auth', authenticationRoutesFactory(dbPath));

//Start the database in the server.
(async () => {
	const initializationStatus: boolean = await databaseCreator(
		dbPath,
		dbProductionOptions,
	);
	runMigrations(drizzle(db), migrationsPath);
	await initialValues(db);
	if (initializationStatus) {
		console.log('Database initialized successfully.');
	} else {
		console.error('Database initialization failed.');
	}
})();

//Export the app for other files to use.
export default app;
