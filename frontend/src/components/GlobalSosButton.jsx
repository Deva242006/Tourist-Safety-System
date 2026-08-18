import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getSession } from '../api/auth'
import { connectSocket, sendSos } from '../api/socket'

export default function GlobalSosButton() {
  const [sent, setSent] = useState(false)
  useLocation()
  const session = getSession()

  useEffect(() => {
    if (session) connectSocket()
  }, [session?.touristId])

  if (!session) return null

  function handleSos() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        sendSos(session.touristId, latitude, longitude, 'Emergency SOS triggered')
        setSent(true)
        setTimeout(() => setSent(false), 5000)
      },
      () => alert('Could not get your location for SOS. Check browser location permissions.')
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9998,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.625rem',
    }}>
      {sent && (
        <div className="animate-slide-down" style={{
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(52, 211, 153, 0.12)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          color: 'var(--accent-emerald)',
          fontSize: '0.75rem',
          fontWeight: 700,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}>
          ✓ SOS sent — authorities notified
        </div>
      )}
      <button
        onClick={handleSos}
        title="Send Emergency SOS"
        id="global-sos-btn"
        className="animate-sos-pulse"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <span style={{ fontSize: '22px', lineHeight: 1 }}>🆘</span>
        <span style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1 }}>SOS</span>
      </button>
    </div>
  )
}