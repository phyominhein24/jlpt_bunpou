import { useMemo, useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'

import dataN5 from '../data/n5.json'
import dataN4 from '../data/n4.json'
import dataN3 from '../data/n3.json'
import dataN2 from '../data/n2.json'
import dataN1 from '../data/n1.json'

export default function GrammarList() {
  const { level } = useParams()
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  const dataMap = { N5: dataN5, N4: dataN4, N3: dataN3, N2: dataN2, N1: dataN1 }
  const rawData = dataMap[level] || []

  const getIdNumber = (id) => Number(String(id).split('-')[1])

  // URL state (refresh safe)
  const [q, setQ] = useState(sp.get('q') || '')
  const [sortDir, setSortDir] = useState(sp.get('sort') === 'desc' ? 'desc' : 'asc')
  const [fromNum, setFromNum] = useState(sp.get('from') || '')
  const [toNum, setToNum] = useState(sp.get('to') || '')

  // view + pagination (like KanjiList)
  const [view, setView] = useState(sp.get('view') === 'grid' ? 'grid' : 'list')
  const [perPage, setPerPage] = useState(() => {
    const v = Number(sp.get('per') || 20)
    return [10, 20, 30, 50].includes(v) ? v : 20
  })
  const [page, setPage] = useState(() => Math.max(1, Number(sp.get('page') || 1)))

  const filtered = useMemo(() => {
    let list = [...rawData]

    // sort
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

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const pagedList = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // keep URL updated (refresh safe)
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

  // buttons
  const apply = () => {
    // go page 1 when applying
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
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>

        <div style={{ lineHeight: 1.2 }}>
          <h2 style={{ margin: 0 }}>{level} Grammar</h2>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {filtered.length} items • Page {page}/{totalPages}
          </div>
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
          marginBottom: 12
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search… (grammar / meaning / explanation)"
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
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              style={inputStyle}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination (top) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          style={{ ...btnStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Prev
        </button>

        <button
          style={{
            ...btnStyle,
            opacity: page === totalPages ? 0.5 : 1,
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next →
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
          Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} / {filtered.length}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && <p>No results.</p>}

      {/* LIST VIEW */}
      {view === 'list' &&
        pagedList.map((g) => (
          <Link
            key={g.id}
            to={`/grammar/${level}/${g.id}${keepQuery()}`}
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
              <div style={{ fontWeight: 800, opacity: 0.6, minWidth: 42 }}>{getIdNumber(g.id)}.</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{g.grammar}</div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>{g.meaning_mm}</div>
              </div>

              <div style={{ fontSize: 12, opacity: 0.6 }}>{g.id}</div>
            </div>
          </Link>
        ))}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {pagedList.map((g) => (
            <Link
              key={g.id}
              to={`/grammar/${level}/${g.id}${keepQuery()}`}
              style={{
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: 12,
                padding: 12,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.65 }}>
                <span>{getIdNumber(g.id)}.</span>
                <span>{g.id}</span>
              </div>

              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 900 }}>{g.grammar}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{g.meaning_mm}</div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7, lineHeight: 1.3 }}>
                {(g.explanation_mm || '').slice(0, 60)}
                {(g.explanation_mm || '').length > 60 ? '…' : ''}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination (bottom) */}
      {filtered.length > 0 && (
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
            style={{
              ...btnStyle,
              opacity: page === totalPages ? 0.5 : 1,
              cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}
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
