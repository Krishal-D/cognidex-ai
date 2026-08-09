import { documentModel } from "../models/documentModel";
import { chunkModel } from "../models/chunkModel";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse').default ?? require('pdf-parse');
import { UploadResult, DocumentStatus, DocumentWithUser } from "../types";
import { chunkText } from "../utils/chunk";
import { getEmbedding } from "../utils/embedding";
import { authError, validationError } from "../utils/errors";
import { isLikelyPdf } from "../utils/fileValidation";

const VALID_STATUSES: DocumentStatus[] = ["pending", "indexed", "processing", "failed"];

export const documentService = {

    async uploadDocument(documentName: unknown, ownerId: number | undefined, status: unknown = "pending", pdfBuffer: Buffer | undefined): Promise<UploadResult> {
        if (!ownerId) throw authError();

        if (!documentName || typeof documentName !== "string" || !documentName.trim()) {
            throw validationError("Document name is required");
        }

        if (!pdfBuffer) throw validationError("PDF file is required");

        if (!isLikelyPdf(pdfBuffer)) {
            throw validationError("File does not appear to be a valid PDF");
        }

        const resolvedStatus: DocumentStatus = VALID_STATUSES.includes(status as DocumentStatus)
            ? (status as DocumentStatus)
            : "pending";

        const document = await documentModel.uploadDocument(documentName.trim(), ownerId, resolvedStatus);

        if (!document?.id) throw new Error("Document creation failed");

        try {
            const pdfData = await pdfParse(pdfBuffer);
            const cleanedText = pdfData.text
                // eslint-disable-next-line no-control-regex -- intentionally stripping raw control bytes left by PDF text extraction
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
                .replace(/\s+/g, " ")
                .trim();
            await documentModel.updateStatus('processing', document.id);

            const chunks = chunkText(cleanedText, 500, 50);
            const embeddings = await getEmbedding(chunks);

            for (let i = 0; i < chunks.length; i++) {
                const content = chunks[i];
                const vector = embeddings[i];
                if (content && vector) await chunkModel.insertChunk(i, content, vector, document.id);
            }

            await documentModel.updateStatus('indexed', document.id);

            return {
                document: { name: document.document_name, ownerId: document.owner_id, status: 'indexed' },
                pdfData,
                chunks
            };
        } catch (error) {
            await documentModel.updateStatus('failed', document.id);
            throw error;
        }
    },

    async findDocumentByUser(ownerId: number | undefined): Promise<{ document: DocumentWithUser[] }> {
        if (!ownerId) throw authError();

        const document = await documentModel.findDocumentByUser(ownerId);
        return { document };
    },

    async deleteDocument(documentId: string | undefined, ownerId: number | undefined): Promise<void> {
        if (!ownerId) throw authError();

        const parsedId = Number(documentId);
        if (!documentId || !Number.isInteger(parsedId) || parsedId <= 0) {
            throw validationError("Valid document ID is required");
        }

        await documentModel.deleteDocument(parsedId, ownerId);
    }
}