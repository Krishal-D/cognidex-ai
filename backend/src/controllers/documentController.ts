import { documentService } from "../services/documentService";
import type { Request, Response, NextFunction } from "express";

export const documentController = {

    async uploadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const { documentName, status } = req.body;
            const ownerId = req.user?.id;
            const pdfBuffer = req.file?.buffer;

            if (!ownerId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            if (!documentName || !status || !pdfBuffer) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const document = await documentService.uploadDocument(
                documentName,
                ownerId,
                status,
                pdfBuffer
            );

            return res.status(201).json({
                document: document.document,
                message: "File uploaded successfully"
            });

        } catch (error) {
            next(error);
        }
    }
};