import { pool } from "../config/db";
import { Document, DocumentWithUser, DocumentStatus, IDocumentModel } from "../types";

export const documentModel: IDocumentModel = {

    async uploadDocument(documentName: string, ownerId: number, status: DocumentStatus = "pending"): Promise<Document | null> {
        const result = await pool.query(`
            INSERT INTO documents (document_name,owner_id,status)
            VALUES($1,$2,$3)
            RETURNING *
            `, [documentName, ownerId, status])

        return result.rows[0] || null
    },

    async findDocumentByUser(ownerId: number): Promise<DocumentWithUser[]> {
        const result = await pool.query(`
            SELECT 
            u.name as user_name,
            u.id as owner_id,
            d.id as document_id,
            d.document_name as document_name,
            d.status as document_status,
            d.created_at
            FROM users u
            INNER JOIN documents d on u.id=d.owner_id
            WHERE u.id=$1
            ORDER BY d.created_at DESC
            `, [ownerId])

        return result.rows

    },

    async deleteDocument(documentId: number, ownerId: number): Promise<number | null> {
        const result = await pool.query(`
        DELETE FROM documents 
        WHERE id = $1 AND owner_id = $2
        RETURNING id
        `, [documentId, ownerId]);

        return result.rowCount;
    }

}