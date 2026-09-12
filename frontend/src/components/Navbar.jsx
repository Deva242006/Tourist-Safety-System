import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getSession, clearSession } from '../api/auth'
import { getOfficerSession, clearOfficerSession } from '../api/officers'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar() {
    const navigate = useNavigate()
    useLocation()
    const session = getSession()
    const officerSession = getOfficerSession()

    function handleLogout() {
        clearSession()
        navigate('/login')
    }

    function handleOfficerLogout() {
        clearOfficerSession()
        navigate('/officer-login')
    }

    return (
        <nav
            id="main-navbar"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 999,
                background: 'rgba(4, 6, 13, 0.85)',
                backdropFilter: 'blur(24px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                borderBottom: '1px solid rgba(148, 163, 184, 0.07)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
            }}
        >
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px',
            }}>
                {/* Logo */}
                <Link to="/" className="no-underline" id="nav-home" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(129, 140, 248, 0.18) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: '0 0 16px rgba(56,189,248,0.12)',
                        flexShrink: 0,
                    }}>
                        🛡️
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            letterSpacing: '-0.02em',
                            fontFamily: "'Outfit', sans-serif",
                        }}>
                            SafeGuard
                        </span>
                        <span style={{
                            fontSize: '0.6rem',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}>
                            Tourist Safety
                        </span>
                    </div>
                </Link>

                {/* Right Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(session || officerSession) && <NotificationBell />}
                    {officerSession ? (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.35rem 0.75rem', borderRadius: '9999px',
                                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', marginRight: '0.25rem',
                            }}>
                                <span style={{ fontSize: '0.75rem' }}>👮</span>
                                <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {officerSession.fullName}
                                </span>
                            </div>
                            <NavLink to="/officer" id="nav-officer">My Cases</NavLink>
                            <button onClick={handleOfficerLogout} id="nav-officer-logout" style={{
                                padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 600,
                                color: '#fbbf24', background: 'transparent', border: '1px solid rgba(251,191,36,0.15)', cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.1)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)' }}
                            >Logout</button>
                        </>
                    ) : session ? (
                        <>
                            {/* User chip */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem',
                                borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.12)', marginRight: '0.25rem',
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px rgba(52,211,153,0.8)', flexShrink: 0, animation: 'dotPulse 2s ease-in-out infinite' }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hi,</span>
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {session.fullName}
                                </span>
                            </div>
                            <NavLink to="/tourist" id="nav-tourist">Tourist</NavLink>
                            <NavLink to="/admin" id="nav-admin">Admin</NavLink>
                            <button onClick={handleLogout} id="nav-logout" style={{
                                padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 600,
                                color: 'var(--accent-rose)', background: 'transparent', border: '1px solid rgba(248, 113, 113, 0.12)', cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.12)' }}
                            >Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" id="nav-login">Login</NavLink>
                            <Link to="/register" id="nav-register" className="no-underline" style={{
                                padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 700,
                                color: '#04060d', background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', border: 'none', cursor: 'pointer', transition: 'all 0.25s',
                                boxShadow: '0 2px 12px rgba(56,189,248,0.25)', display: 'inline-flex', alignItems: 'center',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(56,189,248,0.4)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(56,189,248,0.25)' }}
                            >Register</Link>
                            <NavLink to="/admin" id="nav-admin-public">Admin</NavLink>
                            <NavLink to="/officer-login" id="nav-officer-public">👮 Officers</NavLink>
                        </>
                    )}
                </div>
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
            className="no-underline"
            style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.15)' : '1px solid transparent',
                transition: 'all 0.25s',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                }
            }}
        >
            {children}
        </Link>
    )
}