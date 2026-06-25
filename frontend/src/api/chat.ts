import client from "./client";

export const chatAPI = {
    async query(conversationId: number, question: string) {
        const res = await client.post(`/chat/conversations/${conversationId}/query`, { question })
        return res.data

    },

    async createConversation(conversationName: string, documentId: number) {
        const res = await client.post('/chat/conversations', { conversationName, documentId })
        return res.data
    },

    async getConversationByUser() {
        const res = await client.get('/chat/conversations')
        return res.data
    },

    async updateConversationName(conversationId: number, newName: string) {
        const res = await client.put(`/chat/conversations/${conversationId}`, { newName })
        return res.data
    },

    async getConversationById(conversationId: number) {
        const res = await client.get(`/chat/conversations/${conversationId}`)
        return res.data
    },

    async getConversationByDocument(documentId: number) {
        const res = await client.get(`/chat/documents/${documentId}/conversations/`)
        return res.data
    },

    async createMessage(conversationId: number, role: string, messageContent: string) {
        const res = await client.post(`/chat/conversations/${conversationId}/messages`, { role, messageContent })
        return res.data
    },
    async getMessagesByConversation(conversationId: number) {
        const res = await client.get(`/chat/conversations/${conversationId}/messages`)
        return res.data
    },
    async deleteConversation(conversationId: number) {
        const res = await client.delete(`/chat/conversations/${conversationId}`)
        return res.data
    },

}