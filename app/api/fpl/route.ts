import { NextRequest, NextResponse } from 'next/server'
import { Player, BootstrapData, Fixture, CaptainSuggestion } from '@/app/types'

// Hjälpfunktion för att göra API-anrop via proxy
async function fetchWithProxy(url: string) {
    try {
        // Testa först utan proxy
        const directResponse = await fetch(url, {
            signal: AbortSignal.timeout(5000)
        })

        if (directResponse.ok) {
            return directResponse.json()
        }

        // Om direkt anrop misslyckas, prova med proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
        const response = await fetch(proxyUrl)

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
        }

        return response.json()
    } catch (error) {
        console.error('Fetch error:', error)
        throw error
    }
}

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
        const requestedGameweek = searchParams.get('gameweek')
        const teamId = process.env.FPL_TEAM_ID || '2222751'

        // Hämta bootstrap data direkt
        const bootstrapData = await fetchWithProxy(
            'https://fantasy.premierleague.com/api/bootstrap-static/'
        )

        // Hitta den senaste färdigspelade gameweek
        const lastFinishedGameweek = bootstrapData.events
            .filter((event: any) => event.finished)
            .sort((a: any, b: any) => b.id - a.id)[0]

        if (!lastFinishedGameweek) {
            return NextResponse.json(
                {
                    error: 'Kunde inte hitta någon färdigspelad gameweek.',
                    details: 'Säsongen 2024/25 har inte börjat än. Försök igen när säsongen startar.'
                },
                { status: 503 }
            )
        }

        // Använd antingen den begärda gameweek (om den är färdigspelad) eller den senaste färdigspelade
        const targetGameweek = requestedGameweek
            ? parseInt(requestedGameweek)
            : lastFinishedGameweek.id

        // Verifiera att den valda gameweek är färdigspelad
        const isGameweekFinished = bootstrapData.events
            .find((event: any) => event.id === targetGameweek)?.finished

        if (!isGameweekFinished) {
            return NextResponse.json(
                {
                    error: 'Den valda gameweek har inte spelats f��rdigt än.',
                    details: `Senaste färdigspelade gameweek är ${lastFinishedGameweek.id}`
                },
                { status: 400 }
            )
        }

        // Fortsätt med resten av koden...
        const teamData = await fetchWithProxy(
            `https://fantasy.premierleague.com/api/entry/${teamId}/`
        )

        const fixturesData = await fetchWithProxy(
            'https://fantasy.premierleague.com/api/fixtures/'
        )

        // Hämta laguppställning för specifik gameweek
        const pickData = await fetchWithProxy(
            `https://fantasy.premierleague.com/api/entry/${teamId}/event/${targetGameweek}/picks/`
        )

        // Hämta live-poäng för gameweeken
        const liveData = await fetchWithProxy(
            `https://fantasy.premierleague.com/api/event/${targetGameweek}/live/`
        )

        // Hämta historik för hela säsongen
        const historyData = await fetchWithProxy(
            `https://fantasy.premierleague.com/api/entry/${teamId}/history/`
        )

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
            {
                error: 'Kunde inte hämta FPL data.',
                details: error instanceof Error ? error.message : 'Okänt fel'
            },
            { status: 503 }
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