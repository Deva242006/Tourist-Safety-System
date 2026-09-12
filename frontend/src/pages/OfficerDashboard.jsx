import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOfficerSession, clearOfficerSession } from '../api/officers'
import { getIncidents, updateIncidentStatus } from '../api/incidents'
import { connectSocket, subscribeToAlerts } from '../api/socket'
import OfficerChatPanel from '../components/OfficerChatPanel'

export default function OfficerDashboard() {
    const navigate = useNavigate()
    const session = getOfficerSession()
    const [incidents, setIncidents] = useState([])
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('incidents')
    const [selectedIncident, setSelectedIncident] = useState(null)
    const [updating, setUpdating] = useState(null)

    useEffect(() => {
        if (!session) { navigate('/officer-login'); return }

        loadIncidents()

        connectSocket()
        const sub = subscribeToAlerts((a) => {
            if (a.severity === 'CRITICAL' || a.severity === 'HIGH') {
                setAlerts(prev => [a, ...prev].slice(0, 30))
            }
        })
        return () => sub?.unsubscribe?.()
    }, [])

    function loadIncidents() {
        setLoading(true)
        getIncidents()
            .then(all => {
                const mine = all.filter(i => i.officerId === session?.officerId || i.status !== 'RESOLVED')
                setIncidents(mine)
            })
            .catch(() => setIncidents([]))
            .finally(() => setLoading(false))
    }

    async function handleStatus(incidentId, status) {
        setUpdating(incidentId)
        try { await updateIncidentStatus(incidentId, status); loadIncidents() }
        catch {}
        finally { setUpdating(null) }
    }

    function handleLogout() {
        clearOfficerSession()
        navigate('/officer-login')
    }

    const open = incidents.filter(i => i.status === 'FILED').length
    const inProgress = incidents.filter(i => i.status === 'IN_PROGRESS').length
    const resolved = incidents.filter(i => i.status === 'RESOLVED').length
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length

    const STATUS_COLOR = { FILED: '#f87171', IN_PROGRESS: '#fbbf24', RESOLVED: '#34d399' }

    return (
        <div style={{ padding: '1.5rem 0', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Page Header */}
            <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,146,60,0.2))',
                        border: '1px solid rgba(251,191,36,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        boxShadow: '0 0 20px rgba(251,191,36,0.15)',
                    }}>👮</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                            Officer Dashboard
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {session?.fullName} · Badge {session?.badgeNumber} · {session?.station || 'No station'}
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} style={{
                    padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                    background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--accent-rose)', cursor: 'pointer',
                }}>Logout</button>
            </div>

            {/* Stats Row */}
            <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.875rem', marginBottom: '1.5rem', animationDelay: '0.05s' }}>
                {[
                    { label: 'Open Cases', value: open, icon: '📋', color: '#f87171', glow: 'rgba(248,113,113,0.15)' },
                    { label: 'In Progress', value: inProgress, icon: '🔄', color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
                    { label: 'Resolved', value: resolved, icon: '✅', color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
                    { label: 'CRITICAL Alerts', value: criticalAlerts, icon: '🚨', color: '#f87171', glow: 'rgba(248,113,113,0.15)' },
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{
                        padding: '1rem', textAlign: 'center',
                        background: `radial-gradient(circle at 50% 0%, ${s.glow}, transparent 70%)`,
                        transition: 'transform 0.2s',
                    }}>
                        <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 900, color: s.color, fontFamily: "'Outfit',sans-serif" }}>{s.value}</p>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div className="animate-fade-in-up" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', animationDelay: '0.1s' }}>
                {[['incidents', '📋 Incidents'], ['alerts', '🚨 Live Alerts'], ['chat', '💬 Chat']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)} style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.825rem', fontWeight: 700,
                        background: activeTab === key ? 'rgba(251,191,36,0.1)' : 'transparent',
                        border: activeTab === key ? '1px solid rgba(251,191,36,0.3)' : '1px solid var(--border-subtle)',
                        color: activeTab === key ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
            </div>

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
                <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: selectedIncident ? '1fr 1fr' : '1fr', gap: '1rem', animationDelay: '0.15s' }}>
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>All Incidents</h2>
                        </div>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</div>
                        ) : incidents.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <span style={{ fontSize: '2rem' }}>📋</span>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>No incidents found</p>
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
                                {incidents.map(inc => (
                                    <div key={inc.id}
                                        onClick={() => setSelectedIncident(selectedIncident?.id === inc.id ? null : inc)}
                                        style={{
                                            padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                                            cursor: 'pointer', transition: 'background 0.15s',
                                            background: selectedIncident?.id === inc.id ? 'rgba(251,191,36,0.05)' : 'transparent',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = selectedIncident?.id === inc.id ? 'rgba(251,191,36,0.05)' : 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{inc.firNumber}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', color: STATUS_COLOR[inc.status] || '#94a3b8', background: `${STATUS_COLOR[inc.status]}18` }}>
                                                {inc.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inc.touristName}</p>
                                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {new Date(inc.createdAt).toLocaleString()}
                                        </p>
                                        {inc.status !== 'RESOLVED' && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                                                {inc.status === 'FILED' && (
                                                    <button onClick={e => { e.stopPropagation(); handleStatus(inc.id, 'IN_PROGRESS') }}
                                                        disabled={updating === inc.id}
                                                        style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                                                        Start
                                                    </button>
                                                )}
                                                <button onClick={e => { e.stopPropagation(); handleStatus(inc.id, 'RESOLVED') }}
                                                    disabled={updating === inc.id}
                                                    style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                                                    Resolve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat panel for selected incident */}
                    {selectedIncident && (
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg,rgba(251,191,36,0.07),transparent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            Chat — {selectedIncident.touristName}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {selectedIncident.firNumber}
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedIncident(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                                </div>
                            </div>
                            <OfficerChatPanel
                                incidentId={selectedIncident.id}
                                touristName={selectedIncident.touristName}
                                myId={session?.officerId}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Live Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.1s' }}>
                    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.8)', display: 'inline-block', animation: 'dotPulse 1.5s infinite' }} />
                        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Critical Alerts</h2>
                    </div>
                    {alerts.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>🟢</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>All clear. No critical alerts.</p>
                        </div>
                    ) : (
                        <div style={{ overflowY: 'auto', maxHeight: '480px' }}>
                            {alerts.map((a, i) => (
                                <div key={i} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.severity === 'CRITICAL' ? '🚨' : '⚠️'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: a.severity === 'CRITICAL' ? 'var(--accent-rose)' : '#fbbf24' }}>{a.type}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>·</span>
                                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', background: a.severity === 'CRITICAL' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)', color: a.severity === 'CRITICAL' ? 'var(--accent-rose)' : '#fbbf24', fontWeight: 700 }}>{a.severity}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.message}</p>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            📍 {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                        {new Date(a.createdAt || Date.now()).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {incidents.filter(i => i.status !== 'RESOLVED').length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>💬</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>No active incident chats.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1rem' }}>
                            {incidents.filter(i => i.status !== 'RESOLVED').map(inc => (
                                <div key={inc.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg,rgba(251,191,36,0.06),transparent)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inc.touristName}</p>
                                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{inc.firNumber}</p>
                                    </div>
                                    <OfficerChatPanel incidentId={inc.id} touristName={inc.touristName} myId={session?.officerId} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
