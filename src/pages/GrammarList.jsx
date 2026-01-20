import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'

import dataN5 from '../data/n5.json'
import dataN4 from '../data/n4.json'
import dataN3 from '../data/n3.json'
import dataN2 from '../data/n2.json'
import dataN1 from '../data/n1.json'

export default function GrammarList() {
  const { level } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const dataMap = { N5: dataN5, N4: dataN4, N3: dataN3, N2: dataN2, N1: dataN1 }
  const rawData = dataMap[level] || []

  // URL state (so it stays when you refresh)
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [sortDir, setSortDir] = useState(searchParams.get('sort') === 'desc' ? 'desc' : 'asc')
  const [fromNum, setFromNum] = useState(searchParams.get('from') || '')
  const [toNum, setToNum] = useState(searchParams.get('to') || '')

  const getIdNumber = (id) => Number(String(id).split('-')[1])

  const filtered = useMemo(() => {
    let list = [...rawData]

    // sort first (stable)
    list.sort((a, b) => {
      const na = getIdNumber(a.id)
      const nb = getIdNumber(b.id)
      return sortDir === 'asc' ? na - nb : nb - na
    })

    // range filter
    const from = fromNum === '' ? null : Number(fromNum)
    const to = toNum === '' ? null : Number(toNum)
    if (from !== null || to !== null) {
      list = list.filter((g) => {
        const n = getIdNumber(g.id)
        if (from !== null && n < from) return false
        if (to !== null && n > to) return false
        return true
      })
    }

    // search
    const query = q.trim().toLowerCase()
    if (query) {
      list = list.filter((g) => {
        const a = (g.grammar || '').toLowerCase()
        const b = (g.meaning_mm || '').toLowerCase()
        const c = (g.explanation_mm || '').toLowerCase()
        return a.includes(query) || b.includes(query) || c.includes(query)
      })
    }

    return list
  }, [rawData, q, sortDir, fromNum, toNum])

  // Update URL params
  const applyParams = () => {
    const p = {}
    if (q.trim()) p.q = q.trim()
    if (sortDir !== 'asc') p.sort = sortDir
    if (fromNum !== '') p.from = fromNum
    if (toNum !== '') p.to = toNum
    setSearchParams(p)
  }

  const reset = () => {
    setQ('')
    setSortDir('asc')
    setFromNum('')
    setToNum('')
    setSearchParams({})
  }

  return (
    <div className="container">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button onClick={() => navigate(-1)} className="back-btn">←</button>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{level} Grammar</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Showing {filtered.length} items</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={reset} style={{ opacity: 0.9 }}>Reset</button>
        </div>
      </div>

      {/* Controls card */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search… (grammar / meaning / explanation)"
            style={{
              flex: 1,
              minWidth: 220,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.18)'
            }}
          />

          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.18)'
            }}
          >
            <option value="asc">ID ASC</option>
            <option value="desc">ID DESC</option>
          </select>

          <button onClick={applyParams} style={{ padding: '10px 12px', borderRadius: 10 }}>
            Apply
          </button>
        </div>

        {/* Range */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, alignSelf: 'center' }}>
            Range (number after “-”):
          </div>

          <input
            type="number"
            value={fromNum}
            onChange={(e) => setFromNum(e.target.value)}
            placeholder="From (e.g. 20)"
            min="1"
            style={{
              width: 140,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.18)'
            }}
          />

          <input
            type="number"
            value={toNum}
            onChange={(e) => setToNum(e.target.value)}
            placeholder="To (e.g. 40)"
            min="1"
            style={{
              width: 140,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.18)'
            }}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 && <p>No results.</p>}

      {filtered.map((g, i) => (
        <Link
          key={g.id}
          to={`/grammar/${level}/${g.id}?sort=${sortDir}&from=${fromNum}&to=${toNum}&q=${encodeURIComponent(q)}`}
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 10
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <div style={{ fontWeight: 800, opacity: 0.6, minWidth: 42 }}>{i + 1}.</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{g.grammar}</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>{g.meaning_mm}</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{g.id}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
