import Image from 'next/image'
import { Experience } from "../../lib/schemas"

interface TimelineProps {
    experience: Experience[]
}

export default function Timeline({ experience }: TimelineProps) {
    return (
        <div className="bg-[#030712] border border-white/20 rounded-lg p-6">
            <div className="space-y-8">
                {experience.map((item, index) => (
                    <div key={index} className="relative pl-16">
                        {/* Logo circle */}
                        <div className="absolute left-0 top-0">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image
                                        src={item.logo || '/pp.jpg'}
                                        alt={item.company}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Timeline line */}
                        {index < experience.length - 1 && (
                            <div className="absolute left-6 top-12 h-[calc(100%+2rem)] border-l border-white/20" />
                        )}

                        {/* Content */}
                        <div>
                            <div className="mb-2">
                                <h3 className="text-xl font-bold text-white">{item.company}</h3>
                                <p className="text-white/80">{item.title}</p>
                                <p className="text-sm text-white/60">
                                    {item.startDate} - {item.endDate || 'Present'}
                                </p>
                            </div>
                            <ul className="space-y-2 text-white/80">
                                {item.description.map((desc, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-white/40 mt-1">•</span>
                                        <span>{desc}</span>
                                    </li>
                                ))}
                            </ul>
                            {item.tags && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs rounded-md bg-white/10 border border-white/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 