import type { LrcLine, AlignedLine, ChordPosition } from "@/types/chord"

interface ExtractedMetadata {
  title?: string
  artist?: string
  bpm?: number
  capo?: number
  originalKey?: string
}

/**
 * Extract metadata tags from LRC headers ([ti:...], [ar:...], [bpm:...], [capo:...], [key:...])
 */
export function extractMetadata(lrcContent: string): ExtractedMetadata {
  const metadata: ExtractedMetadata = {}
  const lines = lrcContent.split("\n")

  for (const line of lines) {
    const clean = line.trim()
    const tiMatch = clean.match(/^\[ti:(.+)\]$/i)
    if (tiMatch) metadata.title = tiMatch[1].trim()

    const arMatch = clean.match(/^\[ar:(.+)\]$/i)
    if (arMatch) metadata.artist = arMatch[1].trim()

    const bpmMatch = clean.match(/^\[bpm:(\d+)\]$/i)
    if (bpmMatch) metadata.bpm = parseInt(bpmMatch[1], 10)

    const capoMatch = clean.match(/^\[capo:(\d+)\]$/i)
    if (capoMatch) metadata.capo = parseInt(capoMatch[1], 10)

    const keyMatch = clean.match(/^\[key:(.+)\]$/i)
    if (keyMatch) metadata.originalKey = keyMatch[1].trim()
  }

  return metadata
}

/**
 * Parse standard LRC text into an array of timestamped lines
 */
export function parseLrc(lrcContent: string): LrcLine[] {
  if (!lrcContent) return []

  const result: LrcLine[] = []
  const lines = lrcContent.split("\n")

  // Regex for LRC timestamp: [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
  const timestampRegex = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (!trimmed) continue

    timestampRegex.lastIndex = 0
    const matches = Array.from(trimmed.matchAll(timestampRegex))

    if (matches.length > 0) {
      const textContent = trimmed.replace(timestampRegex, "").trim()

      for (const match of matches) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        const msRaw = match[3] || "0"

        const msFraction =
          msRaw.length === 3
            ? parseInt(msRaw, 10) / 1000
            : parseInt(msRaw, 10) / 100
        const totalTime = minutes * 60 + seconds + msFraction

        result.push({
          time: totalTime,
          text: textContent,
        })
      }
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

/**
 * Extract chord symbols from a text string along with character index
 */
export function parseChordLinePositions(
  chordLineStr: string,
  baseTime?: number
): ChordPosition[] {
  if (!chordLineStr) return []

  const positions: ChordPosition[] = []
  const regex = /([A-G][b#]?(?:m|maj|min|dim|aug|sus|add|\d|\/[A-G][b#]?)*)/g

  let match
  while ((match = regex.exec(chordLineStr)) !== null) {
    positions.push({
      chord: match[1],
      charIndex: match.index,
      time: baseTime,
    })
  }

  return positions
}

interface RawChordEvent {
  time: number
  chord: string
  charIndex: number
}

/**
 * Parse all chord events from Chord LRC (supports per-chord timestamping format e.g. [00:02.00] G)
 */
export function parseAllChordEvents(chordsLrcText: string): RawChordEvent[] {
  const parsedChordsLrc = parseLrc(chordsLrcText)
  const events: RawChordEvent[] = []

  for (const item of parsedChordsLrc) {
    const positions = parseChordLinePositions(item.text, item.time)
    for (const pos of positions) {
      events.push({
        time: item.time,
        chord: pos.chord,
        charIndex: pos.charIndex,
      })
    }
  }

  return events.sort((a, b) => a.time - b.time)
}

/**
 * Synchronize Lyrics LRC with Chord LRC.
 * Handles both per-line chord LRC and per-chord-change timestamped LRC (e.g., [00:02.00] G).
 */
export function alignLyricsAndChords(
  lyricsLrcText: string,
  chordsLrcText: string
): AlignedLine[] {
  const parsedLyrics = parseLrc(lyricsLrcText)
  const chordEvents = parseAllChordEvents(chordsLrcText)

  if (parsedLyrics.length === 0 && chordEvents.length === 0) {
    return []
  }

  // If there are no lyrics, render pure chord timeline
  if (parsedLyrics.length === 0) {
    return chordEvents.map((ev, idx) => ({
      id: `chord-event-${idx}-${ev.time}`,
      time: ev.time,
      lyrics: "",
      chords: [{ chord: ev.chord, charIndex: 0, time: ev.time }],
      rawChordLine: ev.chord,
    }))
  }

  const timeline: AlignedLine[] = []
  const usedChordIndices = new Set<number>()

  // Process lyric lines and group chord events occurring within each line's time window
  for (let i = 0; i < parsedLyrics.length; i++) {
    const lyricLine = parsedLyrics[i]
    const nextLyricLine = parsedLyrics[i + 1]

    // Line time window: from lyricLine.time until nextLyricLine.time (or +8s for last line)
    const windowStart = lyricLine.time - 0.5 // slight tolerance for early chord changes
    const windowEnd = nextLyricLine
      ? nextLyricLine.time - 0.01
      : lyricLine.time + 10
    const lineDuration = Math.max(
      2,
      (nextLyricLine ? nextLyricLine.time : lyricLine.time + 6) - lyricLine.time
    )

    const lineChords: ChordPosition[] = []

    for (let j = 0; j < chordEvents.length; j++) {
      if (usedChordIndices.has(j)) continue
      const ev = chordEvents[j]

      if (ev.time >= windowStart && ev.time < windowEnd) {
        usedChordIndices.add(j)

        // Calculate relative char index on lyric string based on timestamp fraction
        const timeOffset = Math.max(0, ev.time - lyricLine.time)
        const ratio = Math.min(1, timeOffset / lineDuration)
        const calculatedCharIdx =
          lyricLine.text.length > 0
            ? Math.floor(ratio * lyricLine.text.length)
            : ev.charIndex

        lineChords.push({
          chord: ev.chord,
          charIndex: calculatedCharIdx,
          time: ev.time,
        })
      }
    }

    // Sort line chords chronologically
    lineChords.sort((a, b) => (a.time || 0) - (b.time || 0))

    timeline.push({
      id: `line-${i}-${lyricLine.time}`,
      time: lyricLine.time,
      endTime: nextLyricLine ? nextLyricLine.time : lyricLine.time + 10,
      lyrics: lyricLine.text,
      chords: lineChords,
      rawChordLine: lineChords.map((c) => c.chord).join("   "),
    })
  }

  // Group unused chord events (e.g. Intro / Instrumental before first lyric line or Outro)
  const remainingEvents = chordEvents.filter(
    (_, idx) => !usedChordIndices.has(idx)
  )

  if (remainingEvents.length > 0) {
    // Group remaining events by close timestamps or intro section
    let currentGroup: ChordPosition[] = []
    let groupTime = remainingEvents[0].time

    for (let k = 0; k < remainingEvents.length; k++) {
      const ev = remainingEvents[k]

      if (currentGroup.length === 0 || ev.time - groupTime < 4) {
        currentGroup.push({
          chord: ev.chord,
          charIndex: currentGroup.length * 4,
          time: ev.time,
        })
      } else {
        timeline.push({
          id: `instrumental-${groupTime}`,
          time: groupTime,
          lyrics: "",
          chords: currentGroup,
          rawChordLine: currentGroup.map((c) => c.chord).join("   "),
        })
        currentGroup = [{ chord: ev.chord, charIndex: 0, time: ev.time }]
        groupTime = ev.time
      }
    }

    if (currentGroup.length > 0) {
      timeline.push({
        id: `instrumental-${groupTime}`,
        time: groupTime,
        lyrics: "",
        chords: currentGroup,
        rawChordLine: currentGroup.map((c) => c.chord).join("   "),
      })
    }
  }

  // Sort timeline chronologically
  return timeline.sort((a, b) => a.time - b.time)
}
