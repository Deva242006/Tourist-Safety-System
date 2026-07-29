import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDigitalId, getSession } from '../api/auth'
import { getZones, checkLocation } from '../api/zones'
import DigitalIdCard from '../components/DigitalIdCard.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import AddZoneForm from '../components/AddZoneForm.jsx'

export default function TouristDashboard() {
    const [digitalId, setDigitalId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [zones, setZones] = useState([])
    const [position, setPosition] = useState(null)
    const [checkResult, setCheckResult] = useState(null)
    const [checking, setChecking] = useState(false)
    const navigate = useNavigate()

    const loadZones = useCallback(() => {
        getZones().then(setZones).catch(() => setZones([]))
    }, [])

    useEffect(() => {
        const session = getSession()
        if (!session) {
            navigate('/login')
            return
        }
        getMyDigitalId().then(setDigitalId).catch(() => setDigitalId(null)).finally(() => setLoading(false))
        loadZones()
    }, [navigate, loadZones])

    function handleCheckLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.')
            return
        }
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
            </div>
            <div className="flex flex-col gap-4">
                {loading ? <div className="bg-white rounded-lg shadow p-4 text-sm text-slate-400">Loading Digital ID...</div> : <DigitalIdCard digitalId={digitalId} />}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="font-semibold mb-1">Safety Score</h2>
                    <p className="text-3xl font-bold text-risk-low">—</p>
                    <p className="text-xs text-slate-400">Computed Day 5 (anomaly detection)</p>
                </div>
                <button className="bg-red-600 text-white rounded-lg shadow p-4 font-semibold text-lg">🆘 SOS (wired Day 4)</button>
            </div>
        </div>
    )
}