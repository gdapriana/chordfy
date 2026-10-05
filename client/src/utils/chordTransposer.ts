import type { KeyNotation } from "@/types/chord"

const SHARP_SCALE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]
const FLAT_SCALE = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
]

// Map note aliases to standardized semitone index (0 to 11)
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  DB: 1,
  D: 2,
  "D#": 3,
  EB: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  GB: 6,
  G: 7,
  "G#": 8,
  AB: 8,
  A: 9,
  "A#": 10,
  BB: 10,
  B: 11,
  Cb: 11,
  "B#": 0,
}

/**
 * Transpose a single note symbol (e.g., "C#", "Bb", "F") by a given number of semitones.
 */
export function transposeNote(
  note: string,
  semitones: number,
  notation: KeyNotation = "sharp"
): string {
  if (!note) return note

  const upperNote = note.toUpperCase()
  // const normalizedNote =
  //   upperNote.length > 1
  //     ? upperNote[0] + upperNote.slice(1).toLowerCase()
  //     : upperNote
  const lookupKey =
    upperNote.length > 1 ? upperNote[0] + upperNote[1] : upperNote[0]

  const currentSemitone = NOTE_TO_SEMITONE[lookupKey]
  if (currentSemitone === undefined) return note

  let targetIndex = (currentSemitone + semitones) % 12
  if (targetIndex < 0) targetIndex += 12

  const scale = notation === "flat" ? FLAT_SCALE : SHARP_SCALE
  return scale[targetIndex]
}

/**
 * Transpose a full chord string (e.g. "Am7", "C/G", "F#m7b5", "Bbadd9", "G/B") by semitones.
 */
export function transposeChord(
  chord: string,
  semitones: number,
  notation: KeyNotation = "sharp"
): string {
  if (!chord || semitones === 0) return chord

  // Check if it's a slash chord (e.g. C/G or Am7/G)
  if (chord.includes("/")) {
    const parts = chord.split("/")
    const mainChord = parts[0]
    const bassNote = parts[1]

    const transposedMain = transposeChord(mainChord, semitones, notation)
    const transposedBass = transposeNote(bassNote, semitones, notation)

    return `${transposedMain}/${transposedBass}`
  }

  // Regex to separate root note (A-G with optional # or b) from suffix (e.g., m7, maj7, sus4, dim)
  const match = chord.match(/^([A-G][b#]?)(.*)$/i)
  if (!match) return chord

  const rootNote = match[1]
  const suffix = match[2]

  const transposedRoot = transposeNote(rootNote, semitones, notation)
  return `${transposedRoot}${suffix}`
}

/**
 * Calculate the effective semitone shift combining Transpose Step and Capo.
 * For example:
 * - If user shifts key by +2 semitones -> semitones = +2
 * - If user puts Capo on fret 2 -> chords relative to capo are transposed by -2 semitones.
 */
export function calculateEffectiveSemitones(
  transposeSteps: number,
  capo: number
): number {
  return transposeSteps - capo
}

/**
 * Format key display name (e.g. "C", "F#", "Bb")
 */
export function getTransposedKey(
  originalKey: string,
  transposeSteps: number,
  notation: KeyNotation = "sharp"
): string {
  if (!originalKey) return "C"
  return transposeChord(originalKey, transposeSteps, notation)
}

/**
 * List of standard musical keys for picker dropdown
 */
export const ALL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
]
