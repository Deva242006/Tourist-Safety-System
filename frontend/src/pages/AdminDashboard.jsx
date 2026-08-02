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
    CRITICAL: 'bg-red-100 text-red-700 border-red-300',
    HIGH: 'bg-red-50 text-red-600 border-red-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-green-50 text-green-700 border-green-200'
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
        <div className="flex flex-col gap-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold">Tourist Heatmap</h2>
                        <span className="text-xs text-slate-400">{markers.length} tourist(s) live</span>
                    </div>
                    <div className="h-80 rounded overflow-hidden">
                        <ZoneMap zones={zones} markers={markers} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                    <h2 className="font-semibold mb-2">Alert Feed</h2>
                    {alerts.length === 0 ? (
                        <p className="text-sm text-slate-400">No alerts yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
                            {alerts.map((a, i) => (
                                <div key={a.id || i} className={`border rounded p-2 text-sm ${SEVERITY_STYLE[a.severity] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    <div className="flex justify-between items-start gap-2">
                    <span className="font-medium">
                      {a.type === 'SOS' ? '🆘 SOS' : a.type === 'GEOFENCE' ? '⚠️ Geofence' : a.type === 'ROUTE_DEVIATION' ? '🚨 Route Deviation' : a.type === 'INACTIVITY' ? '⏱️ Inactivity' : a.type}
                    </span>
                                        <span className="text-xs opacity-70">{timeAgo(a.createdAt)}</span>
                                    </div>
                                    <p className="mt-0.5">{a.message}</p>
                                    <p className="text-xs opacity-70 mt-0.5">Tourist: {String(a.touristId).slice(0, 8)}... · {a.severity}</p>

                                    {a.status === 'OPEN' && a.id && efirTargetAlertId !== a.id && (
                                        <button onClick={() => setEfirTargetAlertId(a.id)} className="mt-2 text-xs bg-slate-900 text-white rounded px-2 py-1">
                                            File E-FIR
                                        </button>
                                    )}
                                    {a.status === 'OPEN' && !a.id && (
                                        <p className="mt-2 text-xs italic opacity-60">Refresh the page to file an E-FIR for this alert</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
                    <h2 className="font-semibold mb-2">Registered Tourists</h2>
                    <TouristTable tourists={touristList} />
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="font-semibold mb-2">Filed Incidents (E-FIR)</h2>
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