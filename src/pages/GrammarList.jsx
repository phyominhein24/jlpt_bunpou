import { useParams, Link, useNavigate } from 'react-router-dom'
import dataN5 from '../data/n5.json'

export default function GrammarList() {
    const { level } = useParams()
    const navigate = useNavigate()
    const data = level === 'N5' ? dataN5 : []

    return (
        <div className="container">
            {/* Header */}
            <div className="page-header">
                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <h2>{level} Grammar</h2>
            </div>

            {data.map((g, i) => (
                <div key={g.id} className="list-row">
                    {/* index */}
                    <strong className="index">{i + 1}.</strong>

                    {/* link */}
                    <Link
                        to={`/grammar/${level}/${g.id}`}
                        className="card"
                    >
                        <strong>{g.grammar}</strong>
                        <p>{g.meaning_mm}</p>
                    </Link>
                </div>
            ))}
        </div>
    )
}
