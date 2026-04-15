import { documentModel } from "../models/documentModel";
import { chunkModel } from "../models/chunkModel";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse').default ?? require('pdf-parse');
import { UploadResult, DocumentStatus, DocumentWithUser } from "../types";
import { chunkText } from "../utils/chunk";
import { getEmbedding } from "../utils/embedding";


export const documentService = {

    async uploadDocument(documentName: string, ownerId: number, status: DocumentStatus = "pending", pdfBuffer: Buffer): Promise<UploadResult> {
        const document = await documentModel.uploadDocument(documentName, ownerId, status)

        if (!document?.id) {
            throw new Error("Document creation failed");
        }

        try {

            const pdfData = await pdfParse(pdfBuffer);
            const cleanedText = pdfData.text.replace(/\s+/g, " ").trim();

            await documentModel.updateStatus('processing', document.id)

            const chunks = chunkText(cleanedText, 500, 50)

            const embeddings = await getEmbedding(chunks)

            for (let i = 0; i < chunks.length; i++) {
                const content = chunks[i]
                const vector = embeddings[i]
                if (content && vector) await chunkModel.insertChunk(i, content, vector, document.id)
            }

            await documentModel.updateStatus('indexed', document.id)

            return ({
                document: {
                    name: document.document_name,
                    ownerId: document.owner_id,
                    status: 'indexed'
                },
                pdfData,
                chunks
            })
        } catch (error) {
            await documentModel.updateStatus('failed', document.id)
            throw error
        }
    },

    async findDocumentByUser(ownerId: number): Promise<{ document: DocumentWithUser[] }> {

        const document = await documentModel.findDocumentByUser(ownerId)
        return { document }
    },

    async deleteDocument(documentId: number, ownerId: number): Promise<void> {
        await documentModel.deleteDocument(documentId, ownerId)
    }

}