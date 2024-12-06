'use client'
import React, { useRef, useEffect, useState } from 'react'

interface DataPoint {
    event: number
    points: number
    average_points: number
    highest_score: number
}

interface LineGraphProps {
    data: DataPoint[]
    height?: number
}

export const LineGraph = ({ data, height = 400 }: LineGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(800)

    useEffect(() => {
        if (containerRef.current) {
            const updateWidth = () => {
                setWidth(containerRef.current?.clientWidth || 800)
            }

            updateWidth()
            window.addEventListener('resize', updateWidth)
            return () => window.removeEventListener('resize', updateWidth)
        }
    }, [])

    const padding = 40
    const graphWidth = width - padding * 2
    const graphHeight = height - padding * 2

    // Hitta min och max värden
    const allValues = data.flatMap(d => [d.points, d.average_points, d.highest_score])
    const minValue = Math.floor(Math.min(...allValues))
    const maxValue = Math.ceil(Math.max(...allValues))

    // Skapa skalningsfunktioner
    const xScale = (index: number) => (index * graphWidth) / (data.length - 1) + padding
    const yScale = (value: number) =>
        graphHeight - ((value - minValue) * graphHeight) / (maxValue - minValue) + padding

    // Skapa linjer
    const createLine = (values: number[]) => {
        return values.map((value, i) =>
            `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(value)}`
        ).join(' ')
    }

    const pointsLine = createLine(data.map(d => d.points))
    const averageLine = createLine(data.map(d => d.average_points))
    const highestLine = createLine(data.map(d => d.highest_score))

    return (
        <div ref={containerRef} className="w-full">
            <svg width={width} height={height} className="bg-gray-800/20 rounded-xl">
                {/* Grid */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const y = yScale(minValue + (i * (maxValue - minValue) / 5))
                    return (
                        <g key={i}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="3,3"
                            />
                            <text
                                x={padding - 5}
                                y={y}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fill="white"
                                fontSize="12"
                            >
                                {Math.round(minValue + (i * (maxValue - minValue) / 5))}
                            </text>
                        </g>
                    )
                })}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={xScale(i)}
                        y={height - padding / 2}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                    >
                        {d.event}
                    </text>
                ))}

                {/* Lines */}
                <path d={highestLine} stroke="#fbbf24" strokeWidth="1" fill="none" strokeDasharray="5,5" />
                <path d={pointsLine} stroke="#4ade80" strokeWidth="2" fill="none" />
                <path d={averageLine} stroke="#f87171" strokeWidth="2" fill="none" />

                {/* Legend */}
                <g transform={`translate(${width - 150}, 20)`}>
                    <g>
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#fbbf24" strokeDasharray="5,5" />
                        <text x="25" y="4" fill="white" fontSize="12">Högsta poäng</text>
                    </g>
                    <g transform="translate(0, 20)">
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#4ade80" strokeWidth="2" />
                        <text x="25" y="4" fill="white" fontSize="12">Mina poäng</text>
                    </g>
                    <g transform="translate(0, 40)">
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#f87171" strokeWidth="2" />
                        <text x="25" y="4" fill="white" fontSize="12">Genomsnitt</text>
                    </g>
                </g>
            </svg>
        </div>
    )
} 