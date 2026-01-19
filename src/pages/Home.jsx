import LevelCard from '../components/LevelCard'


export default function Home() {
const levels = ['N5', 'N4', 'N3', 'N2', 'N1']
return (
    <div className="container">
        <h1>JLPT Grammar Study</h1>
        <p>Personal Study (Japanese + Myanmar)</p>
        <div className="grid">
            {levels.map(l => <LevelCard key={l} level={l} />)}
        </div>
    </div>
)
}