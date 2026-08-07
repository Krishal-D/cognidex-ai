import { useState, useEffect, useCallback } from 'react'
import { chatAPI } from '../api/chat'
import type { Message } from '../types'

export const useMessages = (conversationId: number | null) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    const fetchMessages = useCallback(async (): Promise<Message[]> => {
        if (!conversationId) return []
        setLoading(true)
        try {
            const data = await chatAPI.getMessagesByConversation(conversationId)
            const fetched: Message[] = data.messages || []
            setMessages(fetched)
            return fetched
        } finally {
            setLoading(false)
        }
    }, [conversationId])

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
    }

    useEffect(() => {
        setMessages([])
        fetchMessages()
    }, [conversationId, fetchMessages])

    return { messages, loading, addMessage, refetch: fetchMessages }
}