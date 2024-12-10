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
      <main className="w-full px-2 sm:container sm:mx-auto sm:px-16 md:px-32 lg:px-64 py-8 mt-8 sm:mt-12">
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-[1fr,auto] gap-4 sm:gap-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-bold text-white">Hi Oscar here 👋</h1>
                <p className="text-sm sm:text-base text-white/80">
                  22-year-old student from Sweden
                </p>
                <p className="text-sm sm:text-base text-white/80">
                  I like to solve problems, drink instant coffee and watch premier league.
                </p>
                <button
                  onClick={handleOpenChat}
                  className="flex items-center gap-2 text-blue-400 text-xs sm:text-sm mt-2 hover:text-blue-300 transition-colors group"
                >
                  <span className="text-blue-400 group-hover:underline group-hover:text-blue-300">Ask the chatbot anything about me</span>
                  <BsArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce text-blue-400 group-hover:text-blue-300" />
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

          <Experience />
        </div>
      </main>
      <ChatBot onOpenChat={setOpenChatRef} />
    </>
  )
}