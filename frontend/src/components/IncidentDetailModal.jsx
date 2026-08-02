import { useEffect, useState } from 'react'
import { getIncidentDetail, updateIncidentStatus } from '../api/incidents'

function formatDateTime(iso) {
    return iso ? new Date(iso).toLocaleString() : '—'
}

export default function IncidentDetailModal({ incidentId, onClose, onUpdated }) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        getIncidentDetail(incidentId)
            .then(setDetail)
            .catch(() => setDetail(null))
            .finally(() => setLoading(false))
    }, [incidentId])

    async function handleStatusChange(status) {
        setUpdating(true)
        try {
            await updateIncidentStatus(incidentId, status)
            const refreshed = await getIncidentDetail(incidentId)
            setDetail(refreshed)
            onUpdated?.()
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] print:bg-white print:static">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 print:shadow-none print:max-h-none">
                <div className="flex justify-between items-start mb-4 print:hidden">
                    <h2 className="text-lg font-semibold">Incident Report</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {loading ? (
                    <p className="text-sm text-slate-400">Loading...</p>
                ) : !detail ? (
                    <p className="text-sm text-red-500">Could not load incident.</p>
                ) : (
                    <>
                        <div className="border-b pb-3 mb-3">
                            <p className="text-xs text-slate-400">FIR Number</p>
                            <p className="font-mono font-semibold">{detail.incident.firNumber}</p>
                            <p className="text-xs text-slate-400 mt-2">Status</p>
                            <p className="font-medium">{detail.incident.status}</p>
                        </div>

                        <div className="border-b pb-3 mb-3">
                            <h3 className="font-semibold text-sm mb-2">Tourist Details (from Digital ID)</h3>
                            <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                                <dt className="text-slate-400">Name</dt><dd>{detail.tourist.fullName}</dd>
                                <dt className="text-slate-400">Email</dt><dd>{detail.tourist.email}</dd>
                                <dt className="text-slate-400">Phone</dt><dd>{detail.tourist.phone || '—'}</dd>
                                <dt className="text-slate-400">Document #</dt><dd className="font-mono">{detail.tourist.documentNumber}</dd>
                                <dt className="text-slate-400">Emergency Contact</dt>
                                <dd>{detail.tourist.emergencyContactName || '—'} ({detail.tourist.emergencyContactPhone || '—'})</dd>
                                <dt className="text-slate-400">Trip Window</dt>
                                <dd>{formatDateTime(detail.tourist.tripStart)} – {formatDateTime(detail.tourist.tripEnd)}</dd>
                                {detail.tourist.digitalId && (
                                    <>
                                        <dt className="text-slate-400">Digital ID Hash</dt>
                                        <dd className="font-mono text-xs">{detail.tourist.digitalId.currentHash}</dd>
                                    </>
                                )}
                            </dl>
                        </div>

                        {detail.alert && (
                            <div className="border-b pb-3 mb-3">
                                <h3 className="font-semibold text-sm mb-2">Triggering Alert</h3>
                                <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                                    <dt className="text-slate-400">Type</dt><dd>{detail.alert.type}</dd>
                                    <dt className="text-slate-400">Severity</dt><dd>{detail.alert.severity}</dd>
                                    <dt className="text-slate-400">Message</dt><dd>{detail.alert.message}</dd>
                                    <dt className="text-slate-400">Location</dt>
                                    <dd>{detail.alert.latitude.toFixed(5)}, {detail.alert.longitude.toFixed(5)}</dd>
                                    <dt className="text-slate-400">Time</dt><dd>{formatDateTime(detail.alert.createdAt)}</dd>
                                </dl>
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="font-semibold text-sm mb-1">Officer Description</h3>
                            <p className="text-sm text-slate-600">{detail.incident.description || '—'}</p>
                        </div>

                        <div className="flex gap-2 print:hidden">
                            {detail.incident.status !== 'RESOLVED' && (
                                <>
                                    {detail.incident.status === 'FILED' && (
                                        <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updating}
                                                className="text-sm bg-amber-100 text-amber-700 rounded px-3 py-2 disabled:opacity-50">
                                            Mark In Progress
                                        </button>
                                    )}
                                    <button onClick={() => handleStatusChange('RESOLVED')} disabled={updating}
                                            className="text-sm bg-green-100 text-green-700 rounded px-3 py-2 disabled:opacity-50">
                                        Mark Resolved
                                    </button>
                                </>
                            )}
                            <button onClick={() => window.print()} className="text-sm bg-slate-900 text-white rounded px-3 py-2 ml-auto">
                                Print FIR
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}