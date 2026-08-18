function formatDate(iso) {
    return iso ? new Date(iso).toLocaleDateString() : '—'
}

export default function TouristTable({ tourists }) {
    if (tourists.length === 0) {
        return <p className="text-sm text-slate-500">No registered tourists yet.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="text-left border-b border-slate-700/50">
                    <th className="pb-2.5 pr-4 text-xs font-semibold tracking-wider uppercase text-slate-400">Name</th>
                    <th className="pb-2.5 pr-4 text-xs font-semibold tracking-wider uppercase text-slate-400">Document #</th>
                    <th className="pb-2.5 pr-4 text-xs font-semibold tracking-wider uppercase text-slate-400">Phone</th>
                    <th className="pb-2.5 pr-4 text-xs font-semibold tracking-wider uppercase text-slate-400">Trip Start</th>
                    <th className="pb-2.5 text-xs font-semibold tracking-wider uppercase text-slate-400">Trip End</th>
                </tr>
                </thead>
                <tbody>
                {tourists.map((t) => (
                    <tr key={t.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/25 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-slate-200">{t.fullName}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-cyan-400">{t.documentNumber}</td>
                        <td className="py-2.5 pr-4 text-slate-300">{t.phone || '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-300">{formatDate(t.tripStart)}</td>
                        <td className="py-2.5 text-slate-300">{formatDate(t.tripEnd)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}