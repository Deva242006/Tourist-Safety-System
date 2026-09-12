import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDigitalId, getSession } from '../api/auth'
import { getZones, checkLocation } from '../api/zones'
import { connectSocket, disconnectSocket, sendLocationUpdate, sendSos } from '../api/socket'
import { getMyIncidents } from '../api/incidents'
import DigitalIdCard from '../components/DigitalIdCard.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import AddZoneForm from '../components/AddZoneForm.jsx'
import SafetyScoreCard from '../components/SafetyScoreCard.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import GroupPanel from '../components/GroupPanel.jsx'

const LOCATION_PUSH_INTERVAL_MS = 15000

export default function TouristDashboard() {
    const [digitalId, setDigitalId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [zones, setZones] = useState([])
    const [position, setPosition] = useState(null)
    const [checkResult, setCheckResult] = useState(null)
    const [checking, setChecking] = useState(false)
    const [sosSent, setSosSent] = useState(false)
    const [activeIncident, setActiveIncident] = useState(null) // incident with assigned officer for chat
    const navigate = useNavigate()
    const session = getSession()

    const loadZones = useCallback(() => {
        getZones().then(setZones).catch(() => setZones([]))
    }, [])

    useEffect(() => {
        if (!session) { navigate('/login'); return }
        getMyDigitalId().then(setDigitalId).catch(() => setDigitalId(null)).finally(() => setLoading(false))
        loadZones()
        // Load tourist's open incidents to find one with assigned officer (for chat)
        getMyIncidents?.().then(incidents => {
            const withOfficer = incidents?.find(i => i.officerId && i.status !== 'RESOLVED')
            if (withOfficer) setActiveIncident(withOfficer)
        }).catch(() => {})
    }, [navigate, loadZones, session?.touristId])

    useEffect(() => {
        if (!session) return
        connectSocket()
        function pushLocation() {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
                sendLocationUpdate(session.touristId, latitude, longitude)
            }, (err) => {
                console.warn("Location error:", err)
            }, { enableHighAccuracy: true })
        }
        pushLocation()
        const interval = setInterval(pushLocation, LOCATION_PUSH_INTERVAL_MS)
        return () => { clearInterval(interval); disconnectSocket() }
    }, [session?.touristId])

    function handleCheckLocation() {
        if (!navigator.geolocation) { alert('Geolocation is not supported by this browser.'); return }
        setChecking(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
                try {
                    const result = await checkLocation(latitude, longitude)
                    setCheckResult(result)
                } catch {
                    setCheckResult({ insideAnyZone: false, matchedZones: [], error: true })
                } finally { setChecking(false) }
            },
            () => { setChecking(false); alert('Could not get your location. Check browser location permissions.') },
            { enableHighAccuracy: true }
        )
    }

    function handleSos() {
        if (!navigator.geolocation) { alert('Geolocation is not supported.'); return }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                sendSos(session.touristId, latitude, longitude, 'Emergency SOS triggered from tourist app')
                setSosSent(true)
                setTimeout(() => setSosSent(false), 5000)
            },
            () => alert('Could not get your location for SOS. Check browser location permissions.'),
            { enableHighAccuracy: true }
        )
    }

    return (
        <div style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            {/* Welcome banner */}
            <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
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
                            Tourist Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                            Your real-time safety overview
                        </p>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        background: position
                            ? 'rgba(52, 211, 153, 0.08)'
                            : 'rgba(251, 191, 36, 0.08)',
                        border: `1px solid ${position ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    }}>
                        <span style={{
                            width: '7px', height: '7px',
                            borderRadius: '50%',
                            background: position ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                            boxShadow: position ? '0 0 8px rgba(52,211,153,0.8)' : '0 0 8px rgba(251,191,36,0.8)',
                            animation: 'dotPulse 2s ease-in-out infinite',
                            flexShrink: 0,
                        }} />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: position ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                        }}>
                            {position ? `Tracking · every ${LOCATION_PUSH_INTERVAL_MS / 1000}s` : 'Waiting for GPS...'}
                        </span>
                    </div>
                    <button onClick={() => navigate('/tourist/profile')} style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-dim)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        👤 My Profile
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                    {/* Map Panel */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Safety Map</h2>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real-time zone tracking</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <AddZoneForm onCreated={loadZones} />
                                <button
                                    onClick={handleCheckLocation}
                                    disabled={checking}
                                    id="check-location-btn"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.825rem',
                                        fontWeight: 600,
                                        color: '#04060d',
                                        background: 'linear-gradient(135deg, #38bdf8, #60a5fa)',
                                        border: 'none',
                                        cursor: checking ? 'wait' : 'pointer',
                                        opacity: checking ? 0.7 : 1,
                                        transition: 'all 0.25s',
                                        boxShadow: '0 2px 12px rgba(56,189,248,0.25)',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    {checking ? (
                                        <>
                                            <span style={{
                                                width: '12px', height: '12px',
                                                border: '2px solid rgba(4,6,13,0.3)',
                                                borderTopColor: '#04060d',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                animation: 'spin 0.8s linear infinite',
                                            }} />
                                            Checking...
                                        </>
                                    ) : (
                                        <>📍 Check Location</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '340px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                            <ZoneMap zones={zones} position={position} />
                        </div>

                        {checkResult && (
                            <div className="animate-slide-down" style={{
                                marginTop: '0.875rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                background: checkResult.insideAnyZone
                                    ? 'rgba(248, 113, 113, 0.08)'
                                    : 'rgba(52, 211, 153, 0.06)',
                                border: `1px solid ${checkResult.insideAnyZone ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.15)'}`,
                                color: checkResult.insideAnyZone ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                                fontSize: '0.825rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                            }}>
                                <span>{checkResult.insideAnyZone ? '⚠️' : '✅'}</span>
                                <span>
                                    {checkResult.error ? 'Location check failed.' :
                                        checkResult.insideAnyZone
                                            ? `Inside ${checkResult.matchedZones.length} risk zone(s): ${checkResult.matchedZones.map(z => `${z.zoneName} (${z.riskLevel})`).join(', ')}`
                                            : 'No risk zones at your current location. You are safe.'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid var(--border-dim)',
                                        borderTopColor: 'var(--accent-cyan)',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading Digital ID...</span>
                                </div>
                            </div>
                        ) : (
                            <DigitalIdCard digitalId={digitalId} />
                        )}
                        <SafetyScoreCard />

                        {/* SOS Button */}
                        <button
                            onClick={handleSos}
                            id="sos-btn"
                            className="animate-sos-pulse"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                                color: 'white',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '14px',
                                padding: '1.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.3s',
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        >
                            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🆘</span>
                            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>SOS Emergency</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500 }}>Tap to alert authorities</span>
                        </button>

                        {sosSent && (
                            <div className="animate-slide-down" style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                background: 'rgba(52, 211, 153, 0.08)',
                                border: '1px solid rgba(52, 211, 153, 0.2)',
                                color: 'var(--accent-emerald)',
                                fontSize: '0.825rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                textAlign: 'center',
                                justifyContent: 'center',
                            }}>
                                ✓ SOS sent — authorities have been notified
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat + Groups Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
                    <ChatPanel
                        incidentId={activeIncident?.id || null}
                        myId={session?.touristId}
                        myRole="TOURIST"
                        officerName={activeIncident?.officerName || null}
                    />
                    <GroupPanel myId={session?.touristId} />
                </div>
        </div>
    )
}