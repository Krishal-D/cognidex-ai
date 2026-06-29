import { getEmbedding } from "../utils/embedding";
import { chunkModel } from "../models/chunkModel";
import { generateAnswer } from "../utils/generate";
import { chatModel } from "../models/chatModel";
import { getCasualReply } from "../utils/casualReplies";
import { authError, notFoundError, validationError } from '../utils/errors'
import { Conversation, Message, MessageWithConversation, MessageRole, QueryResult } from "../types";

const VALID_ROLES: MessageRole[] = ["user", "assistant"];


export const chatService = {
    async queryDocument(userQuery: unknown, conversationId: unknown, ownerId: number | undefined): Promise<QueryResult> {
        if (!ownerId) throw authError();

        if (!userQuery || typeof userQuery !== "string" || !userQuery.trim()) {
            throw validationError("Question is required");
        }

        const parsedConversationId = Number(conversationId);
        if (!conversationId || isNaN(parsedConversationId)) {
            throw validationError("Valid conversation ID is required");
        }

        const conversation = await chatModel.getConversationById(ownerId, parsedConversationId);
        if (!conversation) throw notFoundError("Conversation not found");

        const documentId = conversation.document_id


        const casualReply = getCasualReply(userQuery);

        if (casualReply) {
            await chatModel.createMessage(parsedConversationId, "user", userQuery.trim());
            await chatModel.createMessage(parsedConversationId, "assistant", casualReply);

            return {
                answer: casualReply,
                sources: [],
            };
        }

        const wantsExtraction =
            /list|extract|show|display|questions|review questions|summary|summarize|table|all/i
                .test(userQuery.toLowerCase());

        let chunks;

        if (wantsExtraction) {

            chunks = await chunkModel.getChunksByDocument(
                ownerId,
                documentId
            );

        } else {

            const [queryEmbedding] = await getEmbedding([userQuery]);

            if (!queryEmbedding) {
                throw new Error("Failed to generate query embedding");
            }

            chunks = await chunkModel.searchSimilarChunks(
                ownerId,
                queryEmbedding
            );

        }

        await chatModel.createMessage(parsedConversationId, "user", userQuery.trim());

        if (!chunks.length) {
            const noInfoAnswer = "No relevant information found in your documents.";
            await chatModel.createMessage(parsedConversationId, "assistant", noInfoAnswer);
            return { answer: noInfoAnswer, sources: [] };
        }


        const context = chunks
            .map((c) => `Document: ${c.document_name}\n${c.content}`)
            .join("\n\n");

        const answer = await generateAnswer(context, userQuery);

        await chatModel.createMessage(parsedConversationId, "assistant", answer);

        return {
            answer,
            sources: chunks.map(c => ({
                document: c.document_name,
                documentId: c.document_id,
                chunkIndex: c.chunk_idx
            }))
        };
    },

    async createConversation(conversationName: unknown, documentId: unknown, ownerId: number | undefined): Promise<{ conversation: Conversation }> {
        if (!ownerId) throw authError();

        if (!conversationName || typeof conversationName !== "string" || !conversationName.trim()) {
            throw validationError("Conversation name is required");
        }

        const parsedDocumentId = Number(documentId);
        if (!documentId || isNaN(parsedDocumentId)) {
            throw validationError("Valid document ID is required");
        }

        const conversation = await chatModel.createConversation(conversationName.trim(), parsedDocumentId, ownerId);
        return { conversation };
    },

    async updateConversationName(conversationId: string | undefined, ownerId: number | undefined, newName: unknown): Promise<{ conversation: Conversation }> {
        if (!ownerId) throw authError();

        const parsedId = Number(conversationId);
        if (!conversationId || isNaN(parsedId)) throw validationError("Valid conversation ID is required");

        if (!newName || typeof newName !== "string" || !newName.trim()) {
            throw validationError("New name is required");
        }

        const conversation = await chatModel.updateConversationName(parsedId, ownerId, newName.trim());
        if (!conversation) throw notFoundError("Conversation not found");
        return { conversation };
    },

    async getConversationsByUser(ownerId: number | undefined): Promise<{ conversation: Conversation[] }> {
        if (!ownerId) throw authError();

        const conversation = await chatModel.getConversationsByUser(ownerId);
        return { conversation };
    },

    async getConversationsByDocument(ownerId: number | undefined, documentId: string | undefined): Promise<{ conversation: Conversation[] }> {
        if (!ownerId) throw authError();

        const parsedId = Number(documentId);
        if (!documentId || isNaN(parsedId)) throw validationError("Valid document ID is required");

        const conversation = await chatModel.getConversationsByDocument(ownerId, parsedId);
        return { conversation };
    },

    async getConversationById(ownerId: number | undefined, conversationId: string | undefined): Promise<{ conversation: Conversation }> {
        if (!ownerId) throw authError();

        const parsedId = Number(conversationId);
        if (!conversationId || isNaN(parsedId)) throw validationError("Valid conversation ID is required");

        const conversation = await chatModel.getConversationById(ownerId, parsedId);
        if (!conversation) throw notFoundError("Conversation not found");
        return { conversation };
    },

    async createMessage(conversationId: unknown, role: unknown, messageContent: unknown, ownerId: number | undefined): Promise<Message> {
        if (!ownerId) throw authError();

        const parsedConversationId = Number(conversationId);
        if (!conversationId || isNaN(parsedConversationId)) {
            throw validationError("Valid conversation ID is required");
        }

        if (!role || !VALID_ROLES.includes(role as MessageRole)) {
            throw validationError(`Role must be one of: ${VALID_ROLES.join(", ")}`);
        }

        if (!messageContent || typeof messageContent !== "string" || !messageContent.trim()) {
            throw validationError("Message content is required");
        }

        const conversation = await chatModel.getConversationById(ownerId, parsedConversationId);
        if (!conversation) throw notFoundError("Conversation not found");

        return chatModel.createMessage(parsedConversationId, role as MessageRole, messageContent.trim());
    },

    async getMessagesByConversation(ownerId: number | undefined, conversationId: string | undefined): Promise<MessageWithConversation[]> {
        if (!ownerId) throw authError();

        const parsedId = Number(conversationId);
        if (!conversationId || isNaN(parsedId)) throw validationError("Valid conversation ID is required");

        return chatModel.getMessagesByConversation(ownerId, parsedId);
    },
    async deleteConversation(ownerId: number, conversationId: number): Promise<void> {
        if (!ownerId) throw authError()
        const conversation = await chatModel.getConversationById(ownerId, conversationId)
        if (!conversation) throw notFoundError('Conversation not found')
        await chatModel.deleteConversation(conversationId, ownerId)
    },
}