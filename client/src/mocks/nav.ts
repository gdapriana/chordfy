export type NavType = {
  name: string
  url: string
}

export const NAVS: NavType[] = [
  { name: "Home", url: "/" },
  { name: "All Songs", url: "/songs" },
  { name: "Artists", url: "/artists" },
  { name: "Chords", url: "/chords" },
  { name: "Profile", url: "/profile" },
]
