import { userModel } from "../models/userModel"
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "../config/auth"
import { AuthUser, RefreshTokens, User } from "../types/user"
import { TokenPayload } from "../types"
import { authError, notFoundError, validationError } from "../utils/errors"

export const authService = {
    async register(name: unknown, email: unknown, password: unknown): Promise<AuthUser> {
        if (!name || typeof name !== "string" || !name.trim()) throw validationError("Name is required");
        if (!email || typeof email !== "string" || !email.trim()) throw validationError("Email is required");
        if (!password || typeof password !== "string" || !password.trim()) throw validationError("Password is required");

        const existing = await userModel.findUserByEmail(email.trim());
        if (existing) throw Object.assign(new Error("Email already in use"), { status: 409 });

        const hashedPassword = await hashPassword(password);
        const user = await userModel.createUser(name.trim(), email.trim(), hashedPassword);
        const payload: TokenPayload = { id: user.id, email: user.email };

        const refreshToken = generateRefreshToken(payload);
        const accessToken = generateAccessToken(payload);

        await userModel.updateRefreshToken(user.id, refreshToken);

        return { user: { id: user.id, name: user.name, email: user.email }, refreshToken, accessToken };
    },

    async login(email: unknown, password: unknown): Promise<AuthUser> {
        if (!email || typeof email !== "string" || !email.trim()) throw validationError("Email is required");
        if (!password || typeof password !== "string") throw validationError("Password is required");

        const user = await userModel.findUserByEmail(email.trim());
        if (!user || !user.password) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

        const payload: TokenPayload = { id: user.id, email: user.email };
        const refreshToken = generateRefreshToken(payload);
        const accessToken = generateAccessToken(payload);

        await userModel.updateRefreshToken(user.id, refreshToken);

        return { user: { id: user.id, name: user.name, email: user.email }, refreshToken, accessToken };
    },

    async logout(token: unknown): Promise<void> {
        if (!token || typeof token !== "string") throw validationError("Refresh token is required");

        try {
            const user = await verifyRefreshToken(token);
            if (user?.id) await userModel.removeRefreshToken(user.id);
        } catch {
            // Invalid/expired refresh token — logout should still succeed
        }
    },

    async updateProfile(userId: number | undefined, name: unknown): Promise<Pick<User, "id" | "name" | "email">> {
        if (!userId) throw authError();
        if (!name || typeof name !== "string" || !name.trim()) throw validationError("Name is required");

        const user = await userModel.updateName(userId, name.trim());
        if (!user) throw notFoundError("User not found");

        return { id: user.id, name: user.name, email: user.email };
    },

    async refresh(token: unknown): Promise<RefreshTokens> {
        if (!token || typeof token !== "string") throw Object.assign(new Error("Refresh token is required"), { status: 401 });

        const user = await verifyRefreshToken(token);
        if (!user) throw Object.assign(new Error("Invalid token"), { status: 401 });

        const newRefreshToken = generateRefreshToken(user);
        const newAccessToken = generateAccessToken(user);

        await userModel.updateRefreshToken(user.id, newRefreshToken);

        return { newAccessToken, newRefreshToken };
    }
}

