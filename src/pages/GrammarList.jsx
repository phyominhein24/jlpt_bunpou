import { useParams, Link, useNavigate } from 'react-router-dom'

import dataN5 from '../data/n5.json'
import dataN4 from '../data/n4.json'
import dataN3 from '../data/n3.json'
import dataN2 from '../data/n2.json'
import dataN1 from '../data/n1.json'

export default function GrammarList() {
  const { level } = useParams()
  const navigate = useNavigate()

  // map level -> data
  const dataMap = {
    N5: dataN5,
    N4: dataN4,
    N3: dataN3,
    N2: dataN2,
    N1: dataN1
  }

  const data = dataMap[level] || []

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h2>{level} Grammar</h2>
      </div>

      {data.length === 0 && <p>No data found for {level}</p>}

      {data.map((g, i) => (
        <div key={g.id} className="list-row">
          <strong className="index">{i + 1}.</strong>

          <Link to={`/grammar/${level}/${g.id}`} className="card">
            <strong>{g.grammar}</strong>
            <p>{g.meaning_mm}</p>
          </Link>
        </div>
      ))}
    </div>
  )
}
