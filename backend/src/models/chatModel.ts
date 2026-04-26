import { pool } from "../config/db"
import { IChatModel, MessageRole } from "../types"

export const chatModel: IChatModel = {

    async createConversation(conversationName: string, documentId: number, ownerId: number) {
        const result = await pool.query(`
            INSERT INTO conversations(conversation_name,document_id,owner_id)
            VALUES($1,$2,$3)
            RETURNING *
            `, [conversationName, documentId, ownerId])
        return result.rows[0]
    },

    async updateConversationName(conversationId: number, ownerId: number, conversationName: string) {
        const result = await pool.query(`
            UPDATE conversations
            SET conversation_name = $1
            WHERE id = $2 AND owner_id = $3
            RETURNING *
            `, [conversationName, conversationId, ownerId])
        return result.rows[0] || null
    },

    async getConversationsByUser(ownerId: number) {
        const result = await pool.query(`
            SELECT * FROM conversations
            WHERE owner_id=$1
            ORDER BY created_at DESC
            `, [ownerId])
        return result.rows
    },

    async getConversationsByDocument(ownerId: number, documentId: number) {
        const result = await pool.query(`
            SELECT * FROM conversations
            WHERE owner_id=$1 AND document_id=$2
            ORDER BY created_at DESC
            `, [ownerId, documentId])
        return result.rows
    },

    async getConversationById(ownerId: number, conversationId: number) {
        const result = await pool.query(`
            SELECT * FROM conversations
            WHERE owner_id=$1 AND id=$2
            ORDER BY created_at DESC
            `, [ownerId, conversationId])
        return result.rows[0]
    },

    async createMessage(conversationId: number, role: MessageRole, messageContent: string) {
        const result = await pool.query(`
            INSERT INTO messages(conversation_id,role,message_content)
            VALUES($1,$2,$3)
            RETURNING *
            `, [conversationId, role, messageContent])
        return result.rows[0]
    },

    async getMessagesByConversation(ownerId: number, conversationId: number) {
        const result = await pool.query(`
            SELECT 
            m.id as messageId,
            m.message_content as messageContent,
            m.role,
            c.id as conversationId
            FROM messages m
            INNER JOIN conversations c ON c.id = m.conversation_id
            WHERE c.owner_id=$1 AND m.conversation_id=$2
            ORDER BY m.created_at ASC

            `, [ownerId, conversationId])
        return result.rows

    }


}