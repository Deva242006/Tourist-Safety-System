import { useState } from 'react'
import { fileIncident } from '../api/incidents'

export default function FileEfirForm({ alertId, onFiled, onCancel }) {
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const incident = await fileIncident(alertId, description)
            onFiled(incident)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to file E-FIR')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-700/50 flex flex-col gap-2">
            {error && (
                <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-1.5">{error}</p>
            )}
            <textarea
                className="glass-input rounded-lg px-3 py-2 text-xs resize-none placeholder-slate-500"
                placeholder="Describe the incident details..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <div className="flex gap-2">
                <button type="submit" disabled={loading}
                        className="text-xs bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-md px-3 py-2 flex-1 disabled:opacity-50 transition-all duration-200 font-medium">
                    {loading ? (
                        <span className="flex items-center justify-center gap-1.5">
                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></span>
                            Filing...
                        </span>
                    ) : 'Submit E-FIR'}
                </button>
                <button type="button" onClick={onCancel}
                        className="text-xs px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md transition-colors">
                    Cancel
                </button>
            </div>
        </form>
    )
}