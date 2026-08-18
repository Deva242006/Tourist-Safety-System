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
    CRITICAL: { bg: 'rgba(239,68,68,0.07)', text: '#f87171', border: 'rgba(239,68,68,0.22)', leftBorder: '#ef4444', icon: '🆘' },
    HIGH:     { bg: 'rgba(249,115,22,0.07)', text: '#fb923c', border: 'rgba(249,115,22,0.22)', leftBorder: '#f97316', icon: '⚠️' },
    MEDIUM:   { bg: 'rgba(234,179,8,0.07)',  text: '#fbbf24', border: 'rgba(234,179,8,0.22)',  leftBorder: '#eab308', icon: '🔶' },
    LOW:      { bg: 'rgba(34,197,94,0.06)',  text: '#34d399', border: 'rgba(34,197,94,0.18)',  leftBorder: '#22c55e', icon: '🟢' },
}

const ALERT_TYPES = {
    SOS: '🆘 SOS Alert',
    GEOFENCE: '📍 Geofence Breach',
    ROUTE_DEVIATION: '🚨 Route Deviation',
    INACTIVITY: '⏱️ Inactivity',
}

function timeAgo(iso) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
}

function StatCard({ label, value, color, icon, glow }) {
    return (
        <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{
                width: '40px', height: '40px',
                borderRadius: '10px',
                background: `${color}14`,
                border: `1px solid ${color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                margin: '0 auto 0.75rem',
                boxShadow: glow,
            }}>
                {icon}
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {label}
            </p>
        </div>
    )
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
        <div style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            {/* Page header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    background: 'linear-gradient(135deg, #f0f4ff 0%, #8ba3c7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    Command Center
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                    Real-time tourist safety monitoring & incident management
                </p>
            </div>

            {/* Stats Row */}
            <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <StatCard label="Live Tourists" value={markers.length} color="#38bdf8" icon="📡" glow="0 0 12px rgba(56,189,248,0.2)" />
                <StatCard label="Active Alerts" value={alerts.length} color="#fbbf24" icon="🚨" glow="0 0 12px rgba(251,191,36,0.2)" />
                <StatCard label="Registered" value={touristList.length} color="#818cf8" icon="👥" glow="0 0 12px rgba(129,140,248,0.2)" />
                <StatCard label="E-FIR Cases" value={incidents.length} color="#34d399" icon="📋" glow="0 0 12px rgba(52,211,153,0.2)" />
            </div>

            {/* Map + Alert Feed Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Map */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(56,189,248,0.1)',
                                border: '1px solid rgba(56,189,248,0.18)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px',
                            }}>🗺️</div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tourist Heatmap</h2>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live location tracking</p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            background: markers.length > 0 ? 'rgba(56,189,248,0.08)' : 'rgba(148,163,184,0.06)',
                            border: `1px solid ${markers.length > 0 ? 'rgba(56,189,248,0.2)' : 'var(--border-subtle)'}`,
                        }}>
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: markers.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                boxShadow: markers.length > 0 ? '0 0 6px rgba(56,189,248,0.8)' : 'none',
                                animation: markers.length > 0 ? 'dotPulse 2s infinite' : 'none',
                            }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: markers.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                                {markers.length} tourist{markers.length !== 1 ? 's' : ''} live
                            </span>
                        </div>
                    </div>
                    <div style={{ height: '340px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <ZoneMap zones={zones} markers={markers} />
                    </div>
                </div>

                {/* Alert Feed */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                        }}>🚨</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alert Feed</h2>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live safety incidents</p>
                        </div>
                    </div>

                    {alerts.length === 0 ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            gap: '0.5rem',
                        }}>
                            <span style={{ fontSize: '2rem' }}>✅</span>
                            <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 500 }}>No active alerts</p>
                            <p style={{ margin: 0, fontSize: '0.725rem' }}>All tourists are safe</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', overflowY: 'auto', maxHeight: '320px', paddingRight: '2px' }}>
                            {alerts.map((a, i) => {
                                const sev = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.LOW
                                return (
                                    <div key={a.id || i} style={{
                                        background: sev.bg,
                                        border: `1px solid ${sev.border}`,
                                        borderLeft: `3px solid ${sev.leftBorder}`,
                                        borderRadius: '10px',
                                        padding: '0.75rem',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sev.text }}>
                                                {ALERT_TYPES[a.type] || a.type}
                                            </span>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(a.createdAt)}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.message}</p>
                                        <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                                            ID: {String(a.touristId).slice(0, 8)}... · <span style={{ color: sev.text }}>{a.severity}</span>
                                        </p>
                                        {a.status === 'OPEN' && a.id && efirTargetAlertId !== a.id && (
                                            <button
                                                onClick={() => setEfirTargetAlertId(a.id)}
                                                style={{
                                                    marginTop: '0.6rem',
                                                    padding: '0.3rem 0.75rem',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    color: 'var(--accent-cyan)',
                                                    background: 'rgba(56,189,248,0.08)',
                                                    border: '1px solid rgba(56,189,248,0.2)',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontFamily: "'Inter', sans-serif",
                                                    letterSpacing: '0.03em',
                                                }}
                                            >
                                                📄 File E-FIR
                                            </button>
                                        )}
                                        {a.status === 'OPEN' && !a.id && (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Refresh to file E-FIR</p>
                                        )}
                                        {efirTargetAlertId === a.id && (
                                            <FileEfirForm alertId={a.id} onFiled={handleIncidentFiled} onCancel={() => setEfirTargetAlertId(null)} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Tourists + Incidents Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(129,140,248,0.1)',
                            border: '1px solid rgba(129,140,248,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                        }}>👥</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Registered Tourists</h2>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{touristList.length} tourists on record</p>
                        </div>
                    </div>
                    <TouristTable tourists={touristList} />
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(52,211,153,0.1)',
                            border: '1px solid rgba(52,211,153,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                        }}>📋</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Filed Incidents (E-FIR)</h2>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{incidents.length} case{incidents.length !== 1 ? 's' : ''} filed</p>
                        </div>
                    </div>
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