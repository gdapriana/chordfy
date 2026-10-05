export interface LrcLine {
  time: number
  text: string
}

export interface ChordPosition {
  chord: string
  charIndex: number
  time?: number
}

export interface AlignedLine {
  id: string
  time: number
  endTime?: number
  lyrics: string
  chords: ChordPosition[]
  rawChordLine: string
}

export interface Song {
  id: string
  title: string
  artist: string
  bpm: number
  capo: number
  originalKey: string
  lyricsLrc: string
  chordsLrc: string
  custom?: boolean
}

export type ChordDisplayMode =
  "above" | "inline" | "chords-only" | "lyrics-only"

export type KeyNotation = "sharp" | "flat"
