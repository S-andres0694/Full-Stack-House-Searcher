import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';
import connectionGenerator, {
	databaseCreator,
	initialValues,
	runMigrations,
} from './database/init-db.v2';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './database/schema';
import userRoutesFactory from './routes/user_routes';
import propertiesRoutesFactory from './routes/properties_routes';
import rolesRoutesFactory from './routes/roles_routes';
import viewedPropertiesRoutesFactory from './routes/viewed_properties-routes';
import authenticationRoutesFactory from './routes/authentication-routes';
import sessionMiddleware from './middleware/express-session-config';
import { passportObj } from './authentication/google-auth.config';
import cookieParser from 'cookie-parser';
import { databaseConfiguration } from './database/init-db.v2';
//Express application
const app: Application = express();

//Path containing the migration .SQL files.
const migrationsPath: string =
	process.env.MIGRATIONS_PATH || __dirname + '/database/migrations';

//Database connection
const db: NodePgDatabase<typeof schema> = connectionGenerator(
	databaseConfiguration,
);

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
app.use('/users', userRoutesFactory(db));
app.use('/properties', propertiesRoutesFactory(db));
app.use('/roles', rolesRoutesFactory(db));
app.use('/viewed-properties', viewedPropertiesRoutesFactory(db));

//Authentication routes
app.use('/auth', authenticationRoutesFactory(db));

//Start the database in the server.
(async () => {
	const initializationStatus: boolean = await databaseCreator(
		databaseConfiguration,
	);
	runMigrations(db, migrationsPath);
	await initialValues(db);
	if (initializationStatus) {
		console.log('Database initialized successfully.');
	} else {
		console.error('Database initialization failed.');
	}
})();

//Export the app for other files to use.
export default app;
