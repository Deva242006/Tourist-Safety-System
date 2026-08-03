import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getSession, clearSession } from '../api/auth'

export default function Navbar() {
    const navigate = useNavigate()
    useLocation()
    const session = getSession()

    function handleLogout() {
        clearSession()
        navigate('/login')
    }

    return (
        <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold tracking-tight">🧭 Tourist Safety System</Link>
            <div className="flex items-center gap-4 text-sm">
                {session ? (
                    <>
                        <span className="text-slate-400 hidden sm:inline">Hi, {session.fullName}</span>
                        <Link to="/tourist" className="hover:text-slate-300">Tourist App</Link>
                        <Link to="/admin" className="hover:text-slate-300">Admin Dashboard</Link>
                        <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-slate-300">Login</Link>
                        <Link to="/register" className="hover:text-slate-300">Register</Link>
                        <Link to="/admin" className="hover:text-slate-300">Admin Dashboard</Link>
                    </>
                )}
            </div>
        </nav>
    )
}