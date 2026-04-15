export interface Document {
    id: number;
    owner_id: number;
    document_name: string;
    status: string;
    created_at: Date;
}

export interface DocumentWithUser {
    user_id: number;
    user_name: string;
    document_id: number;
    document_name: string;
    status: string;
    created_at: Date;
}

export type DocumentStatus = "pending" | "indexed" | "processed";

export interface IDocumentModel {
    uploadDocument(documentName: string, ownerId: number, status: DocumentStatus): Promise<Document | null>;
    findDocumentByUser(documentId: number): Promise<DocumentWithUser[]>;
    deleteDocument(documentId: number, ownerId: number): Promise<number | null>;
    updateStatus(status:DocumentStatus,documentId:number):Promise<Document>
}

export type UploadResult = {
    document: {
        name: string | undefined;
        ownerId: number | undefined;
        status: string | undefined
    };
    pdfData: any;
    chunks: string[];
}

export interface Chunk {
    id: number;
    chunk_idx: number;
    content: string;
    document_id: number;
    created_at: Date;
}

export interface IChunkModel {
    insertChunk(chunkIdx: number, content: string, documentId: number): Promise<Chunk>;
    getChunksByDocument(documentId: number): Promise<Chunk[]>;
}
