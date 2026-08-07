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
            <div className="glass-card p-5">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No Digital ID found.</p>
            </div>
        )
    }

    return (
        <div className="glass-card p-5 animate-fade-in-up" id="digital-id-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🪪</span>
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Digital Tourist ID</h2>
                </div>
                <span className={digitalId.isValid ? 'badge badge-success' : 'badge badge-danger'}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{
                        background: digitalId.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }} />
                    {digitalId.isValid ? 'Active' : 'Inactive'}
                </span>
            </div>

            <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                    <dt style={{ color: 'var(--text-muted)' }}>Block</dt>
                    <dd className="font-mono text-xs px-2 py-0.5 rounded" style={{
                        background: 'rgba(34, 211, 238, 0.08)',
                        color: 'var(--accent-cyan)'
                    }}>#{digitalId.blockIndex}</dd>
                </div>
                <div className="flex justify-between items-center">
                    <dt style={{ color: 'var(--text-muted)' }}>Hash</dt>
                    <dd className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }} title={digitalId.currentHash}>
                        {truncateHash(digitalId.currentHash)}
                    </dd>
                </div>
                <div className="flex justify-between items-center">
                    <dt style={{ color: 'var(--text-muted)' }}>Issued</dt>
                    <dd className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(digitalId.issuedAt).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between items-center">
                    <dt style={{ color: 'var(--text-muted)' }}>Valid until</dt>
                    <dd className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(digitalId.validUntil).toLocaleString()}</dd>
                </div>
            </dl>

            <button
                onClick={handleVerify}
                disabled={verifying}
                id="verify-id-btn"
                className="btn-ghost mt-4 w-full text-sm"
            >
                {verifying ? 'Verifying...' : '🔐 Verify Integrity'}
            </button>

            {verifyResult && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs animate-slide-down ${
                    verifyResult.chainIntact ? 'badge-success' : 'badge-danger'
                }`} style={{
                    background: verifyResult.chainIntact
                        ? 'rgba(52, 211, 153, 0.08)'
                        : 'rgba(251, 113, 133, 0.08)',
                    border: `1px solid ${verifyResult.chainIntact
                        ? 'rgba(52, 211, 153, 0.2)'
                        : 'rgba(251, 113, 133, 0.2)'}`,
                    color: verifyResult.chainIntact
                        ? 'var(--accent-emerald)'
                        : 'var(--accent-rose)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'block',
                    padding: '0.625rem'
                }}>
                    {verifyResult.chainIntact ? '✓' : '✗'} {verifyResult.message}
                </div>
            )}
        </div>
    )
}