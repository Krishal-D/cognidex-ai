import { userModel } from "../models/userModel"
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "../config/auth"
import { AuthUser, RefreshTokens } from "../types/user"
import { TokenPayload } from "../types"


export const authService = {


    async register(name: string, email: string, password: string): Promise<AuthUser> {

        const hashedPassword = await hashPassword(password)
        const user = await userModel.createUser(name, email, hashedPassword)
        const payload: TokenPayload = { id: user.id, email: user.email }


        const refreshToken = generateRefreshToken(payload)
        const accessToken = generateAccessToken(payload)

        await userModel.updateRefreshToken(user.id, refreshToken)

        return ({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,

            },
            refreshToken,
            accessToken
        })
    },

    async login(email: string, password: string): Promise<AuthUser> {
        const user = await userModel.findUserByEmail(email)

        if (!user || !user.password) {
            throw new Error("Invalid credentials")
        }
        const payload: TokenPayload = { id: user.id, email: user.email }
        const passwordCheck = await bcrypt.compare(password, user.password)

        if (!passwordCheck) {
            throw new Error("Invalid credentials")
        }


        const refreshToken = generateRefreshToken(payload)
        const accessToken = generateAccessToken(payload)

        await userModel.updateRefreshToken(user.id, refreshToken)

        return ({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,

            },
            refreshToken,
            accessToken
        })

    },

    async logout(token: string): Promise<void> {
        try {
            if (!token) {
                return
            }

            const user = await verifyRefreshToken(token);

            if (user?.id) {
                await userModel.removeRefreshToken(user.id);
            }
        } catch (error) {
            console.error("Invalid refresh token during logout");
        }
    },

    async refresh(token: string): Promise<RefreshTokens> {

        const user = await verifyRefreshToken(token)

        if (!user) {
            throw new Error("Invalid Token")
        }

        const newRefreshToken = generateRefreshToken(user)
        const newAccessToken = generateAccessToken(user)

        await userModel.updateRefreshToken(user.id, newRefreshToken)

        return ({
            newAccessToken,
            newRefreshToken
        })

    }

}


