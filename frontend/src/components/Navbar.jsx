import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-semibold tracking-tight">
        🧭 Tourist Safety System
      </Link>
      <div className="flex gap-4 text-sm">
        <Link to="/login" className="hover:text-slate-300">Login</Link>
        <Link to="/register" className="hover:text-slate-300">Register</Link>
        <Link to="/tourist" className="hover:text-slate-300">Tourist App</Link>
        <Link to="/admin" className="hover:text-slate-300">Admin Dashboard</Link>
      </div>
    </nav>
  )
}
