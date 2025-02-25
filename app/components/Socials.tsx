'use client'

import { FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { useState } from 'react'
import EmailForm from './EmailForm'

export default function Socials() {
    const [isEmailFormOpen, setIsEmailFormOpen] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <a
                    href="https://www.linkedin.com/in/oscar-kvissberg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white neon-button"
                >
                    <FaLinkedin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">LinkedIn</span>
                </a>
                <button
                    onClick={() => setIsEmailFormOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white neon-button"
                >
                    <MdEmail className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Email</span>
                </button>
            </div>
            <EmailForm
                isOpen={isEmailFormOpen}
                onClose={() => setIsEmailFormOpen(false)}
            />
        </div>
    )
} 