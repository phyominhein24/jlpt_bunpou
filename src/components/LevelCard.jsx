import { Link } from 'react-router-dom'

export default function LevelCard({ level, to }) {
  return (
    <Link to={to} className="level">
      {level}
    </Link>
  )
}
