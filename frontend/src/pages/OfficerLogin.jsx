import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginOfficer, registerOfficer, saveOfficerSession } from '../api/officers'

export default function OfficerLogin() {
    const navigate = useNavigate()
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [form, setForm] = useState({ email: '', password: '', fullName: '', badgeNumber: '', station: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const res = mode === 'login'
                ? await loginOfficer({ email: form.email, password: form.password })
                : await registerOfficer({ fullName: form.fullName, email: form.email, password: form.password, badgeNumber: form.badgeNumber, station: form.station, role: 'OFFICER' })
            saveOfficerSession(res)
            navigate('/officer')
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Check your credentials.')
        } finally { setLoading(false) }
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    padding: '2rem 2rem 1.5rem',
                    background: 'linear-gradient(135deg,rgba(251,191,36,0.08) 0%,rgba(251,146,60,0.05) 100%)',
                    borderBottom: '1px solid var(--border-subtle)', textAlign: 'center',
                }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(251,146,60,0.18))',
                        border: '1px solid rgba(251,191,36,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                        boxShadow: '0 0 24px rgba(251,191,36,0.15)',
                    }}>👮</div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                        Officer Portal
                    </h1>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Tourist Safety System — Law Enforcement Access
                    </p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                            flex: 1, padding: '0.75rem', fontSize: '0.825rem', fontWeight: 700,
                            background: mode === m ? 'rgba(251,191,36,0.07)' : 'transparent',
                            border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                            color: mode === m ? '#fbbf24' : 'var(--text-muted)',
                            borderBottom: mode === m ? '2px solid #fbbf24' : '2px solid transparent',
                            transition: 'all 0.2s',
                        }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {error && (
                        <div style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    {mode === 'register' && (
                        <>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                                <input name="fullName" className="glass-input" required value={form.fullName} onChange={update}
                                    placeholder="Officer John Smith"
                                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Badge Number</label>
                                <input name="badgeNumber" className="glass-input" required value={form.badgeNumber} onChange={update}
                                    placeholder="e.g. TN-2024-001"
                                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.875rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Station / Posting</label>
                                <input name="station" className="glass-input" value={form.station} onChange={update}
                                    placeholder="e.g. Chennai Central Station"
                                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                        <input name="email" type="email" className="glass-input" required value={form.email} onChange={update}
                            placeholder="officer@police.gov"
                            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                        <input name="password" type="password" className="glass-input" required minLength={6} value={form.password} onChange={update}
                            placeholder="Min. 6 characters"
                            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" id="officer-auth-btn" disabled={loading} style={{
                        padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 800,
                        background: loading ? 'rgba(251,191,36,0.4)' : 'linear-gradient(135deg,#fbbf24,#fb923c)',
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        color: '#0a0a0a', marginTop: '0.25rem',
                        boxShadow: '0 4px 20px rgba(251,191,36,0.3)', transition: 'all 0.25s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                        {loading ? (
                            <>
                                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0a0a', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                            </>
                        ) : (
                            mode === 'login' ? '👮 Sign In' : '👮 Create Account'
                        )}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Tourist? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
