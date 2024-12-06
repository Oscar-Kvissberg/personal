import { NextRequest, NextResponse } from 'next/server'
import { Player, BootstrapData, Fixture, CaptainSuggestion } from '@/app/types'

// Flytta funktionen utanför GET-funktionen
function suggestCaptain(
    players: Player[],
    bootstrapData: BootstrapData,
    fixturesData: Fixture[]
): CaptainSuggestion[] {
    const nextGameweek = bootstrapData.events.find((event) => !event.finished && !event.is_current)?.id

    const playerStats = players.map(player => {
        const playerInfo = bootstrapData.elements.find((p) => p.id === player.id)
        if (!playerInfo) return null

        const nextFixture = fixturesData.find(
            (f) => f.event === nextGameweek &&
                (f.team_h === playerInfo.team || f.team_a === playerInfo.team)
        )

        const opposingTeam = nextFixture
            ? (playerInfo.team === nextFixture.team_h
                ? bootstrapData.teams.find((t) => t.id === nextFixture.team_a)
                : bootstrapData.teams.find((t) => t.id === nextFixture.team_h))
            : null

        // Konvertera form och points_per_game till nummer
        const formValue = typeof playerInfo.form === 'string'
            ? parseFloat(playerInfo.form)
            : (playerInfo.form || 0)

        const ppgValue = typeof playerInfo.points_per_game === 'string'
            ? parseFloat(playerInfo.points_per_game)
            : (playerInfo.points_per_game || 0)

        return {
            ...player,
            form: formValue,
            pointsPerGame: ppgValue,
            totalPoints: playerInfo.total_points || 0,
            selectedBy: playerInfo.selected_by_percent + '%',
            goals: playerInfo.goals_scored || 0,
            assists: playerInfo.assists || 0,
            cleanSheets: playerInfo.clean_sheets || 0,
            difficulty: nextFixture
                ? (playerInfo.team === nextFixture.team_h
                    ? nextFixture.team_h_difficulty
                    : nextFixture.team_a_difficulty)
                : 3,
            nextOpponent: opposingTeam?.short_name || '?',
            isHome: nextFixture ? playerInfo.team === nextFixture.team_h : false,
            totalScore: 0
        }
    })
        .filter((player): player is NonNullable<typeof player> => player !== null)

    playerStats.forEach(player => {
        player.totalScore =
            (player.form * 2) +
            (player.pointsPerGame * 3) +
            ((5 - player.difficulty) * 1)
    })

    return playerStats
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 3)
        .map(player => ({
            name: player.name,
            form: player.form,
            pointsPerGame: player.pointsPerGame,
            totalPoints: player.totalPoints,
            selectedBy: player.selectedBy,
            goals: player.goals,
            assists: player.assists,
            cleanSheets: player.cleanSheets,
            difficulty: player.difficulty,
            nextOpponent: player.nextOpponent,
            isHome: player.isHome,
            totalScore: player.totalScore
        }))
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const gameweek = searchParams.get('gameweek')
        const teamId = '2222751'

        // Hämta grundläggande lagdata
        const teamResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`)
        if (!teamResponse.ok) throw new Error('Kunde inte hämta lagdata')
        const teamData = await teamResponse.json()

        // Hämta bootstrap-data för spelare och lag
        const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
        if (!bootstrapResponse.ok) throw new Error('Kunde inte hämta spelardata')
        const bootstrapData = await bootstrapResponse.json()

        // Hämta fixtures-data
        const fixturesResponse = await fetch('https://fantasy.premierleague.com/api/fixtures/')
        if (!fixturesResponse.ok) throw new Error('Kunde inte hämta fixtures')
        const fixturesData = await fixturesResponse.json()

        // Bestäm vilken gameweek som ska användas
        type BootstrapEvent = {
            id: number
            is_current: boolean
            finished: boolean
        }

        const targetGameweek = gameweek
            ? parseInt(gameweek)
            : bootstrapData.events.find((event: BootstrapEvent) => event.is_current)?.id ||
            bootstrapData.events.findLast((event: BootstrapEvent) => event.finished)?.id

        // Hämta laguppställning för specifik gameweek
        const pickResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/event/${targetGameweek}/picks/`)
        if (!pickResponse.ok) throw new Error('Kunde inte hämta laguppställning')
        const pickData = await pickResponse.json()

        // Hämta live-poäng för gameweeken
        const liveResponse = await fetch(`https://fantasy.premierleague.com/api/event/${targetGameweek}/live/`)
        if (!liveResponse.ok) throw new Error('Kunde inte hämta live-poäng')
        const liveData = await liveResponse.json()

        // Hämta historik för hela säsongen
        const historyResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`)
        if (!historyResponse.ok) throw new Error('Kunde inte hämta historik')
        const historyData = await historyResponse.json()

        // Hitta data för den specifika gameweeken
        const gameweekHistory = historyData.current.find((gw: any) => gw.event === targetGameweek)

        // Beräkna total poäng fram till och med vald gameweek
        const totalPointsUntilGameweek = historyData.current
            .filter((gw: any) => gw.event <= targetGameweek)
            .reduce((total: number, gw: any) => total + gw.points, 0)

        // Matcha spelar-IDs med spelardata och live-poäng
        const players = pickData.picks.map((pick: any) => {
            const playerInfo = bootstrapData.elements.find((p: any) => p.id === pick.element)
            const liveStats = liveData.elements.find((e: any) => e.id === pick.element)
            const playerPoints = liveStats?.stats?.total_points || 0

            return {
                id: playerInfo.id,
                name: `${playerInfo.first_name} ${playerInfo.second_name}`,
                position: getPosition(playerInfo.element_type),
                team: bootstrapData.teams.find((t: any) => t.id === playerInfo.team).short_name,
                isCaptain: pick.is_captain,
                isViceCaptain: pick.is_vice_captain,
                multiplier: pick.multiplier,
                isOnBench: pick.multiplier === 0,
                pickPosition: pick.position,
                points: pick.multiplier * playerPoints,
                totalPoints: playerInfo.total_points || 0,
                selectedBy: playerInfo.selected_by_percent + '%',
                goals: playerInfo.goals_scored || 0,
                assists: playerInfo.assists || 0,
                pointsPerGame: parseFloat(playerInfo.points_per_game || 0).toFixed(1),
                form: parseFloat(playerInfo.form || 0).toFixed(1),
                cleanSheets: playerInfo.clean_sheets || 0
            }
        })

        // Sortera spelarna efter position
        players.sort((a: any, b: any) => a.pickPosition - b.pickPosition)

        // Matcha historik med genomsnittspoäng från bootstrap-data
        const history = historyData.current.map((gw: any) => {
            const eventData = bootstrapData.events.find((e: any) => e.id === gw.event)
            return {
                event: gw.event,
                points: gw.points,
                average_points: eventData?.average_entry_score || 0,
                highest_score: eventData?.highest_score || 0
            }
        })

        return NextResponse.json({
            ...teamData,
            players,
            gameweek: targetGameweek,
            gameweek_points: gameweekHistory?.points || 0,
            gameweek_rank: gameweekHistory?.rank || 0,
            total_points: totalPointsUntilGameweek,
            history: history,
            captainSuggestions: suggestCaptain(players, bootstrapData, fixturesData)
        })

    } catch (error) {
        console.error('FPL API Error:', error)
        return NextResponse.json(
            { error: 'Kunde inte hämta FPL data' },
            { status: 500 }
        )
    }
}

function getPosition(elementType: number): string {
    switch (elementType) {
        case 1: return 'MV'
        case 2: return 'FB'
        case 3: return 'MF'
        case 4: return 'FW'
        default: return ''
    }
} 