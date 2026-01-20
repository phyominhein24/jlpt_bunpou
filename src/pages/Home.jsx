import LevelCard from '../components/LevelCard'

export default function Home() {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1']

  return (
    <div className="container">
      {/* Grammar Section */}
      <h1>JLPT Grammar Study</h1>
      <p>Personal Study (Japanese + Myanmar)</p>

      <div className="grid">
        {levels.map(l => (
          <LevelCard
            key={`g-${l}`}
            level={l}
            to={`/grammar/${l}`}
          />
        ))}
      </div>

      {/* Kanji Section */}
      <h1 style={{ marginTop: '40px' }}>JLPT Kanji Study</h1>
      <p>Kanji Challenge & Soumatome</p>

      <div className="grid">
        {levels.map(l => (
          <LevelCard
            key={`k-${l}`}
            level={l}
            to={`/kanji/${l}`}
          />
        ))}
      </div>
    </div>
  )
}
