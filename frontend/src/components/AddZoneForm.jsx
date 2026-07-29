import { useState } from 'react'
import { createZone } from '../api/zones'

export default function AddZoneForm({ onCreated }) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ name: '', riskLevel: 'HIGH', description: '', swLat: '', swLng: '', neLat: '', neLng: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function update(field) {
        return (e) => setForm({ ...form, [field]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const swLat = parseFloat(form.swLat), swLng = parseFloat(form.swLng)
            const neLat = parseFloat(form.neLat), neLng = parseFloat(form.neLng)

            const polygon = [
                { lat: swLat, lng: swLng },
                { lat: neLat, lng: swLng },
                { lat: neLat, lng: neLng },
                { lat: swLat, lng: neLng }
            ]

            await createZone({ name: form.name, riskLevel: form.riskLevel, description: form.description, polygon })
            setForm({ name: '', riskLevel: 'HIGH', description: '', swLat: '', swLng: '', neLat: '', neLng: '' })
            setOpen(false)
            onCreated?.()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create zone')
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return <button onClick={() => setOpen(true)} className="text-sm bg-slate-100 hover:bg-slate-200 rounded px-3 py-2">+ Add Risk Zone (Demo)</button>
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 text-sm">
            <h3 className="font-semibold">New Risk Zone</h3>
            {error && <p className="text-red-600">{error}</p>}
            <input className="border rounded px-2 py-1" placeholder="Zone name" value={form.name} onChange={update('name')} required />
            <select className="border rounded px-2 py-1" value={form.riskLevel} onChange={update('riskLevel')}>
                <option value="LOW">Low risk</option>
                <option value="MEDIUM">Medium risk</option>
                <option value="HIGH">High risk</option>
            </select>
            <input className="border rounded px-2 py-1" placeholder="Description" value={form.description} onChange={update('description')} />
            <p className="text-xs text-slate-400">Rectangle corners (decimal lat/lng):</p>
            <div className="grid grid-cols-2 gap-2">
                <input className="border rounded px-2 py-1" placeholder="SW corner lat" value={form.swLat} onChange={update('swLat')} required />
                <input className="border rounded px-2 py-1" placeholder="SW corner lng" value={form.swLng} onChange={update('swLng')} required />
                <input className="border rounded px-2 py-1" placeholder="NE corner lat" value={form.neLat} onChange={update('neLat')} required />
                <input className="border rounded px-2 py-1" placeholder="NE corner lng" value={form.neLng} onChange={update('neLng')} required />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={loading} className="bg-slate-900 text-white rounded px-3 py-2 flex-1 disabled:opacity-50">{loading ? 'Creating...' : 'Create Zone'}</button>
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2">Cancel</button>
            </div>
        </form>
    )
}