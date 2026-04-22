import type { Request, Response, NextFunction } from "express";
import { chatService } from "../services/chatService";


export const chatController = {
    async query(req: Request, res: Response, next: NextFunction) {

        try {
            const { question } = req.body
            const ownerId = req.user?.id

            if (!question || typeof question !== "string" || !question.trim()) {
                return res.status(400).json({ message: "Question is required" });
            }

            if (!ownerId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const answer = await chatService.queryDocument(question, ownerId)

            return res.status(200).json({ answer })


        } catch (error) {
            next(error)
        }

    }
}