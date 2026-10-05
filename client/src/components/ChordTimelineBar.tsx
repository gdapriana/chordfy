import React, { useEffect, useRef } from "react"
import type { AlignedLine, KeyNotation } from "@/types/chord"
import { transposeChord } from "../utils/chordTransposer"
import { getGuitarChordDiagram } from "../utils/chordDiagrams"
import { cn } from "cn"

interface ChordTimelineBarProps {
  timeline: AlignedLine[]
  currentTime: number
  effectiveSemitones: number
  keyNotation: KeyNotation
  isPlaying?: boolean
  onSeek: (time: number) => void
  onChordClick: (chord: string) => void
}

export interface UniqueChordEvent {
  id: string
  time: number
  endTime: number
  chord: string
  transposedChord: string
}

export const ChordTimelineBar: React.FC<ChordTimelineBarProps> = ({
  timeline,
  currentTime,
  effectiveSemitones,
  keyNotation,
  onSeek,
  onChordClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Flatten all timestamped chord events into a chronological list
  const chordEvents: UniqueChordEvent[] = []
  let eventCounter = 0

  for (let i = 0; i < timeline.length; i++) {
    const line = timeline[i]
    const nextLine = timeline[i + 1]
    const lineEndTime =
      line.endTime || (nextLine ? nextLine.time : line.time + 8)

    for (let c = 0; c < line.chords.length; c++) {
      const ch = line.chords[c]
      const eventTime = ch.time !== undefined ? ch.time : line.time

      const nextChord = line.chords[c + 1]
      const chordEndTime =
        nextChord && nextChord.time !== undefined ? nextChord.time : lineEndTime

      const transposed = transposeChord(
        ch.chord,
        effectiveSemitones,
        keyNotation
      )

      chordEvents.push({
        id: `chord-timeline-ev-${eventCounter++}`,
        time: eventTime,
        endTime: chordEndTime,
        chord: ch.chord,
        transposedChord: transposed,
      })
    }
  }

  // Find active chord index based on currentTime
  let activeIndex = -1
  for (let i = chordEvents.length - 1; i >= 0; i--) {
    if (currentTime >= chordEvents[i].time) {
      activeIndex = i
      break
    }
  }

  // Auto-scroll active card horizontally into center view
  useEffect(() => {
    if (activeIndex >= 0 && chordEvents[activeIndex]) {
      const activeCardEl = cardRefs.current[chordEvents[activeIndex].id]
      if (activeCardEl) {
        activeCardEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [activeIndex, chordEvents])

  return (
    <div className="flex h-full w-full flex-col justify-between select-none">
      <div
        ref={containerRef}
        className="flex h-full snap-x scrollbar-none items-stretch overflow-x-auto px-0 py-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {chordEvents.length === 0 ? (
          <div className="mx-auto py-6 text-xs text-zinc-500 italic">
            Tidak ada data akor pada lagu ini
          </div>
        ) : (
          chordEvents.map((ev, index) => {
            const isActive = index === activeIndex
            const isUpcoming = index > activeIndex

            const chordData = getGuitarChordDiagram(ev.transposedChord)
            const { frets, fingers, barre } = chordData

            const maxFret = Math.max(...frets.filter((f) => f > 0))
            const minPositiveFret = Math.min(
              ...frets.filter((f) => f > 0).concat([1])
            )
            const startFret = maxFret > 4 ? minPositiveFret : 1
            const numFrets = 4

            return (
              <div
                key={ev.id}
                ref={(el) => {
                  cardRefs.current[ev.id] = el
                }}
                onClick={() => {
                  onSeek(ev.time)
                  onChordClick(ev.transposedChord)
                }}
                className={cn(
                  "flex h-full shrink-0 cursor-pointer snap-center flex-col items-center justify-center border-r border-foreground/20 px-6 py-3 transition-all duration-200 first:border-l",
                  isActive
                    ? "z-10 bg-foreground/10 opacity-100"
                    : isUpcoming
                      ? "opacity-75 hover:opacity-100 hover:bg-foreground/5"
                      : "opacity-45 hover:opacity-80 hover:bg-foreground/5"
                )}
              >
                <div className="mb-1.5 font-mono text-lg font-black tracking-wide text-foreground">
                  {ev.transposedChord}
                </div>

                <div className={cn(
                  "flex flex-col items-center p-3 transition-all",
                  isActive
                    ? "bg-foreground/10"
                    : "bg-transparent"
                )}>
                  <div className="mb-1 flex w-36 justify-between px-2 font-mono text-xs font-bold text-foreground">
                    {frets.map((fret, i) => (
                      <span
                        key={i}
                        className="text-foreground"
                      >
                        {fret === -1 ? "✕" : fret === 0 ? "○" : ""}
                      </span>
                    ))}
                  </div>

                  <svg
                    width="144"
                    height="130"
                    viewBox="0 0 144 130"
                    className="overflow-visible text-foreground"
                  >
                    {startFret === 1 ? (
                      <line
                        x1="12"
                        y1="8"
                        x2="132"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="square"
                      />
                    ) : (
                      <text
                        x="1"
                        y="16"
                        fill="currentColor"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {startFret}fr
                      </text>
                    )}

                    {Array.from({ length: numFrets + 1 }).map((_, fIndex) => {
                      const y = 8 + fIndex * 28
                      return (
                        <line
                          key={fIndex}
                          x1="12"
                          y1={y}
                          x2="132"
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.35"
                          strokeWidth={
                            fIndex === 0 && startFret === 1 ? "4" : "1.2"
                          }
                        />
                      )
                    })}

                    {Array.from({ length: 6 }).map((_, sIndex) => {
                      const x = 12 + sIndex * 24
                      return (
                        <line
                          key={sIndex}
                          x1={x}
                          y1="8"
                          x2={x}
                          y2={8 + numFrets * 28}
                          stroke="currentColor"
                          strokeOpacity="0.55"
                          strokeWidth={1 + (5 - sIndex) * 0.2}
                        />
                      )
                    })}

                    {barre && (
                      <rect
                        x={12 + (6 - barre.fromString) * 24 - 6}
                        y={8 + (barre.fret - startFret + 0.5) * 28 - 8}
                        width={(barre.fromString - barre.toString) * 24 + 12}
                        height="16"
                        rx="0"
                        fill="currentColor"
                      />
                    )}

                    {frets.map((fretVal, stringIdx) => {
                      if (fretVal <= 0) return null
                      const relativeFret = fretVal - startFret + 1
                      if (relativeFret < 1 || relativeFret > numFrets)
                        return null

                      const cx = 12 + stringIdx * 24
                      const cy = 8 + (relativeFret - 0.5) * 28

                      return (
                        <g key={stringIdx}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r="8.5"
                            fill="currentColor"
                          />
                          {fingers && fingers[stringIdx] > 0 && (
                            <text
                              x={cx}
                              y={cy + 3.5}
                              fill="var(--color-background, #000)"
                              fontSize="9.5"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {fingers[stringIdx]}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
