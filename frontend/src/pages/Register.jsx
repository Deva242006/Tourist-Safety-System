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
      <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Tourist Registration (KYC)</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Full name"
                 value={form.fullName} onChange={update('fullName')} required />
          <input className="border rounded px-3 py-2" placeholder="Email" type="email"
                 value={form.email} onChange={update('email')} required />
          <input className="border rounded px-3 py-2" placeholder="Password (min 6 chars)" type="password"
                 value={form.password} onChange={update('password')} required minLength={6} />
          <input className="border rounded px-3 py-2" placeholder="Phone"
                 value={form.phone} onChange={update('phone')} />
          <input className="border rounded px-3 py-2" placeholder="Passport / ID number"
                 value={form.documentNumber} onChange={update('documentNumber')} required />
          <input className="border rounded px-3 py-2" placeholder="Emergency contact name"
                 value={form.emergencyContactName} onChange={update('emergencyContactName')} />
          <input className="border rounded px-3 py-2" placeholder="Emergency contact phone"
                 value={form.emergencyContactPhone} onChange={update('emergencyContactPhone')} />
          <button
              className="bg-slate-900 text-white rounded px-3 py-2 mt-2 sm:col-span-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
          >
            {loading ? 'Generating Digital ID...' : 'Generate Digital ID'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4">
          Already registered? <Link to="/login" className="text-slate-900 underline">Log in</Link>
        </p>
      </div>
  )
}