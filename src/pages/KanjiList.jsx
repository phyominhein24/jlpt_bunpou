import { useMemo, useState, useEffect } from 'react'
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

  // filters
  const [q, setQ] = useState(sp.get('q') || '')
  const [sortDir, setSortDir] = useState(sp.get('sort') === 'desc' ? 'desc' : 'asc')
  const [fromNum, setFromNum] = useState(sp.get('from') || '')
  const [toNum, setToNum] = useState(sp.get('to') || '')

  // view + pagination
  const [view, setView] = useState(sp.get('view') === 'grid' ? 'grid' : 'list')
  const [perPage, setPerPage] = useState(() => {
    const v = Number(sp.get('per') || 20)
    return [10, 20, 30, 50].includes(v) ? v : 20
  })
  const [page, setPage] = useState(() => Math.max(1, Number(sp.get('page') || 1)))

  // Build filtered list
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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(list.length / perPage))

  // If filters change and page is out of range, clamp
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const pagedList = useMemo(() => {
    const start = (page - 1) * perPage
    const end = start + perPage
    return list.slice(start, end)
  }, [list, page, perPage])

  // Keep state in URL (so reload keeps it)
  useEffect(() => {
    const p = {}
    if (q.trim()) p.q = q.trim()
    if (sortDir !== 'asc') p.sort = sortDir
    if (fromNum !== '') p.from = fromNum
    if (toNum !== '') p.to = toNum

    if (view !== 'list') p.view = view
    if (perPage !== 20) p.per = String(perPage)
    if (page !== 1) p.page = String(page)

    setSp(p, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sortDir, fromNum, toNum, view, perPage, page])

  const apply = () => {
    // when applying, go to first page
    setPage(1)
  }

  const reset = () => {
    setQ('')
    setSortDir('asc')
    setFromNum('')
    setToNum('')
    setView('list')
    setPerPage(20)
    setPage(1)
    setSp({}, { replace: true })
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
    cursor: 'pointer',
    background: 'white'
  }

  const keepQuery = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (sortDir !== 'asc') params.set('sort', sortDir)
    if (fromNum !== '') params.set('from', fromNum)
    if (toNum !== '') params.set('to', toNum)
    if (view !== 'list') params.set('view', view)
    if (perPage !== 20) params.set('per', String(perPage))
    if (page !== 1) params.set('page', String(page))
    const s = params.toString()
    return s ? `?${s}` : ''
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div style={{ lineHeight: 1.2 }}>
          <h2 style={{ margin: 0 }}>{level} Kanji</h2>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {list.length} items • Page {page}/{totalPages}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
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
          marginBottom: 12
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
            placeholder="From"
            min="1"
            style={{ ...inputStyle, width: 120 }}
          />

          <input
            type="number"
            value={toNum}
            onChange={(e) => setToNum(e.target.value)}
            placeholder="To"
            min="1"
            style={{ ...inputStyle, width: 120 }}
          />

          <button onClick={apply} style={btnStyle}>
            Apply
          </button>
        </div>

        {/* View + perPage */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setView('list')}
              style={{
                ...btnStyle,
                fontWeight: view === 'list' ? 800 : 500,
                opacity: view === 'list' ? 1 : 0.7
              }}
            >
              List
            </button>
            <button
              onClick={() => setView('grid')}
              style={{
                ...btnStyle,
                fontWeight: view === 'grid' ? 800 : 500,
                opacity: view === 'grid' ? 1 : 0.7
              }}
            >
              Grid
            </button>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Per page</span>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }} style={inputStyle}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination controls (top) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          style={{ ...btnStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Prev
        </button>

        <button
          style={{ ...btnStyle, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next →
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
          Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, list.length)} / {list.length}
        </div>
      </div>

      {/* Results */}
      {list.length === 0 && <p>No results.</p>}

      {/* LIST VIEW */}
      {view === 'list' && pagedList.map((k) => (
        <Link
          key={k.id}
          to={`/kanji/${level}/${k.id}${keepQuery()}`}
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
            <div style={{ fontWeight: 800, opacity: 0.55, minWidth: 46 }}>{getNo(k.id)}.</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{k.kanji}</div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>{k.meaning_mm}</div>
              </div>

              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                ON: {(k.onyomi || []).join('、')} / KUN: {(k.kunyomi || []).join('、')}
              </div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.55 }}>{k.id}</div>
          </div>
        </Link>
      ))}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10
          }}
        >
          {pagedList.map((k) => (
            <Link
              key={k.id}
              to={`/kanji/${level}/${k.id}${keepQuery()}`}
              style={{
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: 12,
                padding: 12,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.6 }}>
                <span>{getNo(k.id)}.</span>
                <span>{k.id}</span>
              </div>

              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 6, textAlign: 'center' }}>
                {k.kanji}
              </div>

              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85, textAlign: 'center' }}>
                {k.meaning_mm}
              </div>

              <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                <div>ON: {(k.onyomi || []).join('、') || '-'}</div>
                <div>KUN: {(k.kunyomi || []).join('、') || '-'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination controls (bottom) */}
      {list.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            style={{ ...btnStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <div style={{ alignSelf: 'center', fontSize: 12, opacity: 0.75 }}>
            Page {page} / {totalPages}
          </div>
          <button
            style={{ ...btnStyle, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
