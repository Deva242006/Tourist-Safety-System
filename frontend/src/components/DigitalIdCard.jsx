import { useState } from 'react'
import { verifyDigitalId } from '../api/auth'

function truncateHash(hash) {
    if (!hash) return ''
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export default function DigitalIdCard({ digitalId }) {
    const [verifyResult, setVerifyResult] = useState(null)
    const [verifying, setVerifying] = useState(false)

    async function handleVerify() {
        setVerifying(true)
        try {
            const result = await verifyDigitalId(digitalId.touristId)
            setVerifyResult(result)
        } catch {
            setVerifyResult({ chainIntact: false, message: 'Verification request failed' })
        } finally {
            setVerifying(false)
        }
    }

    if (!digitalId) {
        return (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>🪪</span>
                    <span style={{ fontSize: '0.875rem' }}>No Digital ID found.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card animate-fade-in-up" id="digital-id-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Card header with gradient */}
            <div style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(129,140,248,0.08) 100%)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🪪</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Digital Tourist ID
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Blockchain-secured identity
                        </p>
                    </div>
                </div>
                <span className={digitalId.isValid ? 'badge badge-success' : 'badge badge-danger'}>
                    <span style={{
                        width: '5px', height: '5px',
                        borderRadius: '50%',
                        background: digitalId.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        boxShadow: digitalId.isValid ? '0 0 5px rgba(52,211,153,0.8)' : '0 0 5px rgba(248,113,113,0.8)',
                        display: 'inline-block',
                        animation: digitalId.isValid ? 'dotPulse 2s infinite' : 'none',
                    }} />
                    {digitalId.isValid ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '1.25rem' }}>
                <dl style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <InfoRow label="Block Index">
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: 'rgba(56,189,248,0.08)',
                            border: '1px solid rgba(56,189,248,0.15)',
                            color: 'var(--accent-cyan)',
                        }}>#{digitalId.blockIndex}</span>
                    </InfoRow>
                    <InfoRow label="Hash">
                        <span
                            title={digitalId.currentHash}
                            style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.72rem',
                                color: 'var(--text-secondary)',
                                cursor: 'help',
                            }}
                        >
                            {truncateHash(digitalId.currentHash)}
                        </span>
                    </InfoRow>
                    <InfoRow label="Issued">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(digitalId.issuedAt).toLocaleString()}
                        </span>
                    </InfoRow>
                    <InfoRow label="Valid Until" isLast>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(digitalId.validUntil).toLocaleString()}
                        </span>
                    </InfoRow>
                </dl>

                <button
                    onClick={handleVerify}
                    disabled={verifying}
                    id="verify-id-btn"
                    className="btn-ghost"
                    style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                    {verifying ? (
                        <>
                            <span style={{
                                width: '12px', height: '12px',
                                border: '2px solid var(--border-dim)',
                                borderTopColor: 'var(--accent-cyan)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            Verifying...
                        </>
                    ) : (
                        <>🔐 Verify Chain Integrity</>
                    )}
                </button>

                {verifyResult && (
                    <div className="animate-slide-down" style={{
                        marginTop: '0.875rem',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '8px',
                        background: verifyResult.chainIntact ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                        border: `1px solid ${verifyResult.chainIntact ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        color: verifyResult.chainIntact ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}>
                        <span>{verifyResult.chainIntact ? '✓' : '✗'}</span>
                        {verifyResult.message}
                    </div>
                )}
            </div>
        </div>
    )
}

function InfoRow({ label, children, isLast }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.55rem 0',
            borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        }}>
            <dt style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</dt>
            <dd style={{ margin: 0 }}>{children}</dd>
        </div>
    )
}