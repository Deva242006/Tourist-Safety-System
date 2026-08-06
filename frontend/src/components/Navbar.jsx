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
        <nav className="bg-slate-950/70 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-[999]">
            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
                <span className="text-xl">🧭</span>
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent font-extrabold text-lg">
                    Tourist Safety System
                </span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
                {session ? (
                    <>
                        <div className="bg-slate-900/60 border border-slate-800/80 px-3 py-1 rounded-full text-slate-300 text-xs hidden sm:flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hi, <span className="font-semibold text-slate-200">{session.fullName}</span>
                        </div>
                        <Link to="/tourist" className="text-slate-300 transition-colors duration-200 hover:text-cyan-400 px-2.5 py-1 rounded-md hover:bg-slate-900/30">
                            Tourist App
                        </Link>
                        <Link to="/admin" className="text-slate-300 transition-colors duration-200 hover:text-cyan-400 px-2.5 py-1 rounded-md hover:bg-slate-900/30">
                            Admin Deck
                        </Link>
                        <button onClick={handleLogout} className="text-rose-400 transition-colors duration-200 hover:text-rose-300 hover:bg-rose-950/30 px-3 py-1 rounded-md font-medium">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-slate-300 transition-colors duration-200 hover:text-cyan-400 px-2.5 py-1 rounded-md hover:bg-slate-900/30">
                            Login
                        </Link>
                        <Link to="/register" className="text-slate-300 transition-colors duration-200 hover:text-cyan-400 px-2.5 py-1 rounded-md hover:bg-slate-900/30">
                            Register
                        </Link>
                        <Link to="/admin" className="text-slate-300 transition-colors duration-200 hover:text-cyan-400 px-2.5 py-1 rounded-md hover:bg-slate-900/30">
                            Admin Deck
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}