import React from "react"
import { Button } from "./ui/button"
import { Slider } from "@/components/ui/slider"
import type { ChordDisplayMode, KeyNotation } from "@/types/chord"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Menu01Icon,
  MetronomeIcon,
  PauseIcon,
  PlayIcon,
  RedoIcon,
  Setting07Icon,
} from "@hugeicons/core-free-icons"

interface ControlToolbarProps {
  capo: number
  onCapoChange: (newCapo: number) => void

  transpose: number
  onTransposeChange: (newTranspose: number) => void

  keyNotation: KeyNotation
  onToggleKeyNotation: () => void

  isPlaying: boolean
  onTogglePlay: () => void
  onResetPlayback: () => void

  currentTime: number
  duration: number
  onSeek: (time: number) => void

  bpm?: number
  bpmMultiplier?: number
  onChangeBpmMultiplier?: (mult: number) => void

  metronomeEnabled: boolean
  onToggleMetronome: () => void

  displayMode: ChordDisplayMode
  onChangeDisplayMode: (mode: ChordDisplayMode) => void

  fontSize: number
  onChangeFontSize: (size: number) => void

  originalKey?: string
  transposedKey: string
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  capo,
  onCapoChange,
  transpose,
  onTransposeChange,
  keyNotation,
  onToggleKeyNotation,
  isPlaying,
  onTogglePlay,
  onResetPlayback,
  currentTime,
  duration,
  onSeek,
  metronomeEnabled,
  onToggleMetronome,
  displayMode,
  onChangeDisplayMode,
  fontSize,
  onChangeFontSize,
  transposedKey,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const padS = s < 10 ? `0${s}` : `${s}`
    return `${m}:${padS}`
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant={isPlaying ? "outline" : "default"}
              onClick={onTogglePlay}
              className="h-8 w-8 rounded-full"
            >
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} />
              ) : (
                <HugeiconsIcon icon={PlayIcon} />
              )}
            </Button>

            <Button
              size="icon"
              variant="default"
              onClick={onResetPlayback}
              className="h-8 w-8 rounded-full"
              title="Reset ke awal"
            >
              <HugeiconsIcon icon={RedoIcon} />
            </Button>

            <Button
              size="icon"
              variant={metronomeEnabled ? "default" : "ghost"}
              onClick={onToggleMetronome}
              className="h-8 w-8 rounded-full"
              title="Metronome Beat Tick"
            >
              <HugeiconsIcon icon={MetronomeIcon} />
            </Button>

            <span className="min-w-16.25 font-mono text-[11px] text-zinc-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2 border bg-primary px-2.5 py-1">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-medium text-background">
                Capo
              </span>
              <button
                onClick={() => onCapoChange(Math.max(0, capo - 1))}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground"
              >
                -
              </button>
              <span className="px-1 font-mono text-xs font-semibold text-background">
                {capo}
              </span>
              <button
                onClick={() => onCapoChange(Math.min(11, capo + 1))}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                +
              </button>
            </div>

            <div className="h-3 w-px bg-zinc-800" />

            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-medium text-background">
                Nada
              </span>
              <button
                onClick={() => onTransposeChange(transpose - 1)}
                className="flex h-5 w-5 items-center justify-center text-muted-foreground"
              >
                -
              </button>
              <span className="px-1 font-mono text-xs font-semibold text-background">
                {transposedKey}{" "}
                {transpose !== 0 &&
                  `(${transpose > 0 ? `+${transpose}` : transpose})`}
              </span>
              <button
                onClick={() => onTransposeChange(transpose + 1)}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                +
              </button>

              <button
                onClick={onToggleKeyNotation}
                className="ml-1 rounded border border-zinc-800 bg-zinc-950 px-1 font-mono text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                {keyNotation === "sharp" ? "#" : "♭"}
              </button>
            </div>
          </div>

          <Button size="icon" className="rounded-full" variant="outline">
            <HugeiconsIcon icon={Setting07Icon} />
          </Button>

          {/* <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-0.5 rounded-lg border p-0.5 text-[11px]">
              <button
                onClick={() => onChangeDisplayMode("above")}
                className={`rounded px-2 py-0.5 font-medium transition-all ${
                  displayMode === "above"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Atas
              </button>
              <button
                onClick={() => onChangeDisplayMode("inline")}
                className={`rounded px-2 py-0.5 font-medium transition-all ${
                  displayMode === "inline"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Inline
              </button>
              <button
                onClick={() => onChangeDisplayMode("chords-only")}
                className={`rounded px-2 py-0.5 font-medium transition-all ${
                  displayMode === "chords-only"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Akor
              </button>
            </div>

            <div className="hidden items-center space-x-1 text-xs text-zinc-500 sm:flex">
              <button
                onClick={() => onChangeFontSize(Math.max(14, fontSize - 2))}
                className="px-1 hover:text-zinc-200"
              >
                A-
              </button>
              <span className="font-mono text-[10px] text-zinc-400">
                {fontSize}px
              </span>
              <button
                onClick={() => onChangeFontSize(Math.min(28, fontSize + 2))}
                className="px-1 hover:text-zinc-200"
              >
                A+
              </button>
            </div>
          </div> */}
        </div>

        <div className="w-full">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={(val) => onSeek(val[0])}
            className="h-1 w-full"
          />
        </div>
      </div>
    </div>
  )
}
