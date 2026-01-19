import { Link } from 'react-router-dom'


export default function LevelCard({ level }) {
    return (
        <Link to={`/level/${level}`} className="level">
            {level}
        </Link>
    )
}