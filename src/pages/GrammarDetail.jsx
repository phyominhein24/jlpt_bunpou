import { useParams } from 'react-router-dom'
import dataN5 from '../data/n5.json'


export default function GrammarDetail() {
const { id } = useParams()
const item = dataN5.find(g => g.id === id)


if (!item) return <p>Not found</p>


    return (
        <div className="container">
        <h2>{item.grammar}</h2>
        <h4>အဓိပ္ပါယ်</h4>
        <p>{item.meaning_mm}</p>
        <h4>အသုံးပြုပုံ</h4>
        <p>{item.explanation_mm}</p>
        <h4>ဥပမာ</h4>
        {item.examples.map((ex, i) => (
            <div key={i} className="example">
                <p>JP: {ex.jp}</p>
                <p>MM: {ex.mm}</p>
            </div>
        ))}
        </div>
    )
}