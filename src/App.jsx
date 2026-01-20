import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GrammarList from './pages/GrammarList'
import GrammarDetail from './pages/GrammarDetail'
import KanjiList from './pages/KanjiList'
import KanjiDetail from './pages/KanjiDetail'


export default function App() {
return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/grammar/:level" element={<GrammarList />} />
      <Route path="/grammar/:level/:id" element={<GrammarDetail />} />

      <Route path="/kanji/:level" element={<KanjiList />} />
      <Route path="/kanji/:level/:id" element={<KanjiDetail />} />

    </Routes>
  </BrowserRouter>
)
}