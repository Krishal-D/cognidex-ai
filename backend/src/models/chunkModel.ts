import { pool } from "../config/db";
import { Chunk, IChunkModel, ChunkSearchResult } from "../types";

export const chunkModel: IChunkModel = {

    async insertChunk(chunkIdx: number, content: string, embedding: number[], documentId: number): Promise<Chunk> {
        const embeddingVector = `[${embedding.join(",")}]`;
        const result = await pool.query(
            `INSERT INTO chunks(chunk_idx, content,embedding, document_id)
             VALUES($1, $2, $3::vector, $4)
             RETURNING *`,
            [chunkIdx, content, embeddingVector, documentId]
        );
        return result.rows[0];
    },

    async getChunksByDocument(
        ownerId: number,
        documentId: number
    ): Promise<ChunkSearchResult[]> {

        const result = await pool.query(
            `
        SELECT
            c.id,
            c.chunk_idx,
            c.content,
            c.document_id,
            d.document_name
        FROM chunks c
        JOIN documents d
            ON d.id = c.document_id
        WHERE
            c.document_id = $1
            AND d.owner_id = $2
        ORDER BY c.chunk_idx ASC
        `,
            [documentId, ownerId]
        );

        return result.rows;
    },

    async searchSimilarChunks(ownerId: number, documentId: number, embedding: number[]): Promise<ChunkSearchResult[]> {
        const embeddingVector = `[${embedding.join(",")}]`;

        const result = await pool.query(`
        SELECT c.content, c.id, c.document_id, c.chunk_idx, d.document_name
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.owner_id = $1 AND d.id = $2
        ORDER BY c.embedding <=> $3::vector
        LIMIT 5
        `, [ownerId, documentId, embeddingVector])

        return result.rows
    }
}