import jwt from 'jsonwebtoken';
import { User } from '../models/table-types';

//Secret key for the JWT to enable the symmetric encryption.
const JWT_SECRET: string = process.env.JWT_SECRET || '';

/**
 * Generates a JWT token for the given payload.
 * @param payload - The payload to be encoded in the token.
 * @returns The JWT token.
 */
export function generateToken(user: User): string {
    return jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
}
