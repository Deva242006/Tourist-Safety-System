const STATUS_STYLE = {
    FILED: 'bg-slate-100 text-slate-600',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-green-100 text-green-700'
}

export default function IncidentPanel({ incidents, onSelect }) {
    if (incidents.length === 0) {
        return <p className="text-sm text-slate-400">No incidents filed yet.</p>
    }

    return (
        <div className="flex flex-col gap-2">
            {incidents.map((i) => (
                <button
                    key={i.id}
                    onClick={() => onSelect(i.id)}
                    className="text-left border rounded p-2 text-sm hover:bg-slate-50 transition-colors"
                >
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-medium">{i.firNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[i.status] || 'bg-slate-100 text-slate-600'}`}>
              {i.status.replace('_', ' ')}
            </span>
                    </div>
                    <p className="mt-0.5">{i.touristName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(i.createdAt).toLocaleString()}</p>
                </button>
            ))}
        </div>
    )
}