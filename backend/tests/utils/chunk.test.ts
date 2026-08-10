import { describe, it, expect } from 'vitest'
import { chunkText } from '../../src/utils/chunk'

describe('chunkText', () => {
    it('returns an empty array for empty text', () => {
        expect(chunkText('', 4, 1)).toEqual([])
    })

    it('returns a single chunk when text is shorter than chunkSize', () => {
        expect(chunkText('abc', 10, 2)).toEqual(['abc'])
    })

    it('splits with the configured size and overlap', () => {
        expect(chunkText('abcdefghij', 4, 1)).toEqual(['abcd', 'defg', 'ghij', 'j'])
    })

    it('splits with no overlap when overlap is 0', () => {
        expect(chunkText('abcdefgh', 4, 0)).toEqual(['abcd', 'efgh'])
    })

    it('never produces a chunk longer than chunkSize', () => {
        const chunks = chunkText('a'.repeat(537), 500, 50)
        for (const chunk of chunks) {
            expect(chunk.length).toBeLessThanOrEqual(500)
        }
    })

    it('covers the entire input when overlapping chunks are stitched back together', () => {
        const text = 'The quick brown fox jumps over the lazy dog.'
        const chunkSize = 10
        const overlap = 3
        const chunks = chunkText(text, chunkSize, overlap)

        let reconstructed = chunks[0] ?? ''
        for (let i = 1; i < chunks.length; i++) {
            reconstructed += chunks[i]?.slice(overlap)
        }
        expect(reconstructed).toBe(text)
    })
})
