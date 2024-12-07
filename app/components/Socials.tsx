import LinkWithIcon from './LinkWithIcon'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

export default function Socials() {
    return (
        <>
            <LinkWithIcon
                href="https://www.linkedin.com/in/oscar-kvissberg/"
                text="LinkedIn"
                icon={<FaLinkedin className="w-5 h-5" />}
            />
            <LinkWithIcon
                href="https://github.com/Oscar-Kvissberg"
                text="GitHub"
                icon={<FaGithub className="w-5 h-5" />}
            />
            <LinkWithIcon
                href="mailto:oscarkvissberg@gmail.com"
                text="Email"
                icon={<HiOutlineMail className="w-5 h-5" />}
            />
        </>
    )
} 