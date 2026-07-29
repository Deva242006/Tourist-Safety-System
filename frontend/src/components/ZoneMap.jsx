import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})

const RISK_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

function Recenter({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, map.getZoom())
    }, [position, map])
    return null
}

export default function ZoneMap({ zones, position }) {
    const center = position || [26.1445, 91.7362] // default: Guwahati, Assam

    return (
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {zones.map((zone) => (
                <Polygon
                    key={zone.id}
                    positions={zone.polygon.map((p) => [p.lat, p.lng])}
                    pathOptions={{ color: RISK_COLORS[zone.riskLevel] || '#64748b', fillOpacity: 0.25 }}
                >
                    <Popup><strong>{zone.name}</strong><br />Risk: {zone.riskLevel}<br />{zone.description}</Popup>
                </Polygon>
            ))}
            {position && <Marker position={position}><Popup>You are here</Popup></Marker>}
            <Recenter position={position} />
        </MapContainer>
    )
}