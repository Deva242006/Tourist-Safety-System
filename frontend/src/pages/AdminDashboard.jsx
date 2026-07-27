export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
        <h2 className="font-semibold mb-2">Tourist Heatmap</h2>
        <div className="h-80 bg-slate-100 rounded flex items-center justify-center text-slate-400">
          Heatmap mounts here (Day 6)
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Alert Feed</h2>
        <p className="text-sm text-slate-400">No alerts yet — WebSocket feed wired Day 4</p>
      </div>
    </div>
  )
}
