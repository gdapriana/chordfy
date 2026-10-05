import React, { useEffect, useRef } from "react"
import type { AlignedLine, ChordDisplayMode, KeyNotation } from "@/types/chord"
import { transposeChord } from "../utils/chordTransposer"
import { Button } from "@/components/ui/button"

interface ChordViewerProps {
  timeline: AlignedLine[]
  currentTime: number
  effectiveSemitones: number
  keyNotation: KeyNotation
  displayMode: ChordDisplayMode
  fontSize: number
  onLineClick: (timestamp: number) => void
  onChordClick: (chord: string) => void
}

export const ChordViewer: React.FC<ChordViewerProps> = ({
  timeline,
  currentTime,
  effectiveSemitones,
  keyNotation,
  displayMode,
  fontSize,
  onLineClick,
  onChordClick,
}) => {
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})

  let activeIndex = -1
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (currentTime >= timeline[i].time) {
      activeIndex = i
      break
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && timeline[activeIndex]) {
      const activeEl = lineRefs.current[timeline[activeIndex].id]
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [activeIndex, timeline])

  const getTransposedChord = (chord: string) => {
    return transposeChord(chord, effectiveSemitones, keyNotation)
  }

  const isChordActive = (line: AlignedLine, chordIdx: number) => {
    const currentChordTime = line.chords[chordIdx]?.time
    if (currentChordTime === undefined) return false

    const nextChordTime =
      line.chords[chordIdx + 1]?.time || line.endTime || line.time + 10
    return currentTime >= currentChordTime && currentTime < nextChordTime
  }

  const renderChordsAboveLyrics = (line: AlignedLine) => {
    const { lyrics, chords } = line

    if (!lyrics && chords.length > 0) {
      return (
        <div className="flex items-center space-x-2 py-0.5">
          <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
            [Musik / Intro]
          </span>
          <div className="font-mono-chord flex flex-wrap gap-2 font-bold">
            {chords.map((cp, idx) => {
              const active = isChordActive(line, idx)
              return (
                <Button
                  size={"lg"}
                  key={idx}
                  variant={active ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChordClick(getTransposedChord(cp.chord))
                  }}
                  className={`cursor-pointer border px-4 py-0.5`}
                >
                  {getTransposedChord(cp.chord)}
                </Button>
              )
            })}
          </div>
        </div>
      )
    }

    if (chords.length === 0) return null

    const sortedChords = [...chords].sort((a, b) => a.charIndex - b.charIndex)

    return (
      <div className="font-mono-chord mb-1 overflow-x-auto leading-none select-none">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 font-semibold">
          {sortedChords.map((cp, idx) => {
            const transposed = getTransposedChord(cp.chord)
            const active = isChordActive(line, idx)

            return (
              <Button
                size="lg"
                key={idx}
                variant={active ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  onChordClick(transposed)
                }}
                className={`cursor-pointer px-4 py-0.5 text-base transition-all`}
              >
                {transposed}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderInline = (line: AlignedLine) => {
    const { lyrics, chords } = line
    if (chords.length === 0) return <p className="text-primary">{lyrics}</p>

    return (
      <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
        {chords.map((cp, idx) => {
          const active = isChordActive(line, idx)
          return (
            <Button
              key={idx}
              variant={active ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation()
                onChordClick(getTransposedChord(cp.chord))
              }}
              className={`cursor-pointer px-4 py-0.5 text-base transition-all`}
            >
              [{getTransposedChord(cp.chord)}]
            </Button>
          )
        })}
        <span className="ml-1 text-primary">{lyrics}</span>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-xs text-primary">
        <p className="font-medium text-primary">
          Belum ada lirik atau akor yang dimuat.
        </p>
        <p className="mt-1 text-zinc-600">
          Pilih lagu atau buat baru dengan 2 file LRC.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full" style={{ fontSize: `${fontSize}px` }}>
      {timeline.map((line, index) => {
        const isActive = index === activeIndex

        return (
          <div
            key={line.id}
            ref={(el) => {
              lineRefs.current[line.id] = el
            }}
            onClick={() => onLineClick(line.time)}
            className={`group relative cursor-pointer p-8 transition-all ${
              isActive
                ? "border-l-2 border-zinc-100 bg-secondary/50 pl-4"
                : "border-l-2 border-transparent pl-4 hover:bg-secondary/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-grow flex-col items-center justify-center space-y-1">
                {displayMode === "above" && renderChordsAboveLyrics(line)}
                {displayMode === "inline" && renderInline(line)}

                {displayMode !== "chords-only" && displayMode !== "inline" && (
                  <p
                    className={`font-sans text-base leading-relaxed transition-colors ${
                      isActive
                        ? "font-medium text-primary"
                        : "text-primary group-hover:text-primary"
                    }`}
                  >
                    {line.lyrics || (
                      <span className="text-xs text-primary italic">
                        (Musik)
                      </span>
                    )}
                  </p>
                )}

                {displayMode === "chords-only" && (
                  <div className="font-mono-chord flex flex-wrap gap-2 font-semibold">
                    {line.chords.map((cp, idx) => {
                      const active = isChordActive(line, idx)
                      return (
                        <Button
                          size="lg"
                          key={idx}
                          variant={active ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation()
                            onChordClick(getTransposedChord(cp.chord))
                          }}
                          className={`cursor-pointer border px-4 py-0.5 text-base`}
                        >
                          {getTransposedChord(cp.chord)}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="absolute top-0 right-4 flex shrink-0 items-center space-x-1.5 pt-1 pl-3 select-none">
                <span className="font-mono text-[10px] text-zinc-600 transition-colors group-hover:text-primary">
                  {Math.floor(line.time / 60)}:
                  {Math.floor(line.time % 60) < 10
                    ? `0${Math.floor(line.time % 60)}`
                    : Math.floor(line.time % 60)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
