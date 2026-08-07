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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md animate-fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top decorative gradient */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '120px',
          background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(129, 140, 248, 0.12) 100%)',
            border: '1px solid rgba(34, 211, 238, 0.15)'
          }}>
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sign in to your tourist safety account</p>
        </div>

        <div className="glass-card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm animate-slide-down" style={{
              background: 'rgba(251, 113, 133, 0.1)',
              border: '1px solid rgba(251, 113, 133, 0.2)',
              color: 'var(--accent-rose)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
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
              className="btn-primary mt-2 w-full"
              type="submit"
              disabled={loading}
              id="login-submit"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/register" className="font-medium transition-colors duration-200 no-underline" style={{ color: 'var(--accent-cyan)' }} id="login-register-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}