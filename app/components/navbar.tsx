'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { UserCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                const hamburgerButton = document.querySelector('#hamburger-button')
                if (!hamburgerButton?.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            {/* Hamburger-knapp */}
            <button
                id="hamburger-button"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[51] p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
                <div className="flex flex-col gap-1.5 w-6">
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
            </button>

            {/* Navbar */}
            <nav
                ref={navRef}
                className={`
                    fixed left-0 top-0 h-screen w-64 
                    backdrop-blur-[20px] 
                    border-r border-gray-200/20 
                    transition-transform duration-300 
                    z-50
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
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
                            onClick={() => setIsOpen(false)}
                            className="text-gray-200 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <UserCircleIcon className="w-5 h-5" />
                            Om mig
                        </Link>
                        <Link
                            href="/fpl"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-200 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <ChartBarIcon className="w-5 h-5" />
                            Fantasy Premier League
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
