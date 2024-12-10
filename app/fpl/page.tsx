'use client'
import React, { useEffect, useState } from 'react'
import { TeamData, Player } from '@/app/types'
import { LineGraph } from '@/app/components/LineGraph'

const FPL = () => {
    const [teamId] = useState<string>('2222751')
    const [teamData, setTeamData] = useState<TeamData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedGameweek, setSelectedGameweek] = useState<number>(teamData?.gameweek || 1)
    const [currentGameweek, setCurrentGameweek] = useState<number>(1)
    const [historicData, setHistoricData] = useState<any[]>([])

    useEffect(() => {
        fetchTeamData(teamId)
    }, [teamId])

    const fetchTeamData = async (id: string, gw?: number) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/fpl?gameweek=${gw || ''}`)
            if (!response.ok) {
                throw new Error('Kunde inte hämta lagdata')
            }
            const data = await response.json()
            setTeamData(data)
            setHistoricData(data.history || [])
            if (!gw) {
                setCurrentGameweek(data.gameweek)
                setSelectedGameweek(data.gameweek)
            }
        } catch (err: unknown) {
            setError('Något gick fel vid hämtning av FPL-data')
            if (err instanceof Error) {
                console.error(err.message)
            } else {
                console.error('Ett okänt fel uppstod:', err)
            }
        } finally {
            setLoading(false)
        }
    }

    const renderFormation = (players: Player[]) => {
        const starters = players.filter(p => !p.isOnBench)
        const substitutes = players.filter(p => p.isOnBench)

        const goalkeepers = starters.filter(p => p.position === 'MV')
        const defenders = starters.filter(p => p.position === 'FB')
        const midfielders = starters.filter(p => p.position === 'MF')
        const forwards = starters.filter(p => p.position === 'FW')

        // Hjälpfunktion för att centrera spelare i en rad
        const renderPlayerRow = (players: Player[]) => {
            return (
                <div className="mx-auto w-[80%] flex justify-evenly">
                    {players.map(player => (
                        <PlayerIcon key={player.id} player={player} />
                    ))}
                </div>
            )
        }

        return (
            <div className="relative max-w-5xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Gameweek-väljare */}
                    <div className="w-full lg:w-40 order-1">
                        <div className="flex flex-col gap-2 mb-4">
                            <label htmlFor="gameweek" className="text-white whitespace-nowrap">
                                Välj gameweek:
                            </label>
                            <select
                                id="gameweek"
                                value={selectedGameweek}
                                onChange={(e) => {
                                    const gw = parseInt(e.target.value)
                                    setSelectedGameweek(gw)
                                    fetchTeamData(teamId, gw)
                                }}
                                className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600 w-full"
                            >
                                {[...Array(currentGameweek)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        GW {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fotbollsplan med startelvan */}
                    <div className="flex-1 relative aspect-[2/3] sm:aspect-[2/2.2] min-h-[500px] sm:min-h-[400px] lg:min-h-0 order-2">
                        {/* Fotbollsplan bakgrund */}
                        <div className="absolute inset-0 border-2 border-gray-600 bg-gradient-to-b from-green-900/20 to-green-800/20 rounded-lg">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-gray-600" />
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600" />

                            {/* Gameweek poäng i överkant */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 p-2 rounded-lg border border-gray-700 bg-gray-800/50 text-center">
                                <p className="text-2xl font-bold text-white">
                                    {teamData?.gameweek_points || 0}
                                </p>
                            </div>
                        </div>

                        {/* Spelare på planen - justera positionerna */}
                        <div className="absolute inset-0">
                            {/* Anfallare */}
                            <div className="absolute top-[12%] sm:top-[10%] left-0 right-0">
                                {renderPlayerRow(forwards)}
                            </div>

                            {/* Mittfältare */}
                            <div className="absolute top-[35%] sm:top-[35%] left-0 right-0">
                                {renderPlayerRow(midfielders)}
                            </div>

                            {/* Försvarare */}
                            <div className="absolute top-[58%] sm:top-[60%] left-0 right-0">
                                {renderPlayerRow(defenders)}
                            </div>

                            {/* Målvakt */}
                            <div className="absolute top-[78%] sm:top-[82%] left-0 right-0">
                                {renderPlayerRow(goalkeepers)}
                            </div>
                        </div>
                    </div>

                    {/* Bänken - visas under planen på mobil */}
                    <div className="w-full lg:w-40 order-3">
                        <div className="border border-gray-700 rounded-lg px-4 py-8 lg:px-6 lg:py-10 bg-gray-800/20 h-full">
                            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible justify-between items-center h-full">
                                {substitutes.map((player) => (
                                    <div key={player.id} className="flex-shrink-0 py-4">
                                        <PlayerIcon player={player} small={false} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderPointsGraph = () => {
        if (!historicData.length) return null

        return (
            <div className="mt-8 p-6 rounded-xl border border-gray-700 bg-gray-800/20">
                <LineGraph data={historicData} />
            </div>
        )
    }

    const renderCaptainSuggestions = () => {
        if (!teamData?.captainSuggestions?.length) return null

        // Beräkna nästa gameweek nummer
        const nextGW = (selectedGameweek || 0) + 1

        return (
            <div className="mt-8 p-6 rounded-xl border border-gray-700 bg-gray-800/20">
                <h3 className="text-xl font-bold text-white mb-4">
                    Viktat kaptenförslag för GW {nextGW}
                </h3>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4">
                    {teamData.captainSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-2xl font-bold text-white/50">
                                    {index + 1}.
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {suggestion.name}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-sm">
                                <div className="text-gray-300">
                                    Form: {suggestion.form} (x2)
                                </div>
                                <div className="text-gray-300">
                                    Poäng/match: {suggestion.pointsPerGame} (x3)
                                </div>
                                <div className="text-gray-300">
                                    Totalpoäng: {suggestion.totalPoints}
                                </div>
                                <div className="text-gray-300">
                                    Vald av: {suggestion.selectedBy}
                                </div>
                                <div className="text-gray-300">
                                    Mål/Assist: {suggestion.goals}/{suggestion.assists}
                                </div>
                                {suggestion.cleanSheets > 0 && (
                                    <div className="text-gray-300">
                                        Nollor: {suggestion.cleanSheets}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <div className="text-gray-300">
                                    Nästa match: {suggestion.isHome ? 'Hemma' : 'Borta'} mot {suggestion.nextOpponent}
                                </div>
                                <div className="text-gray-300">
                                    Svårighetsgrad: {suggestion.difficulty}/5 (x1)
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <div className="text-sm font-semibold text-white">Beräkning:</div>
                                <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 text-sm">
                                    <div className="text-gray-300">
                                        Form: {suggestion.form} × 2 = {(suggestion.form * 2).toFixed(1)}
                                    </div>
                                    <div className="text-gray-300">
                                        Poäng/match: {suggestion.pointsPerGame} × 3 = {(suggestion.pointsPerGame * 3).toFixed(1)}
                                    </div>
                                    <div className="text-gray-300">
                                        Svårighet: {5 - suggestion.difficulty} × 1 = {(5 - suggestion.difficulty).toFixed(1)}
                                    </div>
                                </div>
                                <div className="text-white font-semibold mt-1">
                                    Total: {suggestion.totalScore?.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 pt-4 sm:pt-8 pb-8 mt-2 sm:mt-4">
                {loading && (
                    <div className="text-blue-200 p-4 rounded-lg mb-4">
                        Laddar...
                    </div>
                )}

                {error && (
                    <div className="text-red-200 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {teamData && (
                    <div className="space-y-6">
                        <div className="rounded-xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {teamData.name}
                                </h2>
                                <p className="text-blue-200">
                                    Säsong 2023/24
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-300 text-sm">Total poäng</p>
                                        <p className="text-2xl font-bold text-white">
                                            {selectedGameweek === teamData.gameweek
                                                ? teamData.summary_overall_points
                                                : teamData.total_points}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-300 text-sm">Overall rank</p>
                                        <p className="text-2xl font-bold text-white">
                                            {teamData.summary_overall_rank?.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-300 text-sm">Gameweek rank</p>
                                        <p className="text-2xl font-bold text-white">
                                            {selectedGameweek === teamData.gameweek
                                                ? teamData.summary_event_rank?.toLocaleString()
                                                : teamData.gameweek_rank?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            {renderFormation(teamData.players)}
                        </div>

                        {renderPointsGraph()}
                        {renderCaptainSuggestions()}
                    </div>
                )}
            </div>
        </div>
    )
}

// Uppdatera PlayerIcon för att hantera mindre storlek för bänkspelare
const PlayerIcon = ({ player, small = false }: { player: Player, small?: boolean }) => {
    return (
        <div className="flex flex-col items-center gap-1 w-16">
            <div className="relative flex justify-center">
                {/* Spelarikon */}
                <div className={`${small ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center relative`}>
                    <span className={`${small ? 'text-[10px]' : 'text-xs'} text-white font-medium`}>
                        {player.position}
                    </span>
                </div>

                {/* Kaptensmarkeringar - vänster sida */}
                {player.isCaptain && (
                    <span className={`absolute -top-1 -left-1 bg-yellow-500 text-xs rounded-full ${small ? 'w-3 h-3 text-[8px]' : 'w-4 h-4'} flex items-center justify-center`}>
                        C
                    </span>
                )}
                {player.isViceCaptain && (
                    <span className={`absolute -top-1 -left-1 bg-yellow-500/50 text-xs rounded-full ${small ? 'w-3 h-3 text-[8px]' : 'w-4 h-4'} flex items-center justify-center`}>
                        V
                    </span>
                )}

                {/* Poängcirkel - höger sida */}
                <div className={`absolute -top-1 -right-1
                    ${small ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'} 
                    ${player.points > 0 ? 'bg-green-500' : 'bg-gray-500'}
                    rounded-full flex items-center justify-center text-white font-bold 
                    border-2 border-gray-800 shadow-lg`}>
                    {player.points}
                </div>
            </div>

            {/* Spelarnamn och lag */}
            <div className="text-center w-full mt-2">
                <div className={`text-white ${small ? 'text-xs' : 'text-sm'} font-medium truncate`}>
                    {player.name.split(' ').pop()}
                </div>
                <div className={`text-gray-400 ${small ? 'text-[10px]' : 'text-xs'} truncate`}>
                    {player.team}
                </div>
            </div>
        </div>
    )
}

export default FPL