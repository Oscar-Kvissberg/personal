'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface EmailFormProps {
    isOpen: boolean
    onClose: () => void
}

export default function EmailForm({ isOpen, onClose }: EmailFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                alert('Email sent successfully!')
                onClose()
                setFormData({ name: '', email: '', message: '' })
            } else {
                alert('Failed to send email. Please try again.')
            }
        } catch (error) {
            alert('Failed to send email. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999]" style={{ isolation: 'isolate' }}>
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="bg-[#030712] border border-white/20 rounded-lg p-6 max-w-md w-full shadow-xl"
                >
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Message me through the form</h2>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                        or send email to{' '}
                        <a
                            href="mailto:oscarkvissberg@gmail.com"
                            className="text-white/80 hover:text-white"
                        >
                            oscarkvissberg@gmail.com
                        </a>
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm text-white/80 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm text-white/80 mb-1">
                                Your Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm text-white/80 mb-1">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={4}
                                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 outline-none resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 rounded-lg neon-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Email'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    )
} 