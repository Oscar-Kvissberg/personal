'use client'

import Image from 'next/image'
import LinkWithIcon from './components/LinkWithIcon'
import Socials from './components/Socials'
import Experience from './components/Experience'
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2'
import ChatBot from './components/ChatBot'
import { BsArrowDown } from 'react-icons/bs'
import { useRef } from 'react'

export default function Home() {
  const openChatRef = useRef<(() => void) | null>(null)

  const handleOpenChat = () => {
    if (openChatRef.current) {
      openChatRef.current()
    }
  }

  const setOpenChatRef = (openFn: () => void) => {
    openChatRef.current = openFn
  }

  return (
    <>
      {/* Bakgrundsskuggor */}
      <div className="fixed inset-0 z-[-2] overflow-hidden">
        <div className="absolute top-[2%] left-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[800px] bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-[40%] right-[25%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Stjärnor */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="stars-wrapper">
          {/* Första container */}
          <div className="stars-container">
            {[...Array(100)].map((_, i) => (
              <div
                key={`star-1-${i}`}
                className={`star ${i % 3 === 0
                  ? 'star-large'
                  : i % 2 === 0
                    ? 'star-medium'
                    : 'star-small'
                  }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Andra container */}
          <div className="stars-container-2">
            {[...Array(100)].map((_, i) => (
              <div
                key={`star-2-${i}`}
                className={`star ${i % 3 === 0
                  ? 'star-large'
                  : i % 2 === 0
                    ? 'star-medium'
                    : 'star-small'
                  }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sätt ett lågt z-index på main content */}
      <main className="w-full min-h-screen pt-16 lg:pt-24 relative z-[1]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0">
          {/* Vänster kolumn */}
          <div className="lg:fixed lg:w-[50%] min-h-fit lg:h-screen p-4 sm:p-8 lg:pt-0 relative z-[1]">
            <div className="max-w-xl mx-auto">
              <div className="grid grid-cols-[140px,minmax(0,1fr)] gap-4 sm:gap-8">
                <div className="w-[120px] sm:w-[140px] flex-shrink-0">
                  <Image
                    src="/pp.jpg"
                    alt="Profile picture"
                    width={140}
                    height={140}
                    className="w-full h-auto rounded-lg object-cover border border-white/20"
                  />
                </div>

                <div className="flex flex-col gap-6 min-w-0">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white truncate">
                      Tjena, <span className="text-white">Oscar</span> here <span className="hover:wave-animation inline-block cursor-pointer">👋</span>
                    </h1>
                    <p className="text-sm sm:text-base text-white/80">
                      Industrial Engineering student from Sweden, Stockholm.
                    </p>
                    <p className="text-sm sm:text-base text-white/80">
                    I enjoy solving problems, playing Counter Strike 2, and downing instant coffee like it&apos;s liquid gold. 
                    </p>
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center gap-2 text-xs sm:text-sm mt-2 group hover:scale-105 transition-transform origin-left"
                    >
                      <span className="neon-text group-hover:text-shadow-strong">Ask the chatbot anything about me</span>
                      <BsArrowDown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce neon-icon group-hover:filter-strong" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center gap-2 flex-wrap">
                <LinkWithIcon
                  href="/resume.pdf"
                  text="Resume"
                  icon={<HiOutlineDocumentArrowDown className="w-5 h-5" />}
                  download
                />
                <Socials />
              </div>
            </div>
          </div>

          {/* Höger kolumn */}
          <div className="lg:col-start-2 p-4 sm:p-8 lg:pt-0 relative z-[1]">
            <div className="max-w-xl lg:max-w-3xl mx-auto">
              <Experience />
            </div>
          </div>
        </div>
      </main>

      {/* Lägg till en portal-container för modaler */}
      <div id="modal-root" className="relative z-[9999]">
        <ChatBot onOpenChat={setOpenChatRef} />
      </div>
    </>
  )
}