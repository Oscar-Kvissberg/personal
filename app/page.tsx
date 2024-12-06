import Image from 'next/image'
import LinkWithIcon from './components/LinkWithIcon'
import Socials from './components/Socials'
import Experience from './components/Experience'
import { HiOutlineDocument } from 'react-icons/hi'

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-[1fr,auto] gap-8 items-stretch">
          <div className="flex flex-col gap-6 h-full">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Hi Oscar here 👋</h1>
              <p className="text-white/80">
                22-year-old student from Sweden
              </p>
              <p className="text-white/80">
                I like to solve problems, drink instant coffee and watch premier league.
              </p>
            </div>

            <div className="flex gap-4 mt-auto">
              <LinkWithIcon href="/resume.pdf" text="Resume" icon={<HiOutlineDocument className="w-5 h-5" />} />
              <Socials />
            </div>
          </div>

          <div className="flex flex-col justify-end h-full">
            <Image
              src="/pp.jpg"
              alt="Profile picture"
              width={140}
              height={140}
              className="rounded-lg object-cover border border-white/20"
            />
          </div>
        </div>

        <Experience />
      </div>
    </main>
  )
}