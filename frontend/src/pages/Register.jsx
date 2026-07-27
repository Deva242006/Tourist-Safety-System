import { useState } from 'react'

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportOrIdNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  })

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Day 2: POST /api/tourists/register -> generates Digital ID (hash-chain block)
    console.log('register submit (stub)', form)
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-xl font-semibold mb-4">Tourist Registration (KYC)</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Full name"
               value={form.fullName} onChange={update('fullName')} />
        <input className="border rounded px-3 py-2" placeholder="Email" type="email"
               value={form.email} onChange={update('email')} />
        <input className="border rounded px-3 py-2" placeholder="Phone"
               value={form.phone} onChange={update('phone')} />
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Passport / ID number"
               value={form.passportOrIdNumber} onChange={update('passportOrIdNumber')} />
        <input className="border rounded px-3 py-2" placeholder="Emergency contact name"
               value={form.emergencyContactName} onChange={update('emergencyContactName')} />
        <input className="border rounded px-3 py-2" placeholder="Emergency contact phone"
               value={form.emergencyContactPhone} onChange={update('emergencyContactPhone')} />
        <button className="bg-slate-900 text-white rounded px-3 py-2 mt-2 sm:col-span-2" type="submit">
          Generate Digital ID
        </button>
      </form>
    </div>
  )
}
