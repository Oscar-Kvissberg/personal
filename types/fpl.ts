export interface TeamData {
    name: string
    summary_overall_points: number
    summary_event_points: number
    summary_overall_rank: number
    summary_event_rank: number
    players: Player[]
    gameweek: number
}

export interface Player {
    id: number
    name: string
    position: string
    team: string
    isCaptain: boolean
    isViceCaptain: boolean
    multiplier: number
    isOnBench: boolean
} 