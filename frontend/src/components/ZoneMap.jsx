import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
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

// Custom "You" pin icon
const youIcon = new L.DivIcon({
    className: 'custom-you-pin',
    html: `<div style="
        width: 28px; height: 28px;
        background: linear-gradient(135deg, #38bdf8, #818cf8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 16px rgba(56,189,248,0.7), 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; animation: dotPulse 2s ease-in-out infinite;
    ">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
})

// Manual override pin icon
const manualIcon = new L.DivIcon({
    className: 'custom-manual-pin',
    html: `<div style="
        width: 28px; height: 28px;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 16px rgba(245,158,11,0.7), 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
    ">🎯</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
})

function Recenter({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, map.getZoom())
    }, [position, map])
    return null
}

function MapClickHandler({ onMapClick, enabled }) {
    useMapEvents({
        click(e) {
            if (enabled) {
                onMapClick([e.latlng.lat, e.latlng.lng])
            }
        }
    })
    return null
}

export default function ZoneMap({ zones, position, markers = [], accuracy, onManualLocationSet }) {
    // Default center: Coimbatore, Tamil Nadu
    const center = position || (markers[0] && [markers[0].lat, markers[0].lng]) || [11.0168, 76.9558]
    const [manualMode, setManualMode] = useState(false)
    const [manualPosition, setManualPosition] = useState(null)

    const handleMapClick = useCallback((latlng) => {
        setManualPosition(latlng)
        if (onManualLocationSet) {
            onManualLocationSet(latlng)
        }
        setManualMode(false)
    }, [onManualLocationSet])

    const isLowAccuracy = accuracy && accuracy > 1000 // > 1km means IP-based

    return (
        <div style={{ height: '100%', position: 'relative' }}>
            {/* Manual location toggle button */}
            {onManualLocationSet && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }}>
                    <button
                        onClick={() => setManualMode(!manualMode)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: manualMode ? '#04060d' : '#f0f4ff',
                            background: manualMode
                                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                : 'rgba(15, 23, 42, 0.85)',
                            border: manualMode
                                ? '1px solid rgba(251,191,36,0.5)'
                                : '1px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.25s',
                            fontFamily: "'Inter', sans-serif",
                            boxShadow: manualMode
                                ? '0 2px 12px rgba(251,191,36,0.4)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        {manualMode ? '🎯 Click map to set location' : '📍 Set Location Manually'}
                    </button>
                    {manualPosition && (
                        <button
                            onClick={() => {
                                setManualPosition(null)
                                if (onManualLocationSet) onManualLocationSet(null)
                            }}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#f87171',
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.25)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            ✕ Clear manual pin
                        </button>
                    )}
                </div>
            )}

            {/* Low accuracy warning */}
            {isLowAccuracy && !manualPosition && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    zIndex: 1000,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(251,191,36,0.12)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <div>
                        <p style={{
                            margin: 0,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#fbbf24',
                        }}>
                            Low GPS Accuracy (~{(accuracy / 1000).toFixed(1)}km)
                        </p>
                        <p style={{
                            margin: '2px 0 0',
                            fontSize: '0.68rem',
                            color: 'rgba(251,191,36,0.8)',
                        }}>
                            Your browser is using IP-based location. Click "Set Location Manually" to correct your position.
                        </p>
                    </div>
                </div>
            )}

            {/* Crosshair cursor when in manual mode */}
            <MapContainer
                center={center}
                zoom={12}
                style={{
                    height: '100%',
                    width: '100%',
                    cursor: manualMode ? 'crosshair' : 'grab',
                }}
            >
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MapClickHandler onMapClick={handleMapClick} enabled={manualMode} />

                {zones.map((zone) => (
                    <Polygon
                        key={zone.id}
                        positions={zone.polygon.map((p) => [p.lat, p.lng])}
                        pathOptions={{ color: RISK_COLORS[zone.riskLevel] || '#64748b', fillOpacity: 0.25 }}
                    >
                        <Popup><strong>{zone.name}</strong><br />Risk: {zone.riskLevel}<br />{zone.description}</Popup>
                    </Polygon>
                ))}

                {/* GPS position marker with accuracy radius */}
                {position && !manualPosition && (
                    <>
                        <Marker position={position} icon={youIcon}>
                            <Popup>
                                <div style={{ padding: '4px' }}>
                                    <strong style={{ color: '#1e293b' }}>📍 Your Location (GPS)</strong>
                                    <div style={{ marginTop: '4px', fontSize: '0.85em', color: '#475569', fontFamily: 'monospace' }}>
                                        {position[0].toFixed(5)}, {position[1].toFixed(5)}
                                    </div>
                                    {accuracy && (
                                        <div style={{ marginTop: '4px', fontSize: '0.8em', color: accuracy > 1000 ? '#f59e0b' : '#22c55e' }}>
                                            Accuracy: {accuracy > 1000 ? `~${(accuracy / 1000).toFixed(1)}km ⚠️` : `~${Math.round(accuracy)}m ✅`}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                        {/* Accuracy circle */}
                        {accuracy && accuracy > 50 && (
                            <Circle
                                center={position}
                                radius={Math.min(accuracy, 50000)}
                                pathOptions={{
                                    color: accuracy > 1000 ? '#f59e0b' : '#38bdf8',
                                    fillColor: accuracy > 1000 ? '#f59e0b' : '#38bdf8',
                                    fillOpacity: 0.08,
                                    weight: 1,
                                    dashArray: '5,5',
                                }}
                            />
                        )}
                    </>
                )}

                {/* Manual override position */}
                {manualPosition && (
                    <Marker position={manualPosition} icon={manualIcon}>
                        <Popup>
                            <div style={{ padding: '4px' }}>
                                <strong style={{ color: '#1e293b' }}>🎯 Your Location (Manual)</strong>
                                <div style={{ marginTop: '4px', fontSize: '0.85em', color: '#475569', fontFamily: 'monospace' }}>
                                    {manualPosition[0].toFixed(5)}, {manualPosition[1].toFixed(5)}
                                </div>
                                <div style={{ marginTop: '4px', fontSize: '0.8em', color: '#22c55e' }}>
                                    Manually set ✅
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {markers.map((m) => (
                    <Marker key={m.id} position={[m.lat, m.lng]}>
                        <Popup>{m.label || 'Tourist'}</Popup>
                    </Marker>
                ))}
                <Recenter position={manualPosition || position} />
            </MapContainer>
        </div>
    )
}