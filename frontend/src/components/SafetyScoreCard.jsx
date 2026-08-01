import { useEffect, useState } from 'react'
import { getMySafetyScore } from '../api/safety'

const LEVEL_STYLE = {
    SAFE: { text: 'text-green-600', bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
    CAUTION: { text: 'text-amber-600', bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
    AT_RISK: { text: 'text-orange-600', bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    CRITICAL: { text: 'text-red-600', bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' }
}

const REFRESH_INTERVAL_MS = 30000

export default function SafetyScoreCard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        function load() {
            getMySafetyScore().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
        }
        load()
        const interval = setInterval(load, REFRESH_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    const style = LEVEL_STYLE[data?.level] || LEVEL_STYLE.SAFE

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold">Safety Score</h2>
                {data && <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>{data.level.replace('_', ' ')}</span>}
            </div>
            {loading ? (
                <p className="text-sm text-slate-400">Calculating...</p>
            ) : !data ? (
                <p className="text-sm text-slate-400">Unable to load score.</p>
            ) : (
                <>
                    <p className={`text-3xl font-bold ${style.text}`}>{data.score}</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 mb-2">
                        <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${data.score}%` }} />
                    </div>
                    <ul className="text-xs text-slate-500 space-y-0.5">
                        {data.factors.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                </>
            )}
        </div>
    )
}