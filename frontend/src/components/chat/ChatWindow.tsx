import { useState, useRef, useEffect } from 'react'
import { useMessages } from '../../hooks/useMessages'
import { useChat } from '../../hooks/useChat'
import MessageBubble from './MessageBubble'
import { HiOutlinePaperAirplane, HiOutlinePaperClip } from 'react-icons/hi'
import { chatAPI } from '../../api/chat'
import { documentAPI } from '../../api/documents'

interface Props {
    conversationId: number
    documentId: number
}

const ChatWindow = ({ conversationId, documentId }: Props) => {
    const { messages, loading, refetch } = useMessages(conversationId)
    const { sendQuery, loading: querying } = useChat()
    const [input, setInput] = useState('')
    const [uploading, setUploading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [optimisticMessages, setOptimisticMessages] = useState<Array<{
        id: number
        role: 'user' | 'assistant'
        message_content: string
        conversation_id: number
    }>>([])



    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, querying])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }, [input])



    const handleSend = async () => {
        if (!input.trim() || querying) return
        const question = input.trim()
        setInput('')

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        setOptimisticMessages([{
            id: Date.now(),
            conversation_id: conversationId,
            role: 'user',
            message_content: question
        }])

        await sendQuery(conversationId, question)
        setOptimisticMessages([])
        await refetch()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('documentName', file.name)
            await documentAPI.uploadDocument(formData)
            await chatAPI.createMessage(
                conversationId,
                'assistant',
                `Document "${file.name}" uploaded and indexing. Ask questions once it shows as indexed.`
            )
            await refetch()
        } catch {
            await chatAPI.createMessage(
                conversationId,
                'assistant',
                'Failed to upload document. Please try again.'
            )
            await refetch()
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#F8F7F4]">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading && (
                    <p className="text-sm text-[#8A8680] text-center">
                        Loading messages...
                    </p>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-[#8A8680]">
                            Ask a question about your document
                        </p>
                    </div>
                )}

                {[...messages, ...optimisticMessages].map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {querying && (
                    <div className="flex gap-3">
                        <div className="bg-white border border-[#E5E2DC] rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-[#8A8680] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-[#8A8680] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-[#8A8680] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Auto scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#E5E2DC]">
                <div className="flex gap-2 items-end bg-white border border-[#E5E2DC] rounded-2xl p-3">

                    {/* File upload */}
                    <label className={`flex-shrink-0 p-1 cursor-pointer text-[#8A8680] hover:text-[#16A34A] transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <HiOutlinePaperClip className="w-5 h-5" />
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your document..."
                        rows={1}
                        style={{ height: 'auto' }}
                        className="flex-1 resize-none bg-transparent text-sm text-[#1A1A1A] placeholder-[#8A8680] outline-none leading-tight max-h-40 overflow-y-auto"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || querying}
                        className="flex-shrink-0 w-8 h-8 bg-[#16A34A] rounded-xl flex items-center justify-center transition-all hover:bg-[#15803D] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <HiOutlinePaperAirplane className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="text-xs text-[#8A8680] mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}

export default ChatWindow