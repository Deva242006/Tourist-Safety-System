import { useEffect, useState, useCallback } from 'react'
import { getZones } from '../api/zones'
import { getRecentAlerts } from '../api/alerts'
import { getTourists } from '../api/tourists'
import { getIncidents } from '../api/incidents'
import { connectSocket, disconnectSocket } from '../api/socket'
import ZoneMap from '../components/ZoneMap.jsx'
import TouristTable from '../components/TouristTable.jsx'
import IncidentPanel from '../components/IncidentPanel.jsx'
import IncidentDetailModal from '../components/IncidentDetailModal.jsx'
import FileEfirForm from '../components/FileEfirForm.jsx'

const SEVERITY_STYLE = {
    CRITICAL: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    HIGH: 'bg-rose-500/8 text-rose-300 border-rose-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    LOW: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
}

function timeAgo(iso) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
}

export default function AdminDashboard() {
    const [zones, setZones] = useState([])
    const [tourists, setTourists] = useState({})
    const [alerts, setAlerts] = useState([])
    const [touristList, setTouristList] = useState([])
    const [incidents, setIncidents] = useState([])
    const [efirTargetAlertId, setEfirTargetAlertId] = useState(null)
    const [selectedIncidentId, setSelectedIncidentId] = useState(null)

    const loadInitial = useCallback(() => {
        getZones().then(setZones).catch(() => setZones([]))
        getRecentAlerts().then(setAlerts).catch(() => setAlerts([]))
        getTourists().then(setTouristList).catch(() => setTouristList([]))
        getIncidents().then(setIncidents).catch(() => setIncidents([]))
    }, [])

    useEffect(() => {
        loadInitial()
        connectSocket({
            onTracking: (loc) => {
                setTourists((prev) => ({ ...prev, [loc.touristId]: { lat: loc.latitude, lng: loc.longitude, timestamp: loc.timestamp } }))
            },
            onAlert: (alert) => {
                setAlerts((prev) => [{ ...alert, createdAt: alert.createdAt || new Date().toISOString() }, ...prev].slice(0, 50))
            }
        })
        return () => disconnectSocket()
    }, [loadInitial])

    const markers = Object.entries(tourists).map(([touristId, loc]) => ({
        id: touristId, lat: loc.lat, lng: loc.lng, label: `Tourist ${touristId.slice(0, 8)}`
    }))

    function handleIncidentFiled() {
        setEfirTargetAlertId(null)
        getIncidents().then(setIncidents).catch(() => {})
        getRecentAlerts().then(setAlerts).catch(() => {})
    }

    return (
        <div className="flex flex-col gap-5 mt-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-cyan-400">{markers.length}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Live Tourists</p>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-amber-400">{alerts.length}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Active Alerts</p>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-indigo-400">{touristList.length}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Registered</p>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-emerald-400">{incidents.length}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">E-FIR Cases</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel rounded-xl p-5 md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-sm tracking-wider uppercase text-slate-300">🗺️ Tourist Heatmap</h2>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                            {markers.length} tourist(s) live
                        </span>
                    </div>
                    <div className="h-80 rounded-lg overflow-hidden border border-slate-800/60">
                        <ZoneMap zones={zones} markers={markers} />
                    </div>
                </div>

                <div className="glass-panel rounded-xl p-5 flex flex-col">
                    <h2 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-3">🚨 Alert Feed</h2>
                    {alerts.length === 0 ? (
                        <p className="text-sm text-slate-500">No alerts yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-1">
                            {alerts.map((a, i) => (
                                <div key={a.id || i} className={`border rounded-lg p-3 text-sm ${SEVERITY_STYLE[a.severity] || 'bg-slate-800/30 text-slate-400 border-slate-700/40'}`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-semibold">
                                            {a.type === 'SOS' ? '🆘 SOS' : a.type === 'GEOFENCE' ? '⚠️ Geofence' : a.type === 'ROUTE_DEVIATION' ? '🚨 Route Deviation' : a.type === 'INACTIVITY' ? '⏱️ Inactivity' : a.type}
                                        </span>
                                        <span className="text-xs opacity-60">{timeAgo(a.createdAt)}</span>
                                    </div>
                                    <p className="mt-1 text-xs opacity-80">{a.message}</p>
                                    <p className="text-xs opacity-50 mt-1 font-mono">Tourist: {String(a.touristId).slice(0, 8)}... · {a.severity}</p>

                                    {a.status === 'OPEN' && a.id && efirTargetAlertId !== a.id && (
                                        <button onClick={() => setEfirTargetAlertId(a.id)}
                                                className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/50 rounded-md px-3 py-1.5 transition-colors">
                                            File E-FIR
                                        </button>
                                    )}
                                    {a.status === 'OPEN' && !a.id && (
                                        <p className="mt-2 text-xs italic opacity-40">Refresh the page to file an E-FIR for this alert</p>
                                    )}
                                    {efirTargetAlertId === a.id && (
                                        <FileEfirForm alertId={a.id} onFiled={handleIncidentFiled} onCancel={() => setEfirTargetAlertId(null)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel rounded-xl p-5 md:col-span-2">
                    <h2 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-3">👥 Registered Tourists</h2>
                    <TouristTable tourists={touristList} />
                </div>

                <div className="glass-panel rounded-xl p-5">
                    <h2 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-3">📋 Filed Incidents (E-FIR)</h2>
                    <IncidentPanel incidents={incidents} onSelect={setSelectedIncidentId} />
                </div>
            </div>

            {selectedIncidentId && (
                <IncidentDetailModal
                    incidentId={selectedIncidentId}
                    onClose={() => setSelectedIncidentId(null)}
                    onUpdated={() => getIncidents().then(setIncidents).catch(() => {})}
                />
            )}
        </div>
    )
}