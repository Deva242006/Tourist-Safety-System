function formatDate(iso) {
    return iso ? new Date(iso).toLocaleDateString() : '—'
}

export default function TouristTable({ tourists }) {
    if (tourists.length === 0) {
        return <p className="text-sm text-slate-400">No registered tourists yet.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="text-left text-slate-400 border-b">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Document #</th>
                    <th className="pb-2 pr-4">Phone</th>
                    <th className="pb-2 pr-4">Trip Start</th>
                    <th className="pb-2">Trip End</th>
                </tr>
                </thead>
                <tbody>
                {tourists.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{t.fullName}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{t.documentNumber}</td>
                        <td className="py-2 pr-4">{t.phone || '—'}</td>
                        <td className="py-2 pr-4">{formatDate(t.tripStart)}</td>
                        <td className="py-2">{formatDate(t.tripEnd)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}