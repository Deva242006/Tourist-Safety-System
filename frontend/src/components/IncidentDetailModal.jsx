import { useEffect, useState } from 'react'
import { getIncidentDetail, updateIncidentStatus, assignOfficer } from '../api/incidents'
import { getOfficers } from '../api/officers'

function formatDateTime(iso) {
    return iso ? new Date(iso).toLocaleString() : '—'
}

export default function IncidentDetailModal({ incidentId, onClose, onUpdated }) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [officers, setOfficers] = useState([])
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        getIncidentDetail(incidentId)
            .then(setDetail)
            .catch(() => setDetail(null))
            .finally(() => setLoading(false))
        getOfficers().then(setOfficers).catch(() => setOfficers([]))
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

    async function handleAssignOfficer(officerId) {
        if (!officerId) return
        setAssigning(true)
        try {
            await assignOfficer(incidentId, officerId)
            const refreshed = await getIncidentDetail(incidentId)
            setDetail(refreshed)
            onUpdated?.()
        } catch {}
        finally { setAssigning(false) }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] print:bg-white print:static">
            <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 print:shadow-none print:max-h-none print:border-0 print:rounded-none print:bg-white print:text-black">

                <div className="flex justify-between items-start mb-5 print:hidden">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">Incident Report</h2>
                        <p className="text-xs text-slate-500 mt-0.5">E-FIR Detail View</p>
                    </div>
                    <button onClick={onClose}
                            className="text-slate-500 hover:text-slate-200 hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition-all">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
                        <span className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></span>
                        Loading incident...
                    </div>
                ) : !detail ? (
                    <p className="text-sm text-rose-400 py-4 text-center">Could not load incident details.</p>
                ) : (
                    <>
                        {/* FIR Header */}
                        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 mb-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">FIR Number</p>
                                    <p className="font-mono font-bold text-cyan-400 text-lg">{detail.incident.firNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                                    <p className={`font-semibold text-sm ${detail.incident.status === 'RESOLVED' ? 'text-emerald-400' : detail.incident.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-300'}`}>
                                        {detail.incident.status.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tourist Details */}
                        <div className="border-b border-slate-700/40 pb-4 mb-4">
                            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">Tourist Details (from Digital ID)</h3>
                            <dl className="text-sm grid grid-cols-2 gap-x-6 gap-y-2">
                                <dt className="text-slate-500">Name</dt><dd className="text-slate-200 font-medium">{detail.tourist.fullName}</dd>
                                <dt className="text-slate-500">Email</dt><dd className="text-slate-200">{detail.tourist.email}</dd>
                                <dt className="text-slate-500">Phone</dt><dd className="text-slate-200">{detail.tourist.phone || '—'}</dd>
                                <dt className="text-slate-500">Document #</dt><dd className="font-mono text-cyan-400 text-xs">{detail.tourist.documentNumber}</dd>
                                <dt className="text-slate-500">Emergency Contact</dt>
                                <dd className="text-slate-200">{detail.tourist.emergencyContactName || '—'} ({detail.tourist.emergencyContactPhone || '—'})</dd>
                                <dt className="text-slate-500">Trip Window</dt>
                                <dd className="text-slate-200">{formatDateTime(detail.tourist.tripStart)} – {formatDateTime(detail.tourist.tripEnd)}</dd>
                                {detail.tourist.digitalId && (
                                    <>
                                        <dt className="text-slate-500">Digital ID Hash</dt>
                                        <dd className="font-mono text-xs text-slate-400 truncate">{detail.tourist.digitalId.currentHash}</dd>
                                    </>
                                )}
                            </dl>
                        </div>

                        {/* Triggering Alert */}
                        {detail.alert && (
                            <div className="border-b border-slate-700/40 pb-4 mb-4">
                                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">Triggering Alert</h3>
                                <dl className="text-sm grid grid-cols-2 gap-x-6 gap-y-2">
                                    <dt className="text-slate-500">Type</dt><dd className="text-slate-200">{detail.alert.type}</dd>
                                    <dt className="text-slate-500">Severity</dt>
                                    <dd className={`font-semibold ${detail.alert.severity === 'CRITICAL' || detail.alert.severity === 'HIGH' ? 'text-rose-400' : detail.alert.severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {detail.alert.severity}
                                    </dd>
                                    <dt className="text-slate-500">Message</dt><dd className="text-slate-200">{detail.alert.message}</dd>
                                    <dt className="text-slate-500">Location</dt>
                                    <dd className="font-mono text-xs text-cyan-400">{detail.alert.latitude.toFixed(5)}, {detail.alert.longitude.toFixed(5)}</dd>
                                    <dt className="text-slate-500">Time</dt><dd className="text-slate-200">{formatDateTime(detail.alert.createdAt)}</dd>
                                </dl>
                            </div>
                        )}

                        {/* Officer Description */}
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Officer Description</h3>
                            <p className="text-sm text-slate-300 bg-slate-800/40 border border-slate-700/30 rounded-lg px-4 py-3">
                                {detail.incident.description || '—'}
                            </p>
                        </div>

                        {/* Assign Officer */}
                        <div className="mb-5 print:hidden">
                            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Assign Officer</h3>
                            {detail.incident.officerName ? (
                                <div className="flex items-center gap-2 text-sm text-slate-300 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2">
                                    <span>👮</span>
                                    <span className="font-semibold text-amber-400">{detail.incident.officerName}</span>
                                    <span className="text-slate-500 text-xs ml-1">assigned</span>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select
                                        id="officer-assign-select"
                                        onChange={e => handleAssignOfficer(e.target.value)}
                                        disabled={assigning || officers.length === 0}
                                        defaultValue=""
                                        className="flex-1 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="" disabled>{officers.length === 0 ? 'No officers available' : 'Select an officer...'}</option>
                                        {officers.map(o => (
                                            <option key={o.id} value={o.id}>
                                                👮 {o.fullName} — {o.badgeNumber}{o.station ? ` · ${o.station}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {assigning && <span className="text-xs text-amber-400 self-center">Assigning...</span>}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap print:hidden">
                            {detail.incident.status !== 'RESOLVED' && (
                                <>
                                    {detail.incident.status === 'FILED' && (
                                        <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updating}
                                                className="text-sm bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 rounded-lg px-4 py-2 disabled:opacity-50 transition-all">
                                            Mark In Progress
                                        </button>
                                    )}
                                    <button onClick={() => handleStatusChange('RESOLVED')} disabled={updating}
                                            className="text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-lg px-4 py-2 disabled:opacity-50 transition-all">
                                        Mark Resolved
                                    </button>
                                </>
                            )}
                            <button onClick={() => window.print()}
                                    className="text-sm bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg px-4 py-2 ml-auto transition-all">
                                🖨 Print FIR
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}