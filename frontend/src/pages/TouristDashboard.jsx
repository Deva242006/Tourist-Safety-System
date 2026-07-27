export default function TouristDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
        <h2 className="font-semibold mb-2">Live Map</h2>
        <div className="h-80 bg-slate-100 rounded flex items-center justify-center text-slate-400">
          Leaflet map mounts here (Day 3)
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-1">Safety Score</h2>
          <p className="text-3xl font-bold text-risk-low">— </p>
          <p className="text-xs text-slate-400">Computed Day 5 (anomaly detection)</p>
        </div>
        <button className="bg-red-600 text-white rounded-lg shadow p-4 font-semibold text-lg">
          🆘 SOS (wired Day 4)
        </button>
      </div>
    </div>
  )
}
