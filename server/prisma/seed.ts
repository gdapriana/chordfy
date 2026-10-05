import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 75.5 -> "01:15.50" */
function ts(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

type Line = [time: number, text: string];

interface LrcOptions {
  title: string;
  artist: string;
  bpm: number;
  key: string;
  lines: Line[];
  progression: string[];
  intro?: boolean;
}

/** Bangun lyricsLrc, chordsLrc, dan rawContent dari baris lirik + progresi chord. */
function buildLrc(o: LrcOptions) {
  const header = [
    `[ti:${o.title}]`,
    `[ar:${o.artist}]`,
    `[bpm:${o.bpm}]`,
    `[key:${o.key}]`
  ];
  const n = o.progression.length;

  const lyrics = [...header];
  const chords: string[] = [];
  const raw: string[] = [];

  if (o.intro) {
    lyrics.push(`[${ts(0)}](Intro Instrumental)`);
    o.progression.forEach((c, i) => chords.push(`[${ts(i * 3.5)}]${c}`));
    raw.push("(Intro)", o.progression.join("  "), "");
  }

  o.lines.forEach(([t, text], i) => {
    const next = o.lines[i + 1]?.[0] ?? t + 4.3;
    const gap = Math.min(next - t, 4.5);
    const c1 = o.progression[(i * 2) % n];
    const c2 = o.progression[(i * 2 + 1) % n];

    lyrics.push(`[${ts(t)}]${text}`);
    chords.push(`[${ts(t)}]${c1}`, `[${ts(t + gap / 2)}]${c2}`);
    raw.push(`${c1}   ${c2}`, text, "");
  });

  return {
    lyricsLrc: lyrics.join("\n"),
    chordsLrc: chords.join("\n"),
    rawContent: raw.join("\n").trim()
  };
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const artists = [
  {
    name: "Peterpan",
    slug: "peterpan",
    bio: "Band pop Indonesia asal Bandung yang populer di awal 2000-an.",
    imageUrl: null,
    verified: true
  },
  {
    name: "Senja Akustik",
    slug: "senja-akustik",
    bio: "Artis contoh (dummy) untuk keperluan development.",
    imageUrl: null,
    verified: false
  },
  {
    name: "Laras Bayu",
    slug: "laras-bayu",
    bio: "Artis contoh (dummy) untuk keperluan development.",
    imageUrl: null,
    verified: false
  }
];

const genres = [
  { name: "Pop", slug: "pop" },
  { name: "Rock", slug: "rock" },
  { name: "Akustik", slug: "akustik" },
  { name: "Balada", slug: "balada" },
  { name: "Indie", slug: "indie" }
];

/**
 * frets   : 6 senar (E A D G B e). -1 = tidak dimainkan, 0 = senar terbuka
 * fingers : 0 = tanpa jari, 1 = telunjuk, 2 = tengah, 3 = manis, 4 = kelingking
 * barre   : { fret, fromString, toString } (senar 1 = E rendah, 6 = e tinggi)
 */
const chords = [
  {
    name: "C",
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    barre: null
  },
  {
    name: "D",
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    barre: null
  },
  {
    name: "E",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    barre: null
  },
  {
    name: "G",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    barre: null
  },
  {
    name: "A",
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    barre: null
  },
  {
    name: "Am",
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    barre: null
  },
  {
    name: "Dm",
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    barre: null
  },
  {
    name: "Em",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    barre: null
  },
  {
    name: "G7",
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    barre: null
  },
  {
    name: "Fmaj7",
    frets: [-1, -1, 3, 2, 1, 0],
    fingers: [0, 0, 3, 2, 1, 0],
    barre: null
  },
  {
    name: "F",
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 1, fromString: 1, toString: 6 }
  },
  {
    name: "Bm",
    frets: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 2, fromString: 2, toString: 6 }
  },
  {
    name: "Bb",
    frets: [-1, 1, 3, 3, 3, 1],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 1, fromString: 2, toString: 6 }
  }
];

// Lagu 1: persis seperti contoh format dari kamu
const song1Lyrics = `[ti:Menghapus Jejakmu]
[ar:Peterpan]
[bpm:120]
[key:C]
[00:00.00](Intro Instrumental)
[00:15.50]Ku teringat kenangan yang indah
[00:19.80]Saat kau masih di sisiku
[00:24.10]Dan kini kau telah pergi jauh
[00:28.40]Meninggalkan luka di hatiku
[00:32.70]Engkau bukanlah segalaku
[00:37.00]Bukan tempat tuk hentikan langkahku
[00:41.30]Usah kau lakukan seperti itu
[00:45.60]Karena ku takkan pernah lagi peduli
[00:49.90]Pergilah kau, jauhi diriku
[00:54.20]Jangan pernah kembali untukku
[00:58.50]Biar ku hapus jejakmu dari hatiku
[01:03.00]Dan ku jalani hidupku tanpamu`;

const song1Chords = `[00:00.00]C
[00:03.50]G
[00:07.00]Am
[00:11.00]F
[00:15.50]C
[00:17.50]G
[00:19.80]Am
[00:22.00]F
[00:24.10]C
[00:26.00]G
[00:28.40]Am
[00:30.50]F
[00:32.70]C
[00:35.00]G
[00:37.00]Am
[00:39.00]F
[00:41.30]C
[00:43.50]G
[00:45.60]Am
[00:47.80]F
[00:49.90]C
[00:52.00]G
[00:54.20]Am
[00:56.50]F
[00:58.50]C
[01:01.00]G
[01:03.00]Am
[01:05.50]F`;

const song1Raw = `(Intro)
C  G  Am  F

C   G
Ku teringat kenangan yang indah
Am   F
Saat kau masih di sisiku
C   G
Dan kini kau telah pergi jauh
Am   F
Meninggalkan luka di hatiku`;

// Lagu 2 & 3: lirik dummy orisinal untuk development
const song2 = buildLrc({
  title: "Langit Senja",
  artist: "Senja Akustik",
  bpm: 96,
  key: "G",
  intro: true,
  progression: ["G", "D", "Em", "C"],
  lines: [
    [12.0, "Langit jingga memeluk pelan"],
    [16.5, "Angin sore membawa cerita"],
    [21.0, "Kita duduk di tepi dermaga"],
    [25.5, "Menunggu matahari pulang"],
    [30.0, "Dan waktu berjalan begitu tenang"],
    [34.5, "Seolah dunia ikut berhenti"],
    [39.0, "Biarkan senja ini bertahan"],
    [43.5, "Sedikit lebih lama lagi"]
  ]
});

const song3 = buildLrc({
  title: "Jalan Pulang",
  artist: "Laras Bayu",
  bpm: 84,
  key: "Am",
  intro: true,
  progression: ["Am", "F", "C", "G"],
  lines: [
    [14.0, "Lampu kota menyala satu-satu"],
    [18.8, "Langkahku pelan menyusuri malam"],
    [23.6, "Ada rindu yang tak sempat kusebut"],
    [28.4, "Tertinggal di sudut stasiun tua"],
    [33.2, "Jalan pulang terasa begitu jauh"],
    [38.0, "Tapi hatiku tahu arah tujuan"],
    [42.8, "Di mana ada kamu menunggu"],
    [47.6, "Di situlah aku berhenti"]
  ]
});

const songs = [
  {
    title: "Menghapus Jejakmu",
    slug: "peterpan-menghapus-jejakmu",
    artistSlug: "peterpan",
    bpm: 120,
    capo: 0,
    originalKey: "C",
    lyricsLrc: song1Lyrics,
    chordsLrc: song1Chords,
    rawContent: song1Raw,
    youtubeUrl: null,
    spotifyUrl: null,
    viewsCount: 1250,
    genres: ["pop", "balada"]
  },
  {
    title: "Langit Senja",
    slug: "senja-akustik-langit-senja",
    artistSlug: "senja-akustik",
    bpm: 96,
    capo: 2,
    originalKey: "G",
    ...song2,
    youtubeUrl: null,
    spotifyUrl: null,
    viewsCount: 430,
    genres: ["akustik", "indie"]
  },
  {
    title: "Jalan Pulang",
    slug: "laras-bayu-jalan-pulang",
    artistSlug: "laras-bayu",
    bpm: 84,
    capo: 0,
    originalKey: "Am",
    ...song3,
    youtubeUrl: null,
    spotifyUrl: null,
    viewsCount: 215,
    genres: ["balada", "pop"]
  }
];

const playlists = [
  {
    title: "Favorit Santai",
    description: "Lagu-lagu pelan untuk menemani sore hari.",
    songSlugs: ["senja-akustik-langit-senja", "laras-bayu-jalan-pulang"]
  },
  {
    title: "Latihan Chord Dasar",
    description: "Lagu dengan progresi chord sederhana untuk pemula.",
    songSlugs: [
      "peterpan-menghapus-jejakmu",
      "senja-akustik-langit-senja",
      "laras-bayu-jalan-pulang"
    ]
  }
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding database...");

  // Artists
  const artistIds = new Map<string, string>();
  for (const a of artists) {
    const row = await prisma.artist.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        bio: a.bio,
        imageUrl: a.imageUrl,
        verified: a.verified
      },
      create: a
    });
    artistIds.set(a.slug, row.id);
  }
  console.log(`✔ ${artists.length} artists`);

  // Genres
  const genreIds = new Map<string, string>();
  for (const g of genres) {
    const row = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: g
    });
    genreIds.set(g.slug, row.id);
  }
  console.log(`✔ ${genres.length} genres`);

  // Chords
  for (const c of chords) {
    const data = {
      frets: c.frets,
      fingers: c.fingers,
      barre: c.barre ?? undefined
    };
    await prisma.chord.upsert({
      where: { name: c.name },
      update: data,
      create: { name: c.name, ...data }
    });
  }
  console.log(`✔ ${chords.length} chords`);

  // Songs + SongGenre
  const songIds = new Map<string, string>();
  for (const s of songs) {
    const { artistSlug, genres: genreSlugs, ...rest } = s;
    const artistId = artistIds.get(artistSlug);
    if (!artistId) throw new Error(`Artist tidak ditemukan: ${artistSlug}`);

    const song = await prisma.song.upsert({
      where: { slug: s.slug },
      update: { ...rest, artistId },
      create: { ...rest, artistId, isPublished: true }
    });
    songIds.set(s.slug, song.id);

    // reset relasi genre lalu isi ulang
    await prisma.songGenre.deleteMany({ where: { songId: song.id } });
    await prisma.songGenre.createMany({
      data: genreSlugs.map(slug => {
        const genreId = genreIds.get(slug);
        if (!genreId) throw new Error(`Genre tidak ditemukan: ${slug}`);
        return { songId: song.id, genreId };
      })
    });
  }
  console.log(`✔ ${songs.length} songs`);

  // Playlists (tidak ada unique key, jadi cari berdasarkan title)
  for (const p of playlists) {
    const existing = await prisma.playlist.findFirst({
      where: { title: p.title }
    });
    const playlist = existing
      ? await prisma.playlist.update({
          where: { id: existing.id },
          data: { description: p.description }
        })
      : await prisma.playlist.create({
          data: { title: p.title, description: p.description }
        });

    await prisma.playlistSong.deleteMany({
      where: { playlistId: playlist.id }
    });
    await prisma.playlistSong.createMany({
      data: p.songSlugs.map((slug, order) => {
        const songId = songIds.get(slug);
        if (!songId) throw new Error(`Song tidak ditemukan: ${slug}`);
        return { playlistId: playlist.id, songId, order };
      })
    });
  }
  console.log(`✔ ${playlists.length} playlists`);

  console.log("✅ Seeding selesai");
}

main()
  .catch(e => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
