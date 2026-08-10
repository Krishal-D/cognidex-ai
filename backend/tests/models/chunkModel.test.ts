import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/db', () => ({
    pool: { query: vi.fn() },
}))

import { pool } from '../../src/config/db'
import { chunkModel } from '../../src/models/chunkModel'

const mockQuery = pool.query as any

describe('chunkModel.getChunksByDocument', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the query by both document_id and owner_id, and applies a chunk cap', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await chunkModel.getChunksByDocument(42, 7)

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/c\.document_id\s*=\s*\$1/)
        expect(sql).toMatch(/d\.owner_id\s*=\s*\$2/)
        expect(params[0]).toBe(7)
        expect(params[1]).toBe(42)
        expect(typeof params[2]).toBe('number')
    })
})

describe('chunkModel.searchSimilarChunks', () => {
    beforeEach(() => mockQuery.mockReset())

    it('scopes the similarity search by owner_id and document id, with a distance cutoff', async () => {
        mockQuery.mockResolvedValue({ rows: [] })

        await chunkModel.searchSimilarChunks(42, 7, [0.1, 0.2, 0.3])

        const [sql, params] = mockQuery.mock.calls[0]
        expect(sql).toMatch(/d\.owner_id\s*=\s*\$1/)
        expect(sql).toMatch(/d\.id\s*=\s*\$2/)
        expect(sql).toMatch(/<=>\s*\$3::vector\)\s*<\s*\$4/)
        expect(params[0]).toBe(42)
        expect(params[1]).toBe(7)
    })
})
