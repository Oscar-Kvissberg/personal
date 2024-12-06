interface TeamData {
    name: string
    gameweek: number
    summary_overall_points: number
    summary_event_points: number
    summary_overall_rank: number
    summary_event_rank: number
    gameweek_points: number
    gameweek_rank: number
    total_points: number
    history: any[]
    captainSuggestions: CaptainSuggestion[]
    players: Player[]
}

interface Player {
    id: number
    name: string
    position: string
    team: string
    isCaptain: boolean
    isViceCaptain: boolean
    multiplier: number
    isOnBench: boolean
    pickPosition: number
    points: number
    totalPoints: number
    selectedBy: string
    goals: number
    assists: number
    pointsPerGame: string
    form: string
    cleanSheets: number
    totalScore?: number
}

interface Fixture {
    event: number
    team_h: number
    team_a: number
    team_h_difficulty: number
    team_a_difficulty: number
}

interface BootstrapData {
    events: Array<{
        id: number
        is_current: boolean
        finished: boolean
        average_entry_score: number
        highest_score: number
    }>
    elements: Array<{
        id: number
        first_name: string
        second_name: string
        element_type: number
        team: number
        total_points: number
        selected_by_percent: string
        goals_scored: number
        assists: number
        points_per_game: string
        form: string
        clean_sheets: number
    }>
    teams: Array<{
        id: number
        short_name: string
    }>
}

interface CaptainSuggestion {
    name: string
    form: number
    pointsPerGame: number
    totalPoints: number
    selectedBy: string
    goals: number
    assists: number
    cleanSheets: number
    difficulty: number
    nextOpponent: string
    isHome: boolean
    totalScore: number
}

export type {
    TeamData,
    Player,
    Fixture,
    BootstrapData,
    CaptainSuggestion
} 