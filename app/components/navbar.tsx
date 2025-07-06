'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { UserCircleIcon, RocketLaunchIcon, CakeIcon, CreditCardIcon, RectangleGroupIcon, DocumentTextIcon, SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import MusicPlayer from './MusicPlayer'

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLexingtonOpen, setIsLexingtonOpen] = useState(false)
    const [isDataAnalyticsOpen, setIsDataAnalyticsOpen] = useState(false)
    const navRef = useRef<HTMLElement>(null)

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
                className="fixed top-0 h-10 flex items-center left-4 z-[51] p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
                <div className="flex flex-col gap-1.5 w-6">
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-full bg-gray-200 transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
            </button>

            {/* Lägg till MusicPlayer-komponenten */}
            <MusicPlayer />

            {/* Horisontell navbar */}
            <div className="fixed top-0 left-0 right-0 h-10 backdrop-blur-[4px] bg-gray-900/10 border-b border-gray-200/10 z-40" />

            {/* Sidonav */}
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
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-200 hover:text-white transition-all duration-200 flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 hover:shadow-lg"
                        >
                            <UserCircleIcon className="w-5 h-5" />
                            About me
                        </Link>
                        <Link
                            href="/fpl"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-200 hover:text-white transition-all duration-200 flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 hover:shadow-lg"
                        >
                            <CakeIcon className="w-5 h-5" />
                            FPL
                        </Link>
                        
                        {/* Lexington Dropdown */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsLexingtonOpen(!isLexingtonOpen)}
                                className="text-gray-200 hover:text-white transition-all duration-200 flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800/30 hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5" />
                                    Lexington
                                </div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isLexingtonOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown innehåll */}
                            <div className={`overflow-hidden transition-all duration-200 ${isLexingtonOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-8 mt-2 flex flex-col gap-1">
                                    <Link
                                        href="/Lexington/LexingtonFileConvBooztNewDispatch"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <RocketLaunchIcon className="w-4 h-4" />
                                        Boozt New Dispatch
                                    </Link>
                                    <Link
                                        href="/Lexington/LexingtonFileConvBooztInvoice"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <CreditCardIcon className="w-4 h-4" />
                                        Boozt Invoice
                                    </Link>
                                    <Link
                                        href="/Lexington/LexingtonFileConvIllumInvoiceSegmentation"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <RectangleGroupIcon className="w-4 h-4" />
                                        Illum Inv. Seg.
                                    </Link>
                                    <Link
                                        href="/Lexington/LexingtonFileConvCarvalho"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
                                        Carvalho Invoice
                                    </Link>
                                    <Link
                                        href="/Lexington/LexingtonAIInvoice"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        AI Invoice
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Data Analytics Dropdown */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsDataAnalyticsOpen(!isDataAnalyticsOpen)}
                                className="text-gray-200 hover:text-white transition-all duration-200 flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800/30 hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5" />
                                    Data Analytics Prac.
                                </div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDataAnalyticsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown innehåll */}
                            <div className={`overflow-hidden transition-all duration-200 ${isDataAnalyticsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-8 mt-2 flex flex-col gap-1">
                                    <Link
                                        href="/Data_analysis/Gbg"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-800/20 hover:shadow-md"
                                    >
                                        <RocketLaunchIcon className="w-4 h-4" />
                                        GB Data
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
