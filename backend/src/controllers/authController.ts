import { authService } from "../services/authService"
import type { Request, Response, NextFunction } from "express"
import { cookieOptions } from "../config/auth"


export const authController = {
    async register(req: Request, res: Response, next: NextFunction) {

        try {
            const { name, email, password } = req.body
            if (!name || !email || !password) {
                return res.status(400).json({ message: "All fields required" })
            }
            const result = await authService.register(name, email, password)

            res.cookie('refreshToken', result.refreshToken,cookieOptions)

            res.status(201).json({
                token: result.accessToken,
                user: result.user,
                message: "Created new account"
            })
        } catch (error) {
            next(error)
        }

    },


    async login(req: Request, res: Response, next: NextFunction) {
        try {

            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ message: "All fields required" })
            }

            const result = await authService.login(email, password)

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(200).json({
                token: result.accessToken,
                user: result.user,
                message: "Succesfully Logged In"
            })

        } catch (error) {
            next(error)
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {

        try {
            const token = req.cookies?.refreshToken

            if (!token) {
                return res.status(400).json({ message: "Token not found" })
            }

            await authService.logout(token)

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            })

            res.status(200).json({ message: 'Logged out successfully' })

        } catch (error) {
            next(error)
        }



    },

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.refreshToken
            if (!token) {
                return res.status(400).json({ message: "Token not found" })
            }

            const result = await authService.refresh(token)


            res.cookie('refreshToken', result.newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(200).json({
                token: result.newAccessToken,
                message: "New tokens created successfully"
            })
        } catch (error) {
            next(error)
        }
    }
}