import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

vi.mock('../../src/models/userModel', () => ({
    userModel: {
        verifyRefreshToken: vi.fn(),
    },
}))

import { userModel } from '../../src/models/userModel'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashPassword,
} from '../../src/config/auth'

const testUser = { id: 1, email: 'test@example.com' }

describe('generateAccessToken / verifyAccessToken', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    it('round-trips a valid token', () => {
        const token = generateAccessToken(testUser)
        const payload = verifyAccessToken(token)
        expect(payload?.id).toBe(testUser.id)
        expect(payload?.email).toBe(testUser.email)
    })

    it('returns null for a garbage token', () => {
        expect(verifyAccessToken('not-a-real-token')).toBeNull()
    })

    it('returns null for a token signed with a different secret', () => {
        const foreignToken = jwt.sign(testUser, 'some-other-secret', { expiresIn: '15m' })
        expect(verifyAccessToken(foreignToken)).toBeNull()
    })
})

describe('generateRefreshToken', () => {
    it('produces a token verifiable with the refresh secret', () => {
        const token = generateRefreshToken(testUser)
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: number; email: string }
        expect(payload.id).toBe(testUser.id)
        expect(payload.email).toBe(testUser.email)
    })
})

describe('verifyRefreshToken', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined)
        vi.mocked(userModel.verifyRefreshToken).mockReset()
    })

    it('returns the user when the token is valid and the DB still recognizes it', async () => {
        const token = generateRefreshToken(testUser)
        vi.mocked(userModel.verifyRefreshToken).mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        })

        const result = await verifyRefreshToken(token)

        expect(result?.id).toBe(1)
        expect(userModel.verifyRefreshToken).toHaveBeenCalledWith(1, token)
    })

    it('returns null when the DB no longer recognizes the token (e.g. after logout)', async () => {
        const token = generateRefreshToken(testUser)
        vi.mocked(userModel.verifyRefreshToken).mockResolvedValue(null)

        expect(await verifyRefreshToken(token)).toBeNull()
    })

    it('returns null for a bad signature without ever querying the database', async () => {
        const badToken = jwt.sign(testUser, 'wrong-secret', { expiresIn: '7d' })

        expect(await verifyRefreshToken(badToken)).toBeNull()
        expect(userModel.verifyRefreshToken).not.toHaveBeenCalled()
    })
})

describe('hashPassword', () => {
    it('produces a hash different from the plaintext password', async () => {
        const hash = await hashPassword('correct horse battery staple')
        expect(hash).not.toBe('correct horse battery staple')
    })

    it('produces a hash that bcrypt.compare validates only against the original password', async () => {
        const bcrypt = (await import('bcrypt')).default
        const hash = await hashPassword('correct horse battery staple')

        expect(await bcrypt.compare('correct horse battery staple', hash)).toBe(true)
        expect(await bcrypt.compare('wrong password', hash)).toBe(false)
    })
})
