import { useRef, useCallback } from 'react'

// ── YouTube IFrame API types ──────────────────────────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayerOptions {
  height: string
  width: string
  videoId: string
  playerVars?: Record<string, number>
  events?: {
    onReady?: (e: { target: YTPlayer }) => void
    onStateChange?: (e: { data: number }) => void
    onError?: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  stopVideo(): void
  setVolume(vol: number): void
  destroy(): void
}

// ── Sound mode type ───────────────────────────────────────────────────────────

export type SoundMode = 'restaurant' | 'rain' | 'nature'

export interface SoundOption {
  id: SoundMode
  label: string
  emoji: string
  videoId: string
  description: string
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    emoji: '☕',
    videoId: '4EBL7EtwauY',
    description: 'Warm café chatter & clinking cups.',
  },
  {
    id: 'rain',
    label: 'Rain',
    emoji: '🌧️',
    videoId: 'y4h_4NIOxuY',
    description: 'Steady rainfall with distant thunder.',
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🌲',
    videoId: 'xuu1pBvCkz0',
    description: 'Birdsong, rustling leaves, and flowing water.',
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error'

export interface UseAudioReturn {
  play: (mode: SoundMode) => Promise<void>
  stop: () => void
  statusRef: React.MutableRefObject<AudioStatus>
}

// ── YT IFrame API singleton loader ────────────────────────────────────────────

let ytApiReady = false
let ytApiLoading = false
const ytReadyCallbacks: Array<() => void> = []

function loadYTApi(): Promise<void> {
  return new Promise(resolve => {
    if (ytApiReady) { resolve(); return }
    ytReadyCallbacks.push(resolve)
    if (ytApiLoading) return
    ytApiLoading = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true
      ytReadyCallbacks.forEach(cb => cb())
      ytReadyCallbacks.length = 0
    }
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudio(): UseAudioReturn {
  const playerRef    = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const statusRef    = useRef<AudioStatus>('idle')

  const stop = useCallback(() => {
    try { playerRef.current?.stopVideo() } catch (_) {}
    try { playerRef.current?.destroy()   } catch (_) {}
    playerRef.current = null
    if (containerRef.current) {
      containerRef.current.remove()
      containerRef.current = null
    }
    statusRef.current = 'idle'
  }, [])

  const play = useCallback(async (mode: SoundMode) => {
    stop()
    statusRef.current = 'loading'

    const option = SOUND_OPTIONS.find(o => o.id === mode)!

    // Hidden container div — YouTube IFrame API needs a real DOM node
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;'
    document.body.appendChild(container)
    containerRef.current = container

    try {
      await loadYTApi()

      // Guard: stop() may have been called while awaiting the API
      if (containerRef.current !== container) return

      playerRef.current = new window.YT.Player(container, {
        height: '1',
        width: '1',
        videoId: option.videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(65)
            e.target.playVideo()
            statusRef.current = 'playing'
          },
          onStateChange: (e) => {
            // YT.PlayerState.ENDED === 0 — loop the video
            if (e.data === 0) playerRef.current?.playVideo()
          },
          onError: () => {
            statusRef.current = 'error'
          },
        },
      })
    } catch (err) {
      console.error('[useAudio] YouTube player error:', err)
      statusRef.current = 'error'
    }
  }, [stop])

  return { play, stop, statusRef }
}

