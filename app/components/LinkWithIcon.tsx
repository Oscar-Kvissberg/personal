import { ReactNode } from 'react'

interface LinkWithIconProps {
    href: string
    text: string
    icon: React.ReactNode
    download?: boolean
}

export default function LinkWithIcon({ href, text, icon, download }: LinkWithIconProps) {
    return (
        <div className="w-fit">
            <a
                href={href}
                download={download}
                target={download ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white neon-button"
            >
                <span className="w-5 h-5 flex-shrink-0">
                    {icon}
                </span>
                <span className="text-sm">{text}</span>
            </a>
        </div>
    )
} 