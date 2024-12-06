import Image from 'next/image'
import { Experience } from "../../lib/schemas"

interface TimelineProps {
    experience: Experience[]
}

export default function Timeline({ experience }: TimelineProps) {
    return (
        <div className="space-y-8">
            {experience.map((item, index) => (
                <div key={index} className="relative pl-16">
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
                    <div className="absolute left-6 top-0 h-full border-l border-white/20" />
                    <div>
                        <div className="mb-2">
                            <h3 className="font-medium text-white">{item.company}</h3>
                            <p className="text-white/80">{item.title}</p>
                            <p className="text-sm text-white/60">
                                {item.startDate} - {item.endDate || 'Present'}
                            </p>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-2 text-white/80">
                            {item.description.map((desc: string, i: number) => (
                                <li key={i} className="pl-2">{desc}</li>
                            ))}
                        </ul>
                        {item.tags && (
                            <div className="mt-3 flex gap-2">
                                {item.tags.map((tag: string, i: number) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20"
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
    )
} 