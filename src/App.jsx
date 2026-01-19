import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GrammarList from './pages/GrammarList'
import GrammarDetail from './pages/GrammarDetail'


export default function App() {
return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/level/:level" element={<GrammarList />} />
      <Route path="/grammar/:level/:id" element={<GrammarDetail />} />
    </Routes>
  </BrowserRouter>
)
}