import { describe, it, expect } from 'vitest'
import { getCasualReply } from '../../src/utils/casualReplies'

describe('getCasualReply', () => {
    it('matches an exact greeting', () => {
        expect(getCasualReply('hi')).toMatch(/hi/i)
    })

    it('normalizes case, punctuation, and whitespace before an exact match', () => {
        expect(getCasualReply('  HELLO!!  ')).toMatch(/hi/i)
    })

    it('matches a "contains" keyword inside a longer sentence', () => {
        expect(getCasualReply('thanks so much for the help')).toMatch(/welcome/i)
    })

    it('does not treat an exact-match keyword as a substring match', () => {
        expect(getCasualReply('hiking is fun')).toBeNull()
    })

    it('returns null for a real document question', () => {
        expect(getCasualReply('what is the termination clause in section 4?')).toBeNull()
    })

    it('returns null for an empty message', () => {
        expect(getCasualReply('')).toBeNull()
    })
})
