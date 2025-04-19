'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

interface Song {
    id: string;
    title: string;
    startTime?: number;
}

const songs: Song[] = [
    { id: 'JaSewH9ikyI', title: 'Inferno T-Spawn Music', startTime: 1 },
    { id: 'sIWnz0x_pSQ', title: 'Black Ops 2 Lobby Music', startTime: 1 },
    { id: '2dPaeQTdhJM', title: 'Black Ops 1 Lobby Music', startTime: 5 },
    // Lägg till fler låtar här, exempel:
    // { id: 'annatYouTubeId', title: 'Mirage A-Site', startTime: 0 },
    // { id: 'tredjeLåtId', title: 'Dust2 Long', startTime: 150 },
]

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [currentSong, setCurrentSong] = useState(songs[0])
    const [selectedSong, setSelectedSong] = useState(songs[0])
    const [isPlayerReady, setIsPlayerReady] = useState(false)
    const playerRef = useRef<any>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: currentSong.id,
                playerVars: {
                    autoplay: 0,
                    start: currentSong.startTime || 0,
                    loop: 1,
                    playlist: currentSong.id,
                    playsinline: 1,
                    controls: 0,
                    mute: 1
                },
                events: {
                    onReady: (event: any) => {
                        console.log('Player ready')
                        setIsPlayerReady(true)
                        event.target.unMute()
                        event.target.setVolume(100)
                    },
                    onStateChange: (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            event.target.unMute()
                            setIsPlaying(true)
                        } else if (event.data === window.YT.PlayerState.PAUSED || 
                                 event.data === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false)
                        }
                    }
                }
            })
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    const togglePlay = async () => {
        if (playerRef.current && isPlayerReady) {
            try {
                if (isPlaying) {
                    await playerRef.current.pauseVideo()
                } else {
                    if (selectedSong.id !== currentSong.id) {
                        await playerRef.current.loadVideoById({
                            videoId: selectedSong.id,
                            startSeconds: selectedSong.startTime || 0
                        })
                        setCurrentSong(selectedSong)
                    }
                    await playerRef.current.unMute()
                    await playerRef.current.setVolume(100)
                    await playerRef.current.playVideo()
                }
            } catch (error) {
                console.error('Error toggling play state:', error)
            }
        }
    }

    const changeSong = async (song: Song) => {
        setSelectedSong(song)
        setIsDropdownOpen(false)
        
        if (playerRef.current && isPlayerReady) {
            try {
                await playerRef.current.cueVideoById({
                    videoId: song.id,
                    startSeconds: song.startTime || 0
                })
                await playerRef.current.unMute()
                await playerRef.current.setVolume(100)
                setCurrentSong(song)
                setIsPlaying(false)
            } catch (error) {
                console.error('Error changing song:', error)
            }
        }
    }

    return (
        <div className="fixed top-0 right-4 flex items-center gap-2 z-[51]">
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-10 flex items-center px-3 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-200 hover:text-white gap-2"
                >
                    <p className="text-sm">{selectedSong.title}</p>
                    <ChevronDownIcon className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-12 bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-200/20 py-1 min-w-[200px]">
                        {songs.map((song) => (
                            <button
                                key={song.id}
                                onClick={() => changeSong(song)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800/50 transition-colors ${
                                    selectedSong.id === song.id ? 'text-white' : 'text-gray-200'
                                }`}
                            >
                                {song.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={togglePlay}
                className="h-10 flex items-center p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-200 hover:text-white"
            >
                {isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                ) : (
                    <PlayIcon className="w-6 h-6" />
                )}
            </button>

            {/* YouTube Player Container */}
            <div id="youtube-player" style={{ display: 'none' }} />
        </div>
    )
}

export default MusicPlayer 