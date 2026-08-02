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
        <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t flex flex-col gap-2">
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <textarea
                className="border rounded px-2 py-1 text-xs"
                placeholder="Incident description..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <div className="flex gap-2">
                <button type="submit" disabled={loading} className="text-xs bg-slate-900 text-white rounded px-2 py-1 flex-1 disabled:opacity-50">
                    {loading ? 'Filing...' : 'Submit E-FIR'}
                </button>
                <button type="button" onClick={onCancel} className="text-xs px-2 py-1">Cancel</button>
            </div>
        </form>
    )
}