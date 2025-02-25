import { FaReact, FaPython, FaFileExcel } from 'react-icons/fa'
import { SiTypescript, SiTailwindcss, SiNextdotjs } from 'react-icons/si'

const technologies = [
    {
        name: 'React',
        icon: FaReact,
        color: '#61DAFB'
    },
    {
        name: 'Next.js',
        icon: SiNextdotjs,
        color: '#ffffff'
    },
    {
        name: 'TypeScript',
        icon: SiTypescript,
        color: '#3178C6'
    },
    {
        name: 'Tailwind',
        icon: SiTailwindcss,
        color: '#38B2AC'
    },
    {
        name: 'Python',
        icon: FaPython,
        color: '#3776AB'
    },
    {
        name: 'Excel VBA',
        icon: FaFileExcel,
        color: '#217346'
    }
]

export default function TechStack() {
    return (
        <div className="border border-white/20 rounded-lg p-6 relative z-[0]">
            <h2 className="text-xl font-bold text-white mb-4">Technical Competences</h2>
            <div className="flex flex-wrap gap-4">
                {technologies.map((tech) => (
                    <div
                        key={tech.name}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <tech.icon className="w-5 h-5 flex-shrink-0" style={{ color: tech.color }} />
                        <span className="text-sm text-white/80">{tech.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
} 