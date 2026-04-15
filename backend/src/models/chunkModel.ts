import { pool } from "../config/db";
import { Chunk, IChunkModel } from "../types";

export const chunkModel: IChunkModel = {

    async insertChunk(chunkIdx: number, content: string, embedding: number[], documentId: number): Promise<Chunk> {
        const result = await pool.query(
            `INSERT INTO chunks(chunk_idx, content,embedding, document_id)
             VALUES($1, $2, $3,$4)
             RETURNING *`,
            [chunkIdx, content,embedding, documentId]
        );
        return result.rows[0];
    },

    async getChunksByDocument(documentId: number): Promise<Chunk[]> {
        const result = await pool.query(
            `SELECT * FROM chunks WHERE document_id = $1 ORDER BY chunk_idx`,
            [documentId]
        );
        return result.rows;
    }
}