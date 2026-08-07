import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerTourist, saveSession } from '../api/auth'

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    documentNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerTourist(form)
      saveSession(data)
      navigate('/tourist')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-10" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-full max-w-2xl animate-fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
        {/* Decorative gradient */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '120px',
          background: 'radial-gradient(ellipse, rgba(129, 140, 248, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{
            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)',
            border: '1px solid rgba(129, 140, 248, 0.15)'
          }}>
            <span className="text-2xl">🪪</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Tourist Registration</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Complete your KYC to generate a blockchain-backed digital ID</p>
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

          <form onSubmit={handleSubmit} id="register-form">
            {/* Personal Info Section */}
            <div className="mb-5">
              <div className="section-title">Personal Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input className="glass-input" placeholder="John Doe" value={form.fullName} onChange={update('fullName')} required id="register-name" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input className="glass-input" placeholder="you@example.com" type="email" value={form.email} onChange={update('email')} required id="register-email" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
                  <input className="glass-input" placeholder="Min. 6 characters" type="password" value={form.password} onChange={update('password')} required minLength={6} id="register-password" />
                </div>
              </div>
            </div>

            {/* Identity Section */}
            <div className="mb-5">
              <div className="section-title">Identity Verification</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone</label>
                  <input className="glass-input" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} id="register-phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Passport / ID Number</label>
                  <input className="glass-input" placeholder="AB1234567" value={form.documentNumber} onChange={update('documentNumber')} required id="register-doc" />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mb-6">
              <div className="section-title">Emergency Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact Name</label>
                  <input className="glass-input" placeholder="Emergency contact name" value={form.emergencyContactName} onChange={update('emergencyContactName')} id="register-emergency-name" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact Phone</label>
                  <input className="glass-input" placeholder="+91 12345 67890" value={form.emergencyContactPhone} onChange={update('emergencyContactPhone')} id="register-emergency-phone" />
                </div>
              </div>
            </div>

            <button className="btn-primary w-full" type="submit" disabled={loading} id="register-submit">
              <span>{loading ? 'Generating Digital ID...' : '✨ Generate Digital ID'}</span>
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" className="font-medium transition-colors duration-200 no-underline" style={{ color: 'var(--accent-cyan)' }} id="register-login-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}