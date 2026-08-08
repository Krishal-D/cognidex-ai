import { useState } from 'react'
import { useDocuments } from '../../hooks/useDocuments'
import { useConversations } from '../../hooks/useConversations'
import type { Document, Conversation } from '../../types'
import { HiOutlineDocument, HiOutlineSparkles, HiOutlineUpload, HiOutlinePlus, HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
    selectedDocumentId: number | null
    selectedConversationId: number | null
    onSelectDocument: (id: number) => void
    onSelectConversation: (id: number) => void
}

const Sidebar = ({
    selectedDocumentId,
    selectedConversationId,
    onSelectDocument,
    onSelectConversation
}: SidebarProps) => {
    const { user, logout } = useAuth()
    const { documents, loading, error, uploadDocument, deleteDocument } = useDocuments()
    const { conversations, createConversation, renameConversation } = useConversations(selectedDocumentId)
    const [uploading, setUploading] = useState(false)
    const [expandedDocumentId, setExpandedDocumentId] = useState<number | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            await uploadDocument(file, file.name)
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleNewConversation = async (documentId: number) => {
        const name = `Conversation ${conversations.length + 1}`
        const conv = await createConversation(name, documentId)
        if (conv) onSelectConversation(conv.id)
    }

    const handleDeleteDocument = async (e: React.MouseEvent, doc: Document) => {
        e.stopPropagation()
        if (!window.confirm(`Delete "${doc.document_name}"? This also deletes its conversations.`)) return
        await deleteDocument(doc.id)
        if (expandedDocumentId === doc.id) setExpandedDocumentId(null)
    }

    const handleRenameConversation = async (e: React.MouseEvent, conv: Conversation) => {
        e.stopPropagation()
        const newName = window.prompt('Rename conversation', conv.conversation_name)?.trim()
        if (!newName || newName === conv.conversation_name) return
        try {
            await renameConversation(conv.id, newName)
        } catch {
            window.alert('Failed to rename conversation. Please try again.')
        }
    }

    return (
        <aside className="flex flex-col w-64 h-screen bg-[#F0EDE8] border-r border-[#E5E2DC] flex-shrink-0">

            {/* Logo */}
            <div className="p-5 border-b border-[#E5E2DC]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                        <HiOutlineSparkles className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-[#1A1A1A]">
                            Cogni<span className="text-[#16A34A]">dex</span>
                        </h1>
                        <p className="text-xs text-[#8A8680]">{user?.name}</p>
                    </div>
                </div>
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-xs font-semibold text-[#8A8680] uppercase tracking-wider px-2 py-2">
                    Documents
                </p>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 mb-1">
                        {error}
                    </p>
                )}

                {loading && (
                    <p className="text-sm text-[#8A8680] px-2">Loading...</p>
                )}

                {!loading && documents.length === 0 && (
                    <p className="text-sm text-[#8A8680] px-2">
                        No documents yet. Upload your first PDF below.
                    </p>
                )}

                {documents.map((doc: Document) => (
                    <div key={doc.id}>
                        {/* Document row */}
                        <div
                            onClick={() => {
                                onSelectDocument(doc.id)
                                setExpandedDocumentId(
                                    expandedDocumentId === doc.id ? null : doc.id
                                )
                            }}
                            className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${selectedDocumentId === doc.id
                                ? 'bg-white shadow-sm border border-[#E5E2DC]'
                                : 'hover:bg-white/60'
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                {expandedDocumentId === doc.id
                                    ? <HiOutlineChevronDown className="w-3.5 h-3.5 text-[#8A8680] flex-shrink-0" />
                                    : <HiOutlineChevronRight className="w-3.5 h-3.5 text-[#8A8680] flex-shrink-0" />
                                }
                                <HiOutlineDocument className="w-4 h-4 text-[#8A8680] flex-shrink-0" />
                                <span className="text-sm font-medium text-[#1A1A1A] truncate">
                                    {doc.document_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${doc.status === 'indexed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : doc.status === 'pending' || doc.status === 'processing'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-600'
                                    }`}>
                                    {doc.status}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteDocument(e, doc)}
                                    title="Delete document"
                                    aria-label={`Delete ${doc.document_name}`}
                                    className="p-1 rounded-lg text-[#8A8680] opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                >
                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Conversations under selected document */}
                        {expandedDocumentId === doc.id && (
                            <div className="ml-6 mt-1 space-y-0.5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {conversations.map((conv: Conversation) => (
                                    <div
                                        key={conv.id}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onSelectConversation(conv.id)
                                        }}
                                        className={`group/conv flex items-center justify-between gap-1 p-2 rounded-lg cursor-pointer text-sm transition-all ${selectedConversationId === conv.id
                                            ? 'bg-[#16A34A] text-white'
                                            : 'text-[#3D3D3D] hover:bg-white/60'
                                            }`}
                                    >
                                        <span className="truncate">{conv.conversation_name}</span>
                                        <button
                                            onClick={(e) => handleRenameConversation(e, conv)}
                                            title="Rename conversation"
                                            aria-label={`Rename ${conv.conversation_name}`}
                                            className={`p-1 rounded-md flex-shrink-0 opacity-0 group-hover/conv:opacity-100 transition-all ${selectedConversationId === conv.id
                                                ? 'hover:bg-white/20'
                                                : 'hover:bg-white'
                                                }`}
                                        >
                                            <HiOutlinePencil className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleNewConversation(doc.id)}
                                    className="flex items-center gap-1.5 w-full p-2 rounded-lg text-sm text-[#16A34A] hover:bg-white/60 transition-all"
                                >
                                    <HiOutlinePlus className="w-3.5 h-3.5" />
                                    New Conversation
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Upload + logout */}
            <div className="p-3 border-t border-[#E5E2DC] space-y-2">
                <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-[#E5E2DC] cursor-pointer transition-all hover:border-[#16A34A] hover:bg-white/60 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <HiOutlineUpload className="w-4 h-4 text-[#3D3D3D]" />
                    <span className="text-sm font-medium text-[#3D3D3D]">
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                    </span>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>

                <button
                    onClick={logout}
                    className="w-full p-2.5 rounded-xl text-sm text-[#8A8680] hover:bg-white/60 hover:text-[#1A1A1A] transition-all text-left"
                >
                    Sign out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar