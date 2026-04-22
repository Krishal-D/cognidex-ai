import { getEmbedding } from "../utils/embedding";
import { chunkModel } from "../models/chunkModel";
import { generateAnswer } from "../utils/generate";

export const chatService = {
    async queryDocument(userQuery: string, ownerId: number) {

        if (!userQuery || !userQuery.trim()) {
            throw new Error("Query is empty");
        }

        const [queryEmbedding] = await getEmbedding([userQuery]);


        if (!queryEmbedding) {
            throw new Error("Failed to generate query embedding");
        }

        const chunks = await chunkModel.searchSimilarChunks(ownerId, queryEmbedding);

        if (!chunks.length) {
            return {
                answer: "No relevant information found in your documents.",
                sources: []
            }
        }

        const topChunks = chunks.slice(0, 5);

        const context = topChunks
            .map((c, i) =>
                `Chunk ${i + 1} (Document: ${c.document_name}):\n${c.content}`
            )
            .join('\n\n');

        const answer = await generateAnswer(context, userQuery);

        return {
            answer,
            sources: topChunks.map(c => ({
                document: c.document_name,
                documentId: c.document_id,
                chunkIndex: c.chunk_idx
            }))
        }
    }
}