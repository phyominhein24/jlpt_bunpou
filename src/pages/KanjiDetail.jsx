import { useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import n5 from '../data/kanji/n5_kanji.json'
import n4 from '../data/kanji/n4_kanji.json'
import n3 from '../data/kanji/n3_kanji.json'
import n2 from '../data/kanji/n2_kanji.json'
import n1 from '../data/kanji/n1_kanji.json'

export default function KanjiDetail() {
  const { level, id } = useParams()
  const navigate = useNavigate()
  const [sp] = useSearchParams()

  const sortDir = sp.get('sort') === 'desc' ? 'desc' : 'asc'
  const fromNum = sp.get('from') || ''
  const toNum = sp.get('to') || ''
  const q = sp.get('q') || ''

  const map = { N5: n5, N4: n4, N3: n3, N2: n2, N1: n1 }
  const raw = map[level] || []

  const getNo = (gid) => Number(String(gid).split('-')[1])

  const list = useMemo(() => {
    let arr = [...raw]
    arr.sort((a,b)=> sortDir==='asc' ? getNo(a.id)-getNo(b.id) : getNo(b.id)-getNo(a.id))

    const from = fromNum === '' ? null : Number(fromNum)
    const to = toNum === '' ? null : Number(toNum)
    if (from !== null || to !== null) {
      arr = arr.filter(k => {
        const n = getNo(k.id)
        if (from !== null && n < from) return false
        if (to !== null && n > to) return false
        return true
      })
    }

    const query = q.trim().toLowerCase()
    if (query) {
      arr = arr.filter(k =>
        (k.kanji || '').toLowerCase().includes(query) ||
        (k.meaning_mm || '').toLowerCase().includes(query) ||
        (k.onyomi || []).join(' ').toLowerCase().includes(query) ||
        (k.kunyomi || []).join(' ').toLowerCase().includes(query)
      )
    }

    return arr
  }, [raw, sortDir, fromNum, toNum, q])

  const idx = list.findIndex(k => k.id === id)
  const item = idx >= 0 ? list[idx] : null
  const prev = idx > 0 ? list[idx - 1] : null
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null

  const keep = `?sort=${sortDir}&from=${fromNum}&to=${toNum}&q=${encodeURIComponent(q)}`
  const listUrl = `/kanji/${level}${keep}`

  if (!item) return <p>Not found</p>

  return (
    <div className="container">
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom: 14, flexWrap:'wrap' }}>
        <button onClick={() => navigate(listUrl)}>← Back to List</button>
        <button disabled={!prev} onClick={()=> prev && navigate(`/kanji/${level}/${prev.id}${keep}`)}>← Prev</button>
        <button disabled={!next} onClick={()=> next && navigate(`/kanji/${level}/${next.id}${keep}`)}>Next →</button>
        <div style={{ marginLeft:'auto', fontSize:12, opacity:0.7 }}>{idx+1} / {list.length}</div>
      </div>

      <div style={{ border:'1px solid rgba(0,0,0,0.10)', borderRadius:12, padding:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, opacity:0.6 }}>{item.id}</div>
          <div style={{ fontSize:12, opacity:0.6 }}>{level}</div>
        </div>

        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 6 }}>{item.kanji}</div>

        <h4>အဓိပ္ပါယ်</h4>
        <p>{item.meaning_mm}</p>

        <h4>読み方</h4>
        <p><b>ON:</b> {(item.onyomi || []).join('、')}</p>
        <p><b>KUN:</b> {(item.kunyomi || []).join('、')}</p>

        <h4>単語</h4>
        {(item.words || []).map((w, i) => (
          <div key={i} style={{ padding:10, border:'1px solid rgba(0,0,0,0.08)', borderRadius:10, marginBottom:8 }}>
            <div><b>{w.jp}</b>（{w.kana}）</div>
            <div style={{ opacity:0.8 }}>{w.mm}</div>
          </div>
        ))}

        <h4>ဥပမာ</h4>
        {(item.examples || []).map((ex, i) => (
          <div key={i} style={{ padding:10, border:'1px solid rgba(0,0,0,0.08)', borderRadius:10, marginBottom:8 }}>
            <div><b>JP:</b> {ex.jp}</div>
            <div><b>MM:</b> {ex.mm}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
