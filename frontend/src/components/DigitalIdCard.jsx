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
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-slate-400">No Digital ID found.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Digital Tourist ID</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${digitalId.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {digitalId.isValid ? 'Active' : 'Inactive'}
        </span>
            </div>

            <dl className="text-sm space-y-1 text-slate-600">
                <div className="flex justify-between">
                    <dt>Block</dt>
                    <dd className="font-mono">#{digitalId.blockIndex}</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Hash</dt>
                    <dd className="font-mono" title={digitalId.currentHash}>{truncateHash(digitalId.currentHash)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Issued</dt>
                    <dd>{new Date(digitalId.issuedAt).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Valid until</dt>
                    <dd>{new Date(digitalId.validUntil).toLocaleString()}</dd>
                </div>
            </dl>

            <button
                onClick={handleVerify}
                disabled={verifying}
                className="mt-3 w-full text-sm bg-slate-100 hover:bg-slate-200 rounded px-3 py-2 disabled:opacity-50"
            >
                {verifying ? 'Verifying...' : 'Verify Integrity'}
            </button>

            {verifyResult && (
                <p className={`mt-2 text-xs ${verifyResult.chainIntact ? 'text-green-600' : 'text-red-600'}`}>
                    {verifyResult.chainIntact ? '✓' : '✗'} {verifyResult.message}
                </p>
            )}
        </div>
    )
}