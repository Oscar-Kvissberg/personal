'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { UserCircleIcon, FolderIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Hamburger-knapp */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
                <div className="flex flex-col gap-1.5 w-6">
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
            </button>

            {/* Navbar */}
            <nav className={`fixed left-0 top-0 h-screen w-64 backdrop-blur-[20px] border-r border-gray-200/20 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Profilsektion */}
                <div className="p-4 mt-16 border-b border-gray-200/10">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                                src="/pp.jpg"
                                alt="Profile"
                                fill
                                className="object-cover object-[center_35%]"
                                priority
                            />
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-light tracking-wide">Oscar Kvissberg</h3>
                        </div>
                    </div>
                </div>

                {/* Navigation länkar */}
                <div className="p-4">
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/"
                            className="text-gray-200 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <UserCircleIcon className="w-5 h-5" />
                            Om mig
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-gray-200 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <FolderIcon className="w-5 h-5" />
                            Projekt
                        </Link>
                        <Link
                            href="/settings"
                            className="text-gray-200 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <EnvelopeIcon className="w-5 h-5" />
                            Kontakt
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
