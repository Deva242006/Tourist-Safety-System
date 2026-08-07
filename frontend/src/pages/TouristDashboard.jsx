import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDigitalId, getSession } from '../api/auth'
import { getZones, checkLocation } from '../api/zones'
import { connectSocket, disconnectSocket, sendLocationUpdate, sendSos } from '../api/socket'
import DigitalIdCard from '../components/DigitalIdCard.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import AddZoneForm from '../components/AddZoneForm.jsx'
import SafetyScoreCard from '../components/SafetyScoreCard.jsx'

const LOCATION_PUSH_INTERVAL_MS = 15000

export default function TouristDashboard() {
    const [digitalId, setDigitalId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [zones, setZones] = useState([])
    const [position, setPosition] = useState(null)
    const [checkResult, setCheckResult] = useState(null)
    const [checking, setChecking] = useState(false)
    const [sosSent, setSosSent] = useState(false)
    const navigate = useNavigate()
    const session = getSession()

    const loadZones = useCallback(() => {
        getZones().then(setZones).catch(() => setZones([]))
    }, [])

    useEffect(() => {
        if (!session) {
            navigate('/login')
            return
        }
        getMyDigitalId().then(setDigitalId).catch(() => setDigitalId(null)).finally(() => setLoading(false))
        loadZones()
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
            })
        }

        pushLocation()
        const interval = setInterval(pushLocation, LOCATION_PUSH_INTERVAL_MS)

        return () => {
            clearInterval(interval)
            disconnectSocket()
        }
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
                } finally {
                    setChecking(false)
                }
            },
            () => { setChecking(false); alert('Could not get your location. Check browser location permissions.') }
        )
    }

    function handleSos() {
        if (!navigator.geolocation) { alert('Geolocation is not supported by this browser.'); return }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                sendSos(session.touristId, latitude, longitude, 'Emergency SOS triggered from tourist app')
                setSosSent(true)
                setTimeout(() => setSosSent(false), 5000)
            },
            () => alert('Could not get your location for SOS. Check browser location permissions.')
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="glass-panel rounded-xl p-5 md:col-span-2">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h2 className="font-bold text-sm tracking-wider uppercase text-slate-300">🗺️ Live Map</h2>
                    <div className="flex gap-2">
                        <AddZoneForm onCreated={loadZones} />
                        <button onClick={handleCheckLocation} disabled={checking}
                                className="text-sm bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-lg px-4 py-2 disabled:opacity-50 transition-all duration-200 shadow-md shadow-cyan-500/15 font-medium">
                            {checking ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Checking...
                                </span>
                            ) : '📍 Check My Location'}
                        </button>
                    </div>
                </div>
                <div className="h-80 rounded-lg overflow-hidden border border-slate-800/60">
                    <ZoneMap zones={zones} position={position} />
                </div>
                {checkResult && (
                    <div className={`mt-3 text-sm px-4 py-2.5 rounded-lg ${checkResult.insideAnyZone
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400'}`}>
                        {checkResult.error ? '⚠ Location check failed.' :
                            checkResult.insideAnyZone ? `⚠️ Inside ${checkResult.matchedZones.length} risk zone(s): ${checkResult.matchedZones.map(z => `${z.zoneName} (${z.riskLevel})`).join(', ')}` :
                                '✓ No risk zones at this location.'}
                    </div>
                )}
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                    {position ? (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live tracking active — pushing location every {LOCATION_PUSH_INTERVAL_MS / 1000}s
                        </>
                    ) : (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Waiting for location...
                        </>
                    )}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="glass-panel rounded-xl p-5">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></span>
                            Loading Digital ID...
                        </div>
                    </div>
                ) : <DigitalIdCard digitalId={digitalId} />}
                <SafetyScoreCard />
                <button onClick={handleSos}
                        className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl shadow-lg p-5 font-bold text-lg transition-all duration-300 animate-sos-pulse">
                    🆘 SOS — Emergency Alert
                </button>
                {sosSent && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2 text-sm text-rose-400 text-center -mt-2">
                        ✓ SOS sent — authorities have been notified
                    </div>
                )}
            </div>
        </div>
    )
}