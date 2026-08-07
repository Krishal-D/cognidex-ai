import { useState, useEffect, useCallback } from 'react'
import { chatAPI } from '../api/chat'
import type { Conversation } from '../types'

export const useConversations = (documentId: number | null) => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(false)

    const fetchConversations = useCallback(async () => {
        if (!documentId) return
        setLoading(true)
        try {
            const data = await chatAPI.getConversationByDocument(documentId)
            setConversations(data.conversations || [])
        } finally {
            setLoading(false)
        }
    }, [documentId])

    const createConversation = async (name: string, docId: number) => {
        const data = await chatAPI.createConversation(name, docId)
        await fetchConversations()
        return data.conversation
    }

    useEffect(() => {
        setConversations([])
        fetchConversations()
    }, [documentId, fetchConversations])

    return { conversations, loading, createConversation }
}