import { useEffect, useState } from 'react'
import { getMySafetyScore } from '../api/safety'

const LEVEL_STYLE = {
    SAFE: {
        color: 'var(--accent-emerald)',
        bar: 'linear-gradient(90deg, #34d399 0%, #22d3ee 100%)',
        badgeClass: 'badge-success',
        glow: 'rgba(52, 211, 153, 0.15)'
    },
    CAUTION: {
        color: 'var(--accent-amber)',
        bar: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
        badgeClass: 'badge-warning',
        glow: 'rgba(251, 191, 36, 0.15)'
    },
    AT_RISK: {
        color: '#f97316',
        bar: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
        badgeClass: 'badge-warning',
        glow: 'rgba(249, 115, 22, 0.15)'
    },
    CRITICAL: {
        color: 'var(--accent-rose)',
        bar: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
        badgeClass: 'badge-danger',
        glow: 'rgba(239, 68, 68, 0.15)'
    }
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
        <div className="glass-card p-5 animate-fade-in-up" id="safety-score-card" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Safety Score</h2>
                </div>
                {data && <span className={`badge ${style.badgeClass}`}>{data.level.replace('_', ' ')}</span>}
            </div>

            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-cyan)', borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Calculating...</p>
                </div>
            ) : !data ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Unable to load score.</p>
            ) : (
                <>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="stat-value" style={{ color: style.color }}>{data.score}</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'rgba(148, 163, 184, 0.08)' }}>
                        <div
                            className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${data.score}%`,
                                background: style.bar,
                                boxShadow: `0 0 8px ${style.glow}`
                            }}
                        />
                    </div>

                    <ul className="space-y-1">
                        {data.factors.map((f, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>›</span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}