import { documentModel } from "../models/documentModel";
import { chunkModel } from "../models/chunkModel";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse').default ?? require('pdf-parse');
import { UploadResult, DocumentStatus, DocumentWithUser } from "../types";
import { chunkText } from "../utils/chunk";


export const documentService = {

    async uploadDocument(documentName: string, ownerId: number, status: DocumentStatus = "pending", pdfBuffer: Buffer): Promise<UploadResult> {
        const document = await documentModel.uploadDocument(documentName, ownerId, status)

        const pdfData = await pdfParse(pdfBuffer);
        const cleanedText = pdfData.text.replace(/\s+/g, " ").trim();

        const chunks = chunkText(cleanedText, 500, 50)

        if (document?.id) {
            for (let i = 0; i < chunks.length; i++) {
                const content = chunks[i]
                if (content) await chunkModel.insertChunk(i, content, document.id)
            }
        }


        return ({
            document: {
                name: document?.document_name,
                ownerId: document?.owner_id,
                status: document?.status
            },
            pdfData,
            chunks
        })
    },

    async findDocumentByUser(ownerId: number): Promise<{ document: DocumentWithUser[] }> {

        const document = await documentModel.findDocumentByUser(ownerId)
        return { document }
    },

    async deleteDocument(documentId: number, ownerId: number): Promise<void> {
        await documentModel.deleteDocument(documentId, ownerId)
    }

}