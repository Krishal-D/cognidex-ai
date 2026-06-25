import type { Message } from '../../types'
import { HiOutlineUser, HiOutlineSparkles } from 'react-icons/hi'

interface Props {
    message: Message
}

const MessageBubble = ({ message }: Props) => {
    const isUser = message.role === 'user'

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser
                ? 'bg-[#16A34A]'
                : 'bg-white border border-[#E5E2DC]'
                }`}>
                {isUser
                    ? <HiOutlineUser className="w-4 h-4 text-white" />
                    : <HiOutlineSparkles className="w-4 h-4 text-[#16A34A]" />
                }
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                ? 'bg-[#16A34A] text-white rounded-tr-sm'
                : 'bg-white border border-[#E5E2DC] text-[#1A1A1A] rounded-tl-sm'
                }`}>
                {message.message_content}
            </div>
        </div>
    )
}

export default MessageBubble