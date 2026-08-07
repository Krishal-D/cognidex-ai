import { useState, useEffect, useCallback } from 'react'
import { chatAPI } from '../api/chat'
import type { Message } from '../types'

export const useMessages = (conversationId: number | null) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return
        setLoading(true)
        try {
            const data = await chatAPI.getMessagesByConversation(conversationId)
            setMessages(data.messages || [])
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