import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom Tourist Pin icon using standard SVG
const createTouristIcon = (isRecent) => new L.DivIcon({
    className: 'custom-tourist-pin',
    html: `<div style="
        width: 24px; 
        height: 24px; 
        background: ${isRecent ? '#38bdf8' : '#94a3b8'}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 ${isRecent ? '12px rgba(56,189,248,0.8)' : '4px rgba(0,0,0,0.2)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    ">👤</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
})

const RISK_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

function Recenter({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, map.getZoom())
    }, [position, map])
    return null
}

function timeAgo(iso) {
    if (!iso) return 'Unknown'
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
}

export default function LiveMap({ zones = [], position, markers = [] }) {
    const [center, setCenter] = useState([26.1445, 91.7362]) // Default Guwahati

    useEffect(() => {
        if (position) {
            setCenter(position)
        } else if (markers.length > 0 && !position) {
            // Recenter to first marker if no explicit position
            setCenter([markers[0].lat, markers[0].lng])
        }
    }, [position, markers])

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
            <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            
            {zones.map((zone) => (
                <Polygon
                    key={zone.id}
                    positions={zone.polygon.map((p) => [p.lat, p.lng])}
                    pathOptions={{ 
                        color: RISK_COLORS[zone.riskLevel] || '#64748b', 
                        fillColor: RISK_COLORS[zone.riskLevel] || '#64748b',
                        fillOpacity: 0.15,
                        weight: 2
                    }}
                >
                    <Popup className="dark-popup">
                        <div style={{ padding: '4px' }}>
                            <strong style={{ color: RISK_COLORS[zone.riskLevel], fontSize: '1.1em' }}>{zone.name}</strong>
                            <div style={{ marginTop: '4px', fontSize: '0.9em', color: '#333' }}>Risk: <b>{zone.riskLevel}</b></div>
                            <div style={{ marginTop: '4px', fontSize: '0.8em', color: '#666' }}>{zone.description}</div>
                        </div>
                    </Popup>
                </Polygon>
            ))}

            {position && (
                <Marker position={position} icon={createTouristIcon(true)}>
                    <Popup>You are here</Popup>
                </Marker>
            )}

            {markers.map((m) => {
                const isRecent = m.timestamp ? (Date.now() - new Date(m.timestamp).getTime()) < 60000 : true
                return (
                    <Marker key={m.id} position={[m.lat, m.lng]} icon={createTouristIcon(isRecent)}>
                        <Popup className="dark-popup">
                            <div style={{ padding: '2px', minWidth: '120px' }}>
                                <strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>{m.label || 'Tourist'}</strong>
                                <div style={{ fontSize: '0.85em', color: '#444' }}>
                                    Last seen: <b>{timeAgo(m.timestamp)}</b>
                                </div>
                                <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px', fontFamily: 'monospace' }}>
                                    {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
            <Recenter position={center} />
        </MapContainer>
    )
}
