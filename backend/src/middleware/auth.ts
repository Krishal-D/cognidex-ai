import type { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../config/auth"


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = req.headers.authorization
        const token = headers?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ message: "no token available" })
        }

        const payload = verifyAccessToken(token)

        if (!payload) {
            return res.status(401).json({ message: "authentication failed" })
        }

        req.user = payload
        next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error:", error });

    }
}