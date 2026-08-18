const STATUS_STYLE = {
    FILED: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
    IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    RESOLVED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
}

export default function IncidentPanel({ incidents, onSelect }) {
    if (incidents.length === 0) {
        return <p className="text-sm text-slate-500">No incidents filed yet.</p>
    }

    return (
        <div className="flex flex-col gap-2">
            {incidents.map((i) => (
                <button
                    key={i.id}
                    onClick={() => onSelect(i.id)}
                    className="text-left border border-slate-700/50 rounded-lg p-3 text-sm hover:bg-slate-800/40 hover:border-slate-600/60 transition-all duration-200 group"
                >
                    <div className="flex justify-between items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">{i.firNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[i.status] || 'bg-slate-700/50 text-slate-300'}`}>
                            {i.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="mt-1 text-slate-200 font-medium">{i.touristName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(i.createdAt).toLocaleString()}</p>
                </button>
            ))}
        </div>
    )
}