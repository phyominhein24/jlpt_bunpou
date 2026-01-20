import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'

import n5 from '../data/kanji/n5_kanji.json'
import n4 from '../data/kanji/n4_kanji.json'
import n3 from '../data/kanji/n3_kanji.json'
import n2 from '../data/kanji/n2_kanji.json'
import n1 from '../data/kanji/n1_kanji.json'

export default function KanjiList() {
  const { level } = useParams()
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  const map = { N5: n5, N4: n4, N3: n3, N2: n2, N1: n1 }
  const raw = map[level] || []

  const getNo = (id) => Number(String(id).split('-')[1])

  const [q, setQ] = useState(sp.get('q') || '')
  const [sortDir, setSortDir] = useState(sp.get('sort') === 'desc' ? 'desc' : 'asc')
  const [fromNum, setFromNum] = useState(sp.get('from') || '')
  const [toNum, setToNum] = useState(sp.get('to') || '')

  const list = useMemo(() => {
    let arr = [...raw]

    // sort
    arr.sort((a, b) =>
      sortDir === 'asc' ? getNo(a.id) - getNo(b.id) : getNo(b.id) - getNo(a.id)
    )

    // range
    const from = fromNum === '' ? null : Number(fromNum)
    const to = toNum === '' ? null : Number(toNum)
    if (from !== null || to !== null) {
      arr = arr.filter((k) => {
        const n = getNo(k.id)
        if (from !== null && n < from) return false
        if (to !== null && n > to) return false
        return true
      })
    }

    // search
    const query = q.trim().toLowerCase()
    if (query) {
      arr = arr.filter(
        (k) =>
          (k.kanji || '').toLowerCase().includes(query) ||
          (k.meaning_mm || '').toLowerCase().includes(query) ||
          (k.onyomi || []).join(' ').toLowerCase().includes(query) ||
          (k.kunyomi || []).join(' ').toLowerCase().includes(query)
      )
    }

    return arr
  }, [raw, q, sortDir, fromNum, toNum])

  const apply = () => {
    const p = {}
    if (q.trim()) p.q = q.trim()
    if (sortDir !== 'asc') p.sort = sortDir
    if (fromNum !== '') p.from = fromNum
    if (toNum !== '') p.to = toNum
    setSp(p)
  }

  const reset = () => {
    setQ('')
    setSortDir('asc')
    setFromNum('')
    setToNum('')
    setSp({})
  }

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.18)',
    outline: 'none'
  }

  const btnStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.18)',
    cursor: 'pointer'
  }

  return (
    <div className="container">
      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}
      >
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div style={{ lineHeight: 1.2 }}>
          <h2 style={{ margin: 0 }}>{level} Kanji</h2>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{list.length} items</div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={reset} style={{ ...btnStyle, opacity: 0.9 }}>
            Reset
          </button>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search kanji / meaning / reading..."
            style={{ ...inputStyle, flex: 1, minWidth: 220 }}
          />

          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={inputStyle}>
            <option value="asc">ID ASC</option>
            <option value="desc">ID DESC</option>
          </select>

          <input
            type="number"
            value={fromNum}
            onChange={(e) => setFromNum(e.target.value)}
            placeholder="From (e.g. 20)"
            min="1"
            style={{ ...inputStyle, width: 150 }}
          />

          <input
            type="number"
            value={toNum}
            onChange={(e) => setToNum(e.target.value)}
            placeholder="To (e.g. 40)"
            min="1"
            style={{ ...inputStyle, width: 150 }}
          />

          <button onClick={apply} style={btnStyle}>
            Apply
          </button>
        </div>
      </div>

      {/* List */}
      {list.length === 0 && <p>No results.</p>}

      {list.map((k) => (
        <Link
          key={k.id}
          to={`/kanji/${level}/${k.id}?sort=${sortDir}&from=${fromNum}&to=${toNum}&q=${encodeURIComponent(q)}`}
          style={{
            display: 'block',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Left: number */}
            <div style={{ fontWeight: 800, opacity: 0.55, minWidth: 46 }}>
              {getNo(k.id)}.
            </div>

            {/* Center: kanji + meaning */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{k.kanji}</div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>{k.meaning_mm}</div>
              </div>

              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                ON: {(k.onyomi || []).join('、')} / KUN: {(k.kunyomi || []).join('、')}
              </div>
            </div>

            {/* Right: id */}
            <div style={{ fontSize: 12, opacity: 0.55 }}>{k.id}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
