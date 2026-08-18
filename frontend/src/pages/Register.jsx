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
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 60px)',
      padding: '2.5rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129, 140, 248, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            marginBottom: '1.25rem',
            boxShadow: '0 0 30px rgba(129,140,248,0.1)',
            fontSize: '28px',
          }}>
            🪪
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
            Tourist Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Complete your KYC to generate a blockchain-backed digital ID
          </p>
        </div>

        {/* Form Card */}
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
            background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.25), rgba(167,139,250,0.15), transparent)',
          }} />

          {error && (
            <div className="animate-slide-down" style={{
              marginBottom: '1.5rem',
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

          <form onSubmit={handleSubmit} id="register-form">
            {/* Personal Info */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="section-title">Personal Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel>Full Name</FieldLabel>
                  <input className="glass-input" placeholder="John Doe" value={form.fullName} onChange={update('fullName')} required id="register-name" />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input className="glass-input" placeholder="you@example.com" type="email" value={form.email} onChange={update('email')} required id="register-email" />
                </div>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <input className="glass-input" placeholder="Min. 6 characters" type="password" value={form.password} onChange={update('password')} required minLength={6} id="register-password" />
                </div>
              </div>
            </div>

            {/* Identity */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="section-title">Identity Verification</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <input className="glass-input" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} id="register-phone" />
                </div>
                <div>
                  <FieldLabel>Passport / ID Number</FieldLabel>
                  <input className="glass-input" placeholder="AB1234567" value={form.documentNumber} onChange={update('documentNumber')} required id="register-doc" />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="section-title">Emergency Contact</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <FieldLabel>Contact Name</FieldLabel>
                  <input className="glass-input" placeholder="Jane Doe" value={form.emergencyContactName} onChange={update('emergencyContactName')} id="register-emergency-name" />
                </div>
                <div>
                  <FieldLabel>Contact Phone</FieldLabel>
                  <input className="glass-input" placeholder="+91 12345 67890" value={form.emergencyContactPhone} onChange={update('emergencyContactPhone')} id="register-emergency-phone" />
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.12)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>🔗</span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your data will be encrypted and stored on a secure blockchain ledger. A tamper-proof digital ID will be issued upon registration.
              </p>
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              id="register-submit"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
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
                    Generating Digital ID...
                  </>
                ) : (
                  <>✨ Generate Digital ID</>
                )}
              </span>
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link
            to="/login"
            id="register-login-link"
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label style={{
      display: 'block',
      fontSize: '0.72rem',
      fontWeight: 700,
      color: 'var(--text-secondary)',
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {children}
    </label>
  )
}