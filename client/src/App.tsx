import Artists from "@/pages/artists"
import Home from "@/pages/home"
import RootPage from "@/pages/root"
import Songs from "@/pages/songs"
import { Routes, Route } from "react-router"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />}>
        <Route path="/" element={<Home />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="*" element={<>Page not found</>} />
      </Route>
    </Routes>
  )
}

export default App
