import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/models/userModel', () => ({
    userModel: {
        findUserByEmail: vi.fn(),
        createUser: vi.fn(),
        updateRefreshToken: vi.fn(),
        removeRefreshToken: vi.fn(),
        updateName: vi.fn(),
    },
}))

vi.mock('../../src/config/auth', () => ({
    generateAccessToken: vi.fn(() => 'access-token'),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
    hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
    verifyRefreshToken: vi.fn(),
}))

vi.mock('bcrypt', () => ({
    default: { compare: vi.fn() },
}))

import bcrypt from 'bcrypt'
import { userModel } from '../../src/models/userModel'
import { verifyRefreshToken } from '../../src/config/auth'
import { authService } from '../../src/services/authService'

const mockedUserModel = userModel as any
const mockedBcryptCompare = bcrypt.compare as any
const mockedVerifyRefreshToken = verifyRefreshToken as any

describe('authService.register', () => {
    beforeEach(() => vi.clearAllMocks())

    it.each([
        ['', 'a@b.com', 'password123', 'Name is required'],
        ['Name', '', 'password123', 'Email is required'],
        ['Name', 'a@b.com', '', 'Password is required'],
    ])('rejects register(%s, %s, %s) with "%s"', async (name, email, password, expectedMessage) => {
        await expect(authService.register(name, email, password)).rejects.toThrow(expectedMessage)
    })

    it('rejects registration when the email is already in use', async () => {
        mockedUserModel.findUserByEmail.mockResolvedValue({ id: 1, email: 'a@b.com' })

        await expect(authService.register('Name', 'a@b.com', 'password123')).rejects.toThrow('Email already in use')
    })

    it('stores the hashed password, never the plaintext', async () => {
        mockedUserModel.findUserByEmail.mockResolvedValue(null)
        mockedUserModel.createUser.mockResolvedValue({ id: 1, name: 'Name', email: 'a@b.com' })

        await authService.register('Name', 'a@b.com', 'super-secret-password')

        const [, , storedPassword] = mockedUserModel.createUser.mock.calls[0]
        expect(storedPassword).toBe('hashed:super-secret-password')
        expect(storedPassword).not.toBe('super-secret-password')
    })
})

describe('authService.login', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects with 401 when no user has that email', async () => {
        mockedUserModel.findUserByEmail.mockResolvedValue(null)

        await expect(authService.login('a@b.com', 'password123')).rejects.toMatchObject({
            message: 'Invalid credentials',
            status: 401,
        })
    })

    it('rejects with 401 when the password does not match', async () => {
        mockedUserModel.findUserByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed' })
        mockedBcryptCompare.mockResolvedValue(false)

        await expect(authService.login('a@b.com', 'wrong-password')).rejects.toMatchObject({ status: 401 })
    })

    it('returns tokens when credentials are correct', async () => {
        mockedUserModel.findUserByEmail.mockResolvedValue({ id: 1, name: 'Name', email: 'a@b.com', password: 'hashed' })
        mockedBcryptCompare.mockResolvedValue(true)

        const result = await authService.login('a@b.com', 'correct-password')

        expect(result.accessToken).toBe('access-token')
        expect(result.refreshToken).toBe('refresh-token')
        expect(mockedUserModel.updateRefreshToken).toHaveBeenCalledWith(1, 'refresh-token')
    })
})

describe('authService.updateProfile', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects with 401 when there is no authenticated user', async () => {
        await expect(authService.updateProfile(undefined, 'New Name')).rejects.toMatchObject({ status: 401 })
    })

    it('rejects with 400 for an empty name', async () => {
        await expect(authService.updateProfile(1, '   ')).rejects.toMatchObject({ status: 400 })
    })

    it('rejects with 404 if the user row no longer exists', async () => {
        mockedUserModel.updateName.mockResolvedValue(null)

        await expect(authService.updateProfile(1, 'New Name')).rejects.toMatchObject({ status: 404 })
    })

    it('never leaks the password hash back to the caller', async () => {
        mockedUserModel.updateName.mockResolvedValue({ id: 1, name: 'New Name', email: 'a@b.com', password: 'hashed' })

        const result = await authService.updateProfile(1, 'New Name')

        expect(result).toEqual({ id: 1, name: 'New Name', email: 'a@b.com' })
        expect(result).not.toHaveProperty('password')
    })
})

describe('authService.logout', () => {
    beforeEach(() => vi.clearAllMocks())

    it('succeeds even when the refresh token is invalid/expired', async () => {
        mockedVerifyRefreshToken.mockRejectedValue(new Error('bad token'))

        await expect(authService.logout('some-token')).resolves.toBeUndefined()
    })

    it('clears the stored refresh token when it is valid', async () => {
        mockedVerifyRefreshToken.mockResolvedValue({ id: 1, email: 'a@b.com' })

        await authService.logout('valid-token')

        expect(mockedUserModel.removeRefreshToken).toHaveBeenCalledWith(1)
    })
})
