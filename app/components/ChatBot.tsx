'use client'

import { useState, useEffect } from 'react'
import { IoMdSend } from 'react-icons/io'
import { BsChatDots } from 'react-icons/bs'
import { IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5'

interface ChatBotProps {
    onOpenChat: (openFn: () => void) => void
}

export default function ChatBot({ onOpenChat }: ChatBotProps) {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        onOpenChat(() => {
            setIsOpen(true)
            setIsExpanded(true)
        })
    }, [onOpenChat])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const newMessage = { role: 'user' as const, content: input }
        setMessages(prev => [...prev, newMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                }),
            })

            if (!response.ok) throw new Error('API request failed')

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message
            }])
        } catch (error) {
            console.error('Error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Ursäkta, något gick fel. Försök igen senare.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors"
                >
                    <BsChatDots className="w-6 h-6" />
                </button>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[350px]">
                    <div className="flex items-center border-b border-gray-800">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex-1 p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <h3 className="font-medium text-white">Chat with Oscar</h3>
                            </div>
                            {isExpanded ? (
                                <IoChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                                <IoChevronUp className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-4 hover:bg-gray-800/50 transition-colors border-l border-gray-800"
                        >
                            <IoClose className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {isExpanded && (
                        <div className="h-[400px] flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-8">
                                        <div className="flex justify-center mb-4">
                                            <BsChatDots className="w-12 h-12" />
                                        </div>
                                        Send a message to start the chat!
                                        <p className="text-sm mt-2">
                                            You can ask the bot anything about me and it will help to find the relevant information!
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-lg ${msg.role === 'user'
                                            ? 'bg-blue-500/20 ml-auto max-w-[80%]'
                                            : 'bg-gray-800 mr-auto max-w-[80%]'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="bg-gray-800 rounded-lg p-3 mr-auto max-w-[80%]">
                                        Thinking...
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask something..."
                                        className="flex-1 bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        <IoMdSend className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 