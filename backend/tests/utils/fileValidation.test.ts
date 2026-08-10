import { describe, it, expect } from 'vitest'
import { isLikelyPdf } from '../../src/utils/fileValidation'

describe('isLikelyPdf', () => {
    it('accepts a buffer starting with the PDF header', () => {
        expect(isLikelyPdf(Buffer.from('%PDF-1.7\n...rest of file...'))).toBe(true)
    })

    it('accepts the header when preceded by a small amount of leading data', () => {
        const buffer = Buffer.concat([Buffer.from([0x00, 0x00, 0x00]), Buffer.from('%PDF-1.4')])
        expect(isLikelyPdf(buffer)).toBe(true)
    })

    it('rejects the header when it appears past the search window', () => {
        const buffer = Buffer.concat([Buffer.alloc(2000, 0x20), Buffer.from('%PDF-1.4')])
        expect(isLikelyPdf(buffer)).toBe(false)
    })

    it('rejects a file with an unrelated magic byte header (e.g. a JPEG)', () => {
        expect(isLikelyPdf(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(false)
    })

    it('rejects a renamed text file with no PDF header', () => {
        expect(isLikelyPdf(Buffer.from('just some plain text content'))).toBe(false)
    })

    it('rejects an empty buffer', () => {
        expect(isLikelyPdf(Buffer.alloc(0))).toBe(false)
    })
})
