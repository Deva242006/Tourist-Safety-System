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
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2">
      {sent && <p className="bg-white shadow-lg rounded px-3 py-1.5 text-xs text-red-600 font-medium">✓ SOS sent — authorities notified</p>}
      <button
        onClick={handleSos}
        title="Send Emergency SOS"
        className="bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full w-16 h-16 shadow-lg font-bold text-xs flex flex-col items-center justify-center transition-transform animate-pulse"
      >
        <span className="text-lg leading-none">🆘</span>
        SOS
      </button>
    </div>
  )
}