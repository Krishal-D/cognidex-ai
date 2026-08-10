import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/models/documentModel', () => ({
    documentModel: {
        uploadDocument: vi.fn(),
        updateStatus: vi.fn(),
        findDocumentByUser: vi.fn(),
        deleteDocument: vi.fn(),
    },
}))

vi.mock('../../src/models/chunkModel', () => ({
    chunkModel: { insertChunk: vi.fn() },
}))

import { documentModel } from '../../src/models/documentModel'
import { documentService } from '../../src/services/documentService'

const mockedDocumentModel = documentModel as any

describe('documentService.uploadDocument validation', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects when there is no authenticated user', async () => {
        await expect(
            documentService.uploadDocument('Doc', undefined, 'pending', Buffer.from('%PDF-1.4'))
        ).rejects.toMatchObject({ status: 401 })
    })

    it('rejects an empty document name', async () => {
        await expect(
            documentService.uploadDocument('   ', 42, 'pending', Buffer.from('%PDF-1.4'))
        ).rejects.toMatchObject({ status: 400 })
    })

    it('rejects when no file buffer is provided', async () => {
        await expect(
            documentService.uploadDocument('Doc', 42, 'pending', undefined)
        ).rejects.toMatchObject({ status: 400 })
    })

    it('rejects a file whose bytes are not actually a PDF, even with a valid name', async () => {
        await expect(
            documentService.uploadDocument('Doc', 42, 'pending', Buffer.from('not a pdf at all'))
        ).rejects.toMatchObject({ status: 400 })

        expect(mockedDocumentModel.uploadDocument).not.toHaveBeenCalled()
    })
})

describe('documentService.findDocumentByUser', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects when there is no authenticated user', async () => {
        await expect(documentService.findDocumentByUser(undefined)).rejects.toMatchObject({ status: 401 })
    })

    it('scopes the lookup to the requesting owner', async () => {
        mockedDocumentModel.findDocumentByUser.mockResolvedValue([])

        await documentService.findDocumentByUser(42)

        expect(mockedDocumentModel.findDocumentByUser).toHaveBeenCalledWith(42)
    })
})

describe('documentService.deleteDocument', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejects when there is no authenticated user', async () => {
        await expect(documentService.deleteDocument('7', undefined)).rejects.toMatchObject({ status: 401 })
    })

    it('rejects a non-numeric or non-positive document id', async () => {
        await expect(documentService.deleteDocument('not-a-number', 42)).rejects.toMatchObject({ status: 400 })
        await expect(documentService.deleteDocument('-1', 42)).rejects.toMatchObject({ status: 400 })
        expect(mockedDocumentModel.deleteDocument).not.toHaveBeenCalled()
    })

    it('passes both the document id and the owner id through to the model', async () => {
        await documentService.deleteDocument('7', 42)

        expect(mockedDocumentModel.deleteDocument).toHaveBeenCalledWith(7, 42)
    })
})
