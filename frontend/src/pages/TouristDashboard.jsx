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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h2 className="font-semibold">Live Map</h2>
                    <div className="flex gap-2">
                        <AddZoneForm onCreated={loadZones} />
                        <button onClick={handleCheckLocation} disabled={checking} className="text-sm bg-slate-900 text-white rounded px-3 py-2 disabled:opacity-50">
                            {checking ? 'Checking...' : '📍 Check My Location'}
                        </button>
                    </div>
                </div>
                <div className="h-80 rounded overflow-hidden">
                    <ZoneMap zones={zones} position={position} />
                </div>
                {checkResult && (
                    <p className={`mt-2 text-sm ${checkResult.insideAnyZone ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {checkResult.error ? 'Location check failed.' :
                            checkResult.insideAnyZone ? `⚠️ Inside ${checkResult.matchedZones.length} risk zone(s): ${checkResult.matchedZones.map(z => `${z.zoneName} (${z.riskLevel})`).join(', ')}` :
                                'No risk zones at this location.'}
                    </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                    {position ? `Live tracking active — pushing location every ${LOCATION_PUSH_INTERVAL_MS / 1000}s` : 'Waiting for location...'}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {loading ? <div className="bg-white rounded-lg shadow p-4 text-sm text-slate-400">Loading Digital ID...</div> : <DigitalIdCard digitalId={digitalId} />}
                <SafetyScoreCard />
                <button onClick={handleSos} className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow p-4 font-semibold text-lg transition-colors">
                    🆘 SOS
                </button>
                {sosSent && <p className="text-sm text-red-600 text-center -mt-2">✓ SOS sent — authorities have been notified</p>}
            </div>
        </div>
    )
}