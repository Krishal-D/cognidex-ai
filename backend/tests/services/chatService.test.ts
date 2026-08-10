import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/models/chatModel', () => ({
    chatModel: {
        getConversationById: vi.fn(),
        createMessage: vi.fn(),
        getMessagesByConversation: vi.fn(),
        deleteConversation: vi.fn(),
    },
}))

vi.mock('../../src/models/chunkModel', () => ({
    chunkModel: {
        getChunksByDocument: vi.fn(),
        searchSimilarChunks: vi.fn(),
    },
}))

vi.mock('../../src/utils/embedding', () => ({
    getEmbedding: vi.fn(),
}))

vi.mock('../../src/utils/generate', () => ({
    generateAnswer: vi.fn(),
}))

import { chatModel } from '../../src/models/chatModel'
import { chunkModel } from '../../src/models/chunkModel'
import { getEmbedding } from '../../src/utils/embedding'
import { generateAnswer } from '../../src/utils/generate'
import { chatService } from '../../src/services/chatService'

const mockedChatModel = chatModel as any
const mockedChunkModel = chunkModel as any
const mockedGetEmbedding = getEmbedding as any
const mockedGenerateAnswer = generateAnswer as any

const OWNER_ID = 42
const CONVERSATION_ID = 5
const DOCUMENT_ID = 7

const ownedConversation = {
    id: CONVERSATION_ID,
    owner_id: OWNER_ID,
    document_id: DOCUMENT_ID,
    conversation_name: 'Test conversation',
    created_at: new Date(),
}

describe('chatService.queryDocument', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockedChatModel.getMessagesByConversation.mockResolvedValue([])
    })

    it('rejects when there is no authenticated user', async () => {
        await expect(chatService.queryDocument('question', String(CONVERSATION_ID), undefined))
            .rejects.toMatchObject({ status: 401 })
    })

    it('rejects an empty question', async () => {
        await expect(chatService.queryDocument('   ', String(CONVERSATION_ID), OWNER_ID))
            .rejects.toMatchObject({ status: 400 })
    })

    it('rejects when the conversation does not belong to this user (or does not exist)', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(undefined)

        await expect(chatService.queryDocument('a question', String(CONVERSATION_ID), OWNER_ID))
            .rejects.toMatchObject({ status: 404 })

        expect(mockedChunkModel.searchSimilarChunks).not.toHaveBeenCalled()
        expect(mockedGetEmbedding).not.toHaveBeenCalled()
    })

    it('scopes similarity search to the conversation\'s own document and owner, never a client-supplied id', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)
        mockedGetEmbedding.mockResolvedValue([[0.1, 0.2, 0.3]])
        mockedChunkModel.searchSimilarChunks.mockResolvedValue([
            { id: 1, content: 'relevant text', document_id: DOCUMENT_ID, document_name: 'Doc', chunk_idx: 0 },
        ])
        mockedGenerateAnswer.mockResolvedValue('The answer.')

        await chatService.queryDocument('does the contract mention pricing details?', String(CONVERSATION_ID), OWNER_ID)

        expect(mockedChunkModel.searchSimilarChunks).toHaveBeenCalledWith(OWNER_ID, DOCUMENT_ID, [0.1, 0.2, 0.3])
    })

    it('uses the extraction path (all chunks) for summarize/list-style questions', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)
        mockedChunkModel.getChunksByDocument.mockResolvedValue([
            { id: 1, content: 'chunk one', document_id: DOCUMENT_ID, document_name: 'Doc', chunk_idx: 0 },
        ])
        mockedGenerateAnswer.mockResolvedValue('Summary.')

        await chatService.queryDocument('summarize this document', String(CONVERSATION_ID), OWNER_ID)

        expect(mockedChunkModel.getChunksByDocument).toHaveBeenCalledWith(OWNER_ID, DOCUMENT_ID)
        expect(mockedChunkModel.searchSimilarChunks).not.toHaveBeenCalled()
    })

    it('short-circuits casual messages without touching retrieval or the LLM', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)

        const result = await chatService.queryDocument('hi', String(CONVERSATION_ID), OWNER_ID)

        expect(result.sources).toEqual([])
        expect(mockedGetEmbedding).not.toHaveBeenCalled()
        expect(mockedGenerateAnswer).not.toHaveBeenCalled()
        expect(mockedChatModel.createMessage).toHaveBeenCalledWith(CONVERSATION_ID, 'user', 'hi')
        expect(mockedChatModel.createMessage).toHaveBeenCalledWith(CONVERSATION_ID, 'assistant', expect.any(String))
    })

    it('returns a "no relevant information" answer without calling the LLM when nothing is retrieved', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)
        mockedGetEmbedding.mockResolvedValue([[0.1, 0.2, 0.3]])
        mockedChunkModel.searchSimilarChunks.mockResolvedValue([])

        const result = await chatService.queryDocument('an unrelated question', String(CONVERSATION_ID), OWNER_ID)

        expect(result.answer).toMatch(/no relevant information/i)
        expect(result.sources).toEqual([])
        expect(mockedGenerateAnswer).not.toHaveBeenCalled()
    })

    it('passes prior conversation turns to generateAnswer as history', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)
        mockedChatModel.getMessagesByConversation.mockResolvedValue([
            { id: 1, message_content: 'earlier question', role: 'user', conversation_id: CONVERSATION_ID, created_at: new Date() },
            { id: 2, message_content: 'earlier answer', role: 'assistant', conversation_id: CONVERSATION_ID, created_at: new Date() },
        ])
        mockedGetEmbedding.mockResolvedValue([[0.1, 0.2, 0.3]])
        mockedChunkModel.searchSimilarChunks.mockResolvedValue([
            { id: 1, content: 'relevant text', document_id: DOCUMENT_ID, document_name: 'Doc', chunk_idx: 0 },
        ])
        mockedGenerateAnswer.mockResolvedValue('Follow-up answer.')

        await chatService.queryDocument('can you clarify the second point?', String(CONVERSATION_ID), OWNER_ID)

        const [, , history] = mockedGenerateAnswer.mock.calls[0]
        expect(history).toEqual([
            { role: 'user', content: 'earlier question' },
            { role: 'assistant', content: 'earlier answer' },
        ])
    })

    it('returns sources that match the chunks actually used for the answer', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)
        mockedGetEmbedding.mockResolvedValue([[0.1, 0.2, 0.3]])
        mockedChunkModel.searchSimilarChunks.mockResolvedValue([
            { id: 1, content: 'relevant text', document_id: DOCUMENT_ID, document_name: 'Doc', chunk_idx: 3 },
        ])
        mockedGenerateAnswer.mockResolvedValue('The answer.')

        const result = await chatService.queryDocument('a real question', String(CONVERSATION_ID), OWNER_ID)

        expect(result.sources).toEqual([{ document: 'Doc', documentId: DOCUMENT_ID, chunkIndex: 3 }])
    })
})

describe('chatService.deleteConversation', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects when there is no authenticated user', async () => {
        await expect(chatService.deleteConversation(0, CONVERSATION_ID)).rejects.toMatchObject({ status: 401 })
    })

    it('rejects deleting a conversation that does not belong to this user (or does not exist)', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(undefined)

        await expect(chatService.deleteConversation(OWNER_ID, CONVERSATION_ID)).rejects.toMatchObject({ status: 404 })
        expect(mockedChatModel.deleteConversation).not.toHaveBeenCalled()
    })

    it('deletes only after confirming ownership', async () => {
        mockedChatModel.getConversationById.mockResolvedValue(ownedConversation)

        await chatService.deleteConversation(OWNER_ID, CONVERSATION_ID)

        expect(mockedChatModel.getConversationById).toHaveBeenCalledWith(OWNER_ID, CONVERSATION_ID)
        expect(mockedChatModel.deleteConversation).toHaveBeenCalledWith(CONVERSATION_ID, OWNER_ID)
    })
})
