import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/db', () => ({
    pool: { query: vi.fn() },
}))

import { pool } from '../../src/config/db'
import { chatModel } from '../../src/models/chatModel'

const mockQuery = pool.query as any

describe('chatModel.getConversationById', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the lookup by both owner_id and conversation id', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 5, owner_id: 42 }] })

        await chatModel.getConversationById(42, 5)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/owner_id\s*=\s*\$1/)
        expect(sql).toMatch(/id\s*=\s*\$2/)
        expect(params).toEqual([42, 5])
    })
})

describe('chatModel.getMessagesByConversation', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes messages to conversations owned by the requesting user', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await chatModel.getMessagesByConversation(42, 5)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/c\.owner_id\s*=\s*\$1/)
        expect(sql).toMatch(/m\.conversation_id\s*=\s*\$2/)
        expect(params).toEqual([42, 5])
    })
})

describe('chatModel.deleteConversation', () => {
    beforeEach(() => mockQuery.mockReset())

    it('runs a single scoped DELETE (regression test for the recursive-call bug)', async () => {
        mockQuery.mockResolvedValue({ rowCount: 1 })

        await chatModel.deleteConversation(5, 42)

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/DELETE FROM conversations/)
        expect(sql).toMatch(/id\s*=\s*\$1\s*AND\s*owner_id\s*=\s*\$2/)
        expect(params).toEqual([5, 42])
    })
})

describe('chatModel.getConversationsByUser / getConversationsByDocument', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the user\'s conversation list by owner_id', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await chatModel.getConversationsByUser(42)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/owner_id\s*=\s*\$1/)
        expect(params).toEqual([42])
    })

    it('scopes a document\'s conversation list by both owner_id and document_id', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await chatModel.getConversationsByDocument(42, 7)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/owner_id\s*=\s*\$1/)
        expect(sql).toMatch(/document_id\s*=\s*\$2/)
        expect(params).toEqual([42, 7])
    })
})
