export interface Conversation {
    id: number;
    conversation_name: string;
    document_id: number;
    owner_id: number;
    created_at: Date;
}

export interface Message {
    id: number;
    conversation_id: number;
    message_content: string;
    role: string;
    created_at: Date;
}

export interface MessageWithConversation {
    id: number;
    message_content: string;
    role: string;
    conversation_id: number;
    created_at: Date;
}

export type MessageRole = "user" | "assistant";

export interface QuerySource {
    document: string;
    documentId: number;
    chunkIndex: number;
}

export interface QueryResult {
    answer: string;
    sources: QuerySource[];
}

export interface IChatModel {
    createConversation(conversationName: string, documentId: number, ownerId: number): Promise<Conversation>;
    updateConversationName(conversationId: number, ownerId: number, conversationName: string): Promise<Conversation | null>;
    getConversationsByUser(ownerId: number): Promise<Conversation[]>;
    getConversationsByDocument(ownerId: number, documentId: number): Promise<Conversation[]>;
    getConversationById(ownerId: number, conversationId: number): Promise<Conversation | null>;
    createMessage(conversationId: number, role: MessageRole, messageContent: string): Promise<Message>;
    getMessagesByConversation(ownerId: number, conversationId: number): Promise<MessageWithConversation[]>;
    deleteConversation(conversationId: number, ownerId: number): Promise<void>;  // ← add this
}