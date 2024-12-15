'use client'

import Image from 'next/image'
import LinkWithIcon from './components/LinkWithIcon'
import Socials from './components/Socials'
import Experience from './components/Experience'
import { HiOutlineDocument } from 'react-icons/hi'
import ChatBot from './components/ChatBot'
import { BsArrowDownRight } from 'react-icons/bs'
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
      <div className="stars-container fixed inset-0 z-[-1]">
        {/* Små stjärnor */}
        {[...Array(30)].map((_, i) => (
          <div key={`small-${i}`} className="star star-small"></div>
        ))}
        {/* Mellanstora stjärnor */}
        {[...Array(20)].map((_, i) => (
          <div key={`medium-${i}`} className="star star-medium"></div>
        ))}
        {/* Stora stjärnor */}
        {[...Array(10)].map((_, i) => (
          <div key={`large-${i}`} className="star star-large"></div>
        ))}
      </div>

      <main className="w-full min-h-screen pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0">
          {/* Vänster kolumn - Fixed position */}
          <div className="lg:fixed lg:w-[50%] min-h-fit lg:h-screen p-4 sm:p-8 lg:pt-0">
            <div className="max-w-xl mx-auto">
              <div className="grid grid-cols-[1fr,auto] gap-4 sm:gap-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white">
                      Hi Oscar here <span className="hover:wave-animation inline-block cursor-pointer">👋</span>
                    </h1>
                    <p className="text-sm sm:text-base text-white/80">
                      22-year-old student from Sweden
                    </p>
                    <p className="text-sm sm:text-base text-white/80">
                      I like to solve problems, drink instant coffee and watch Premier League.
                    </p>
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center gap-2 text-xs sm:text-sm mt-2 group hover:scale-105 transition-transform origin-left"
                    >
                      <span className="neon-text group-hover:text-shadow-strong">Ask the chatbot anything about me</span>
                      <BsArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce neon-icon group-hover:filter-strong" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
                    <LinkWithIcon
                      href="/resume.pdf"
                      text="Resume"
                      icon={<HiOutlineDocument className="w-5 h-5" />}
                      download
                    />
                    <Socials />
                  </div>
                </div>

                <div>
                  <Image
                    src="/pp.jpg"
                    alt="Profile picture"
                    width={140}
                    height={140}
                    className="w-[120px] sm:w-[140px] h-auto rounded-lg object-cover border border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Höger kolumn - Scrollable content */}
          <div className="lg:col-start-2 p-4 sm:p-8 lg:pt-0">
            <div className="max-w-xl lg:max-w-3xl mx-auto">
              <Experience />
            </div>
          </div>
        </div>
      </main>
      <ChatBot onOpenChat={setOpenChatRef} />
    </>
  )
}