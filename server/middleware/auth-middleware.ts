import { NextFunction } from "express";
import { Request, Response } from "express";
import { User } from "../models/table-types";

/**
 * Middleware to check if the user is authenticated through the Google OAuth2 strategy.
 */

export const isUserLoggedInThroughGoogle = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || typeof req.user !== 'object') {
        return res.redirect('/auth/login');
    }

    const user: User = req.user as User;
    console.log(`User ${user.username} is logged in through Google OAuth2.`);

    //Allows the user to continue on to the next middleware.
    next();
};
