import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Day 2: POST /api/auth/login -> store JWT, redirect based on role
    console.log('login submit (stub)', { email, password })
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-lg shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-slate-900 text-white rounded px-3 py-2 mt-2" type="submit">
          Log in
        </button>
      </form>
    </div>
  )
}
