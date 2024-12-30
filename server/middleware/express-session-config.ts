import session from 'express-session';
import { RequestHandler } from 'express';
//Session secret
const sessionSecret: string = process.env.SESSION_SECRET || '';

/*
 * Session middleware configuration to use for the application.
 * It allows for the session to be configured with the correct options based on the environment.
 */

const sessionConfig: session.SessionOptions = {
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false, httpOnly: true },
};

//If the environment is production (HTTPS), set the cookie to secure.
if (process.env.NODE_ENV === 'production') {
	sessionConfig.cookie!.secure = true;
}

//Export the session configuration.
const sessionMiddleware: RequestHandler = session(sessionConfig);

//Export the session configuration.
export default sessionMiddleware;
