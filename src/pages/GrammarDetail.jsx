import { useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import dataN5 from '../data/n5.json'
import dataN4 from '../data/n4.json'
import dataN3 from '../data/n3.json'
import dataN2 from '../data/n2.json'
import dataN1 from '../data/n1.json'

export default function GrammarDetail() {
  const { level, id } = useParams()
  const navigate = useNavigate()
  const [sp] = useSearchParams()

  const sortDir = sp.get('sort') === 'desc' ? 'desc' : 'asc'
  const fromNum = sp.get('from') || ''
  const toNum = sp.get('to') || ''
  const q = sp.get('q') || ''

  const dataMap = { N5: dataN5, N4: dataN4, N3: dataN3, N2: dataN2, N1: dataN1 }
  const rawData = dataMap[level] || []

  const getIdNumber = (gid) => Number(String(gid).split('-')[1])

  const list = useMemo(() => {
    let arr = [...rawData]

    // sort
    arr.sort((a, b) => {
      const na = getIdNumber(a.id)
      const nb = getIdNumber(b.id)
      return sortDir === 'asc' ? na - nb : nb - na
    })

    // range filter
    const from = fromNum === '' ? null : Number(fromNum)
    const to = toNum === '' ? null : Number(toNum)
    if (from !== null || to !== null) {
      arr = arr.filter((g) => {
        const n = getIdNumber(g.id)
        if (from !== null && n < from) return false
        if (to !== null && n > to) return false
        return true
      })
    }

    // search filter (same as list)
    const query = q.trim().toLowerCase()
    if (query) {
      arr = arr.filter((g) => {
        const a = (g.grammar || '').toLowerCase()
        const b = (g.meaning_mm || '').toLowerCase()
        const c = (g.explanation_mm || '').toLowerCase()
        return a.includes(query) || b.includes(query) || c.includes(query)
      })
    }

    return arr
  }, [rawData, sortDir, fromNum, toNum, q])

  const index = list.findIndex((g) => g.id === id)
  const item = index >= 0 ? list[index] : null

  const prevItem = index > 0 ? list[index - 1] : null
  const nextItem = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  const keep = `?sort=${sortDir}&from=${fromNum}&to=${toNum}&q=${encodeURIComponent(q)}`
  const listUrl = `/grammar/${level}${keep}`

  const keepQuery = `?sort=${sortDir}&from=${fromNum}&to=${toNum}&q=${encodeURIComponent(q)}`

  if (!item) return <p>Not found</p>

  return (
    <div className="container">
      {/* Top bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(listUrl)}>← Back to List</button>

        <button
          onClick={() => prevItem && navigate(`/grammar/${level}/${prevItem.id}${keepQuery}`)}
          disabled={!prevItem}
        >
          ← Prev
        </button>

        <button
          onClick={() => nextItem && navigate(`/grammar/${level}/${nextItem.id}${keepQuery}`)}
          disabled={!nextItem}
        >
          Next →
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
          {getIdNumber()} / {list.length} • Order: {sortDir.toUpperCase()}
        </div>
      </div>

      {/* Card */}
      <div style={{ border: '1px solid rgba(0,0,0,0.10)', borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{item.id}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{level}</div>
        </div>

        <h2 style={{ marginTop: 6 }}>{item.grammar}</h2>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 6 }}>အဓိပ္ပါယ်</h4>
          <p style={{ marginTop: 0 }}>{item.meaning_mm}</p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 6 }}>အသုံးပြုပုံ</h4>
          <p style={{ marginTop: 0 }}>{item.explanation_mm}</p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 6 }}>ဥပမာ</h4>
          {item.examples.map((ex, i) => (
            <div
              key={i}
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                padding: 10,
                marginBottom: 8
              }}
            >
              <div style={{ fontWeight: 700 }}>JP</div>
              <div style={{ marginBottom: 6 }}>{ex.jp}</div>
              <div style={{ fontWeight: 700 }}>MM</div>
              <div>{ex.mm}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
