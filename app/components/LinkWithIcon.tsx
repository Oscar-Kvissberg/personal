import { ReactNode } from 'react'

interface LinkWithIconProps {
    href: string
    text: string
    icon?: ReactNode
    download?: boolean
}

export default function LinkWithIcon({ href, text, icon, download = false }: LinkWithIconProps) {
    return (
        <a
            href={href}
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white neon-button"
            target="_blank"
            rel="noopener noreferrer"
            download={download ? "Oscar_Kvissberg_Resume.pdf" : undefined}
        >
            {icon}
            <span>{text}</span>
        </a>
    )
} 