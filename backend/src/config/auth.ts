import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '../types'
import bcrypt from 'bcrypt'
import { userModel } from '../models/userModel'


dotenv.config()

const JWT_SECRET: string = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!
const SALT_ROUNDS = 12


export const generateAccessToken = (user: TokenPayload): string => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" })
}


export const generateRefreshToken = (user: TokenPayload): string => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {

    try {
        const payload = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload

        const user = await userModel.verifyRefreshToken(payload.id, token);
        if (!user) {
            throw new Error("Refresh token not found or revoked");
        }

        return user;

    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

