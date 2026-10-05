import { ChordTimelineBar } from "@/components/ChordTimelineBar"
import { ChordViewer } from "@/components/ChordViewer"
import { ControlToolbar } from "@/components/ControlToolbar"
import { SAMPLE_SONGS } from "@/data/sampleSongs"
import type {
  AlignedLine,
  ChordDisplayMode,
  KeyNotation,
  Song,
} from "@/types/chord"
import { metronome } from "@/utils/audioMetronome"
import {
  calculateEffectiveSemitones,
  getTransposedKey,
} from "@/utils/chordTransposer"
import { alignLyricsAndChords } from "@/utils/lrcParser"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [currentSong] = useState<Song>(SAMPLE_SONGS[0])
  const [capo, setCapo] = useState<number>(currentSong.capo || 0)
  const [transpose, setTranspose] = useState<number>(0)
  const [keyNotation, setKeyNotation] = useState<KeyNotation>("sharp")

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [bpmMultiplier, setBpmMultiplier] = useState<number>(1)
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false)

  const [displayMode, setDisplayMode] = useState<ChordDisplayMode>("above")
  const [fontSize, setFontSize] = useState<number>(20)

  const [, setIsSearchOpen] = useState<boolean>(false)
  const [, setSelectedChordForDiagram] = useState<string | null>(null)

  const [timeline, setTimeline] = useState<AlignedLine[]>([])

  useEffect(() => {
    const aligned = alignLyricsAndChords(
      currentSong.lyricsLrc,
      currentSong.chordsLrc
    )
    setTimeline(aligned)
    setCapo(currentSong.capo || 0)
    setTranspose(0)
    setCurrentTime(0)
    setIsPlaying(false)
  }, [currentSong])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const duration =
    timeline.length > 0 ? timeline[timeline.length - 1].time + 10 : 180

  const lastTimeRef = useRef<number>(Date.now())
  const beatCounterRef = useRef<number>(0)

  useEffect(() => {
    let animationFrameId: number

    const tick = () => {
      const now = Date.now()
      const delta = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      if (isPlaying) {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + delta * bpmMultiplier
          if (nextTime >= duration) {
            setIsPlaying(false)
            return 0
          }

          if (metronomeEnabled && currentSong.bpm) {
            const beatInterval = 60 / (currentSong.bpm * bpmMultiplier)
            const currentBeat = Math.floor(nextTime / beatInterval)
            if (currentBeat > beatCounterRef.current) {
              beatCounterRef.current = currentBeat
              const isAccent = currentBeat % 4 === 0
              metronome.playClick(isAccent)
            }
          }

          return nextTime
        })
        animationFrameId = requestAnimationFrame(tick)
      }
    }

    if (isPlaying) {
      lastTimeRef.current = Date.now()
      animationFrameId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying, duration, bpmMultiplier, metronomeEnabled, currentSong.bpm])

  const effectiveSemitones = calculateEffectiveSemitones(transpose, capo)
  const transposedKeyName = getTransposedKey(
    currentSong.originalKey,
    transpose,
    keyNotation
  )
  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="z-10 shrink-0 border-b bg-background shadow-xs">
        <ControlToolbar
          capo={capo}
          onCapoChange={setCapo}
          transpose={transpose}
          onTransposeChange={setTranspose}
          keyNotation={keyNotation}
          onToggleKeyNotation={() =>
            setKeyNotation((prev) => (prev === "sharp" ? "flat" : "sharp"))
          }
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onResetPlayback={() => setCurrentTime(0)}
          currentTime={currentTime}
          duration={duration}
          onSeek={(time) => setCurrentTime(time)}
          bpm={currentSong.bpm}
          bpmMultiplier={bpmMultiplier}
          onChangeBpmMultiplier={setBpmMultiplier}
          metronomeEnabled={metronomeEnabled}
          onToggleMetronome={() => setMetronomeEnabled(!metronomeEnabled)}
          displayMode={displayMode}
          onChangeDisplayMode={setDisplayMode}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          originalKey={currentSong.originalKey}
          transposedKey={transposedKeyName}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChordViewer
          timeline={timeline}
          currentTime={currentTime}
          effectiveSemitones={effectiveSemitones}
          keyNotation={keyNotation}
          displayMode={displayMode}
          fontSize={fontSize}
          onLineClick={(time) => {
            setCurrentTime(time)
            setIsPlaying(true)
          }}
          onChordClick={(chord) => setSelectedChordForDiagram(chord)}
        />
      </div>
      <div className="z-10 shrink-0 border-t">
        <ChordTimelineBar
          timeline={timeline}
          currentTime={currentTime}
          effectiveSemitones={effectiveSemitones}
          keyNotation={keyNotation}
          isPlaying={isPlaying}
          onSeek={(time) => {
            setCurrentTime(time)
            setIsPlaying(true)
          }}
          onChordClick={(chord) => setSelectedChordForDiagram(chord)}
        />
      </div>
    </main>
  )
}
