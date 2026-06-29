export interface Document {
    id: number;
    owner_id: number;
    document_name: string;
    status: string;
    created_at: Date;
}

export interface DocumentWithUser {
    id: number
    document_name: string
    status: DocumentStatus
    owner_id: number
    user_name: string
    created_at: Date
}

export type DocumentStatus = "pending" | "indexed" | "processing" | "failed";

export interface IDocumentModel {
    uploadDocument(documentName: string, ownerId: number, status: DocumentStatus): Promise<Document | null>;
    findDocumentByUser(documentId: number): Promise<DocumentWithUser[]>;
    deleteDocument(documentId: number, ownerId: number): Promise<number | null>;
    updateDocumentName(documentId: number, ownerId: number, documentName: string): Promise<Document | null>;
    updateStatus(status: DocumentStatus, documentId: number): Promise<Document>
}

export type UploadResult = {
    document: {
        name: string | undefined;
        ownerId: number | undefined;
        status: string | undefined
    };
    pdfData: unknown;
    chunks: string[];
}

export interface Chunk {
    id: number;
    chunk_idx: number;
    content: string;
    document_id: number;
    created_at: Date;
}

export interface ChunkSearchResult {
    id: number;
    content: string;
    document_name: string;
    document_id: number;
    chunk_idx: number;
}
export interface IChunkModel {
    insertChunk(
        chunkIdx: number,
        content: string,
        embedding: number[],
        documentId: number
    ): Promise<Chunk>;

    getChunksByDocument(
        ownerId: number,
        documentId: number
    ): Promise<ChunkSearchResult[]>;

    searchSimilarChunks(
        ownerId: number,
        embedding: number[]
    ): Promise<ChunkSearchResult[]>;
}