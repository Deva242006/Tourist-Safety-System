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
        return (
            <button onClick={() => setOpen(true)}
                    className="text-sm bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600/60 text-slate-300 hover:text-slate-100 rounded-lg px-3 py-2 transition-all duration-200">
                + Add Risk Zone
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-5 flex flex-col gap-3 text-sm shadow-xl">
            <h3 className="font-bold text-sm tracking-wider uppercase text-slate-300">🗺️ New Risk Zone</h3>
            {error && (
                <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2">{error}</p>
            )}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400 tracking-wide uppercase">Zone Name</label>
                <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                       placeholder="e.g. High Risk Zone Alpha" value={form.name} onChange={update('name')} required />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400 tracking-wide uppercase">Risk Level</label>
                <select className="glass-input rounded-lg px-3 py-2 text-sm" value={form.riskLevel} onChange={update('riskLevel')}>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400 tracking-wide uppercase">Description</label>
                <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                       placeholder="Brief description..." value={form.description} onChange={update('description')} />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Rectangle Corners (decimal lat/lng)</p>
                <div className="grid grid-cols-2 gap-2">
                    <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                           placeholder="SW lat" value={form.swLat} onChange={update('swLat')} required />
                    <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                           placeholder="SW lng" value={form.swLng} onChange={update('swLng')} required />
                    <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                           placeholder="NE lat" value={form.neLat} onChange={update('neLat')} required />
                    <input className="glass-input rounded-lg px-3 py-2 text-sm placeholder-slate-500"
                           placeholder="NE lng" value={form.neLng} onChange={update('neLng')} required />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={loading}
                        className="bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-lg px-4 py-2 flex-1 disabled:opacity-50 transition-all duration-200 font-medium text-sm">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Creating...
                        </span>
                    ) : 'Create Zone'}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
        </form>
    )
}