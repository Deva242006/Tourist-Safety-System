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
      <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
              className="border rounded px-3 py-2"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
          <input
              className="border rounded px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
          <button
              className="bg-slate-900 text-white rounded px-3 py-2 mt-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4">
          No account? <Link to="/register" className="text-slate-900 underline">Register</Link>
        </p>
      </div>
  )
}