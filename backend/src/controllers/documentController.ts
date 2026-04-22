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
    },

    async findDocumentByUser(req: Request, res: Response, next: NextFunction) {
        try {

            const ownerId = req.user?.id

            if (!ownerId) {
                return res.status(401).json({ message: "Unauthorized" });
            }


            const document = await documentService.findDocumentByUser(ownerId)

            return res.status(200).json({ document })

        } catch (error) {
            next(error)
        }
    },


    async deleteDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const documentIdParam = req.params?.id
            const ownerId = req.user?.id

            if (!documentIdParam) {
                return res.status(400).json({ message: "Document id is required" });

            }

            if (!ownerId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const documentId = Number(documentIdParam)
            if (!Number.isInteger(documentId) || documentId <= 0) {
                return res.status(400).json({ message: "Invalid document id" });
            }

            await documentService.deleteDocument(documentId, ownerId)

            return res.status(200).json({ message: "Document deleted successfully" })
        } catch (error) {
            next(error)
        }
    },


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

            const answer = await documentService.queryDocument(question, ownerId)

            return res.status(200).json({ answer })


        } catch (error) {
            next(error)
        }

    }
};