import { useEffect, useState } from 'react'
import { getMySafetyScore } from '../api/safety'

const LEVEL_CONFIG = {
    SAFE: {
        color: '#34d399',
        gradient: 'linear-gradient(90deg, #34d399 0%, #38bdf8 100%)',
        glow: 'rgba(52, 211, 153, 0.3)',
        bgGlow: 'rgba(52, 211, 153, 0.06)',
        badgeClass: 'badge-success',
        icon: '🛡️',
        label: 'Safe',
    },
    CAUTION: {
        color: '#fbbf24',
        gradient: 'linear-gradient(90deg, #fbbf24 0%, #fb923c 100%)',
        glow: 'rgba(251, 191, 36, 0.3)',
        bgGlow: 'rgba(251, 191, 36, 0.05)',
        badgeClass: 'badge-warning',
        icon: '⚠️',
        label: 'Caution',
    },
    AT_RISK: {
        color: '#fb923c',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #f87171 100%)',
        glow: 'rgba(251, 146, 60, 0.3)',
        bgGlow: 'rgba(251, 146, 60, 0.05)',
        badgeClass: 'badge-warning',
        icon: '🔶',
        label: 'At Risk',
    },
    CRITICAL: {
        color: '#f87171',
        gradient: 'linear-gradient(90deg, #f87171 0%, #ec4899 100%)',
        glow: 'rgba(248, 113, 113, 0.3)',
        bgGlow: 'rgba(248, 113, 113, 0.06)',
        badgeClass: 'badge-danger',
        icon: '🚨',
        label: 'Critical',
    },
}

const REFRESH_INTERVAL_MS = 30000

export default function SafetyScoreCard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        function load() {
            getMySafetyScore()
                .then(setData)
                .catch(() => setData(null))
                .finally(() => setLoading(false))
        }
        load()
        const interval = setInterval(load, REFRESH_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    const cfg = LEVEL_CONFIG[data?.level] || LEVEL_CONFIG.SAFE

    return (
        <div className="glass-card animate-fade-in-up" id="safety-score-card" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.1s' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                background: data ? `linear-gradient(135deg, ${cfg.bgGlow} 0%, transparent 100%)` : 'transparent',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.5s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Safety Score
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Updates every {REFRESH_INTERVAL_MS / 1000}s
                        </p>
                    </div>
                </div>
                {data && (
                    <span className={`badge ${cfg.badgeClass}`}>
                        {cfg.icon} {cfg.label}
                    </span>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: '1.25rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            width: '16px', height: '16px',
                            border: '2px solid var(--border-dim)',
                            borderTopColor: 'var(--accent-cyan)',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Calculating score...</span>
                    </div>
                ) : !data ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Unable to load score.</p>
                ) : (
                    <>
                        {/* Score display */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '1rem' }}>
                            <span style={{
                                fontSize: '3rem',
                                fontWeight: 900,
                                lineHeight: 1,
                                color: cfg.color,
                                letterSpacing: '-0.04em',
                                textShadow: `0 0 24px ${cfg.glow}`,
                                transition: 'all 0.5s',
                                fontFamily: "'Outfit', sans-serif",
                            }}>
                                {data.score}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>/100</span>
                        </div>

                        {/* Progress bar */}
                        <div className="progress-track" style={{ marginBottom: '1rem' }}>
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${data.score}%`,
                                    background: cfg.gradient,
                                    boxShadow: `0 0 10px ${cfg.glow}`,
                                }}
                            />
                        </div>

                        {/* Factors */}
                        {data.factors && data.factors.length > 0 && (
                            <div>
                                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                                    Factors
                                </p>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {data.factors.map((f, i) => (
                                        <li key={i} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.5rem',
                                            fontSize: '0.775rem',
                                            color: 'var(--text-muted)',
                                            lineHeight: 1.5,
                                        }}>
                                            <span style={{
                                                color: cfg.color,
                                                flexShrink: 0,
                                                marginTop: '2px',
                                                fontSize: '0.6rem',
                                            }}>▸</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}