import { NAVS } from "@/mocks/nav"
import { Link, Outlet } from "react-router"

export default function RootPage() {
  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 justify-between border-b bg-background z-20">
        <Link to={"/"} className="flex items-center px-4 font-bold tracking-wider uppercase text-sm">
          Chordify
        </Link>
        <nav className="hidden h-full items-center justify-center md:flex">
          {NAVS.map((nav, idx: number) => (
            <Link
              key={idx}
              className="flex h-full items-center justify-center border-l px-6 py-2 text-xs uppercase hover:bg-primary hover:text-background transition-colors"
              to={nav.url}
            >
              {nav.name}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex min-h-0 flex-1 w-full overflow-hidden">
        <Outlet />
      </div>
    </main>
  )
}
