import LinkWithIcon from './LinkWithIcon'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

export default function Socials() {
    return (
        <>
            <LinkWithIcon
                href="https://linkedin.com"
                text="LinkedIn"
                icon={<FaLinkedin className="w-5 h-5" />}
            />
            <LinkWithIcon
                href="https://github.com"
                text="GitHub"
                icon={<FaGithub className="w-5 h-5" />}
            />
            <LinkWithIcon
                href="mailto:example@email.com"
                text="Email"
                icon={<HiOutlineMail className="w-5 h-5" />}
            />
        </>
    )
} 