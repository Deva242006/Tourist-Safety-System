import { useState, useEffect, useRef } from 'react'
import client from '../api/client'

export default function NotificationBell() {
    const [alerts, setAlerts] = useState([])
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchAlerts = async () => {
        try {
            const { data } = await client.get('/alerts?status=OPEN')
            setAlerts(data)
        } catch (e) {
            console.error('Failed to fetch alerts', e)
        }
    }

    useEffect(() => {
        fetchAlerts()
        // Simple polling every 30s
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkRead = async (id, e) => {
        e.stopPropagation()
        try {
            await client.patch(`/alerts/${id}/read`)
            setAlerts(prev => prev.filter(a => a.id !== id))
        } catch (error) {
            console.error('Failed to mark as read', error)
        }
    }

    const unreadCount = alerts.filter(a => !a.read).length

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setOpen(!open)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.4rem',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '0',
                        background: 'var(--accent-rose)',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        lineHeight: 1
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-dim)' }}>
                        <strong style={{ color: 'white' }}>Notifications</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                    </div>

                    {alerts.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No new alerts
                        </div>
                    ) : (
                        alerts.map(a => (
                            <div key={a.id} style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: 'white'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <strong style={{ color: a.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                                        {a.type}
                                    </strong>
                                    <button 
                                        onClick={(e) => handleMarkRead(a.id, e)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{a.message}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
