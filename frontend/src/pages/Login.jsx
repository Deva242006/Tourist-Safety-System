import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginTourist, saveSession } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginTourist({ email, password })
      saveSession(data)
      navigate('/tourist')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 60px)',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '25%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '25%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.12) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.18)',
            marginBottom: '1.25rem',
            boxShadow: '0 0 30px rgba(56,189,248,0.1)',
            fontSize: '28px',
          }}>
            🛡️
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            background: 'linear-gradient(135deg, #f0f4ff 0%, #8ba3c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Outfit', sans-serif",
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Sign in to your tourist safety account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 38, 0.9) 0%, rgba(6, 10, 22, 0.95) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.09)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 16px 60px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top sheen */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), rgba(129,140,248,0.15), transparent)',
          }} />

          {error && (
            <div className="animate-slide-down" style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="login-form">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                className="glass-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                className="glass-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              id="login-submit"
              style={{ width: '100%', marginTop: '0.25rem', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? (
                  <>
                    <span style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(4,6,13,0.3)',
                      borderTopColor: '#04060d',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>🔐 Sign In</>
                )}
              </span>
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link
            to="/register"
            id="login-register-link"
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
          >
            Create one for free →
          </Link>
        </p>
      </div>
    </div>
  )
}