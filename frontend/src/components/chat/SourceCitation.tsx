import { useState } from 'react'
import type { Source } from '../../types'
import { HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineDocument } from 'react-icons/hi'

interface Props {
    sources: Source[]
}

const SourceCitation = ({ sources }: Props) => {
    const [open, setOpen] = useState(false)

    if (!sources || sources.length === 0) return null

    return (
        <div className="mt-2 max-w-[75%]">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs text-[#8A8680] hover:text-[#1A1A1A] transition-colors"
            >
                {open
                    ? <HiOutlineChevronDown className="w-3 h-3" />
                    : <HiOutlineChevronRight className="w-3 h-3" />
                }
                {sources.length} source{sources.length > 1 ? 's' : ''}
            </button>

            {open && (
                <div className="mt-2 space-y-1.5">
                    {sources.map((source, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 bg-white border border-[#E5E2DC] rounded-xl px-3 py-2"
                        >
                            <HiOutlineDocument className="w-3.5 h-3.5 text-[#8A8680] flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-[#1A1A1A]">
                                    {source.document}
                                </p>
                                <p className="text-xs text-[#8A8680]">
                                    Chunk {source.chunkIndex + 1}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SourceCitation