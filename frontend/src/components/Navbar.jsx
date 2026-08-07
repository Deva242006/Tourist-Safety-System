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
        <nav className="sticky top-0 z-[999] border-b px-6 py-3.5 flex items-center justify-between" style={{
            background: 'rgba(6, 9, 15, 0.8)',
            backdropFilter: 'blur(20px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
            borderColor: 'var(--border-subtle)'
        }}>
            <Link to="/" className="flex items-center gap-2.5 no-underline group" id="nav-home">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)',
                    border: '1px solid rgba(34, 211, 238, 0.2)'
                }}>
                    🛡️
                </div>
                <span className="gradient-text font-extrabold text-lg tracking-tight">
                    SafeGuard
                </span>
            </Link>
            <div className="flex items-center gap-2">
                {session ? (
                    <>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-emerald)' }} />
                            <span style={{ color: 'var(--text-muted)' }}>Hi,</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{session.fullName}</span>
                        </div>
                        <NavLink to="/tourist" id="nav-tourist">Tourist</NavLink>
                        <NavLink to="/admin" id="nav-admin">Admin</NavLink>
                        <button
                            onClick={handleLogout}
                            id="nav-logout"
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                                color: 'var(--accent-rose)',
                                background: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(251, 113, 133, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" id="nav-login">Login</NavLink>
                        <NavLink to="/register" id="nav-register">Register</NavLink>
                        <NavLink to="/admin" id="nav-admin-public">Admin</NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}

function NavLink({ to, children, id }) {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link
            to={to}
            id={id}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline"
            style={{
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(34, 211, 238, 0.08)' : 'transparent'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.target.style.color = 'var(--text-primary)'
                    e.target.style.background = 'rgba(148, 163, 184, 0.08)'
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.target.style.color = 'var(--text-secondary)'
                    e.target.style.background = 'transparent'
                }
            }}
        >
            {children}
        </Link>
    )
}