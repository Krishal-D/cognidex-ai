import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/db', () => ({
    pool: { query: vi.fn() },
}))

import { pool } from '../../src/config/db'
import { documentModel } from '../../src/models/documentModel'

const mockQuery = pool.query as any

describe('documentModel.findDocumentByUser', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the query to the requesting owner', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await documentModel.findDocumentByUser(42)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/u\.id\s*=\s*\$1/)
        expect(params).toEqual([42])
    })
})

describe('documentModel.deleteDocument', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the delete by both document id and owner_id', async () => {
        mockQuery.mockResolvedValue({ rowCount: 1 })

        await documentModel.deleteDocument(7, 42)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/DELETE FROM documents/)
        expect(sql).toMatch(/id\s*=\s*\$1\s*AND\s*owner_id\s*=\s*\$2/)
        expect(params).toEqual([7, 42])
    })

    it('does not delete another user\'s document, even if the document id is guessed correctly', async () => {
        mockQuery.mockResolvedValue({ rowCount: 0 })

        const result = await documentModel.deleteDocument(7, 999)

        expect(result).toBe(0)
        const [, params] = mockQuery.mock.calls[0]
        expect(params).toEqual([7, 999])
    })
})

describe('documentModel.updateDocumentName', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the update by both document id and owner_id', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 7, document_name: 'Renamed' }] })

        await documentModel.updateDocumentName(7, 42, 'Renamed')

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/id\s*=\s*\$2\s*AND\s*owner_id\s*=\s*\$3/)
        expect(params).toEqual(['Renamed', 7, 42])
    })
})
