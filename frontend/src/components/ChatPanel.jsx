import { useState, useEffect, useRef } from 'react'
import { getChatHistory, markChatRead } from '../api/chat'
import { subscribeToChat, sendChatMessage, connectSocket } from '../api/socket'

export default function ChatPanel({ incidentId, myId, myRole, officerName }) {
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const bottomRef = useRef(null)
    const subRef = useRef(null)

    useEffect(() => {
        if (!incidentId) return
        getChatHistory(incidentId)
            .then(setMessages)
            .catch(() => setMessages([]))
            .finally(() => setLoading(false))

        markChatRead(incidentId).catch(() => {})

        // Subscribe to live messages
        connectSocket()
        setTimeout(() => {
            const sub = subscribeToChat(incidentId, (msg) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev
                    return [...prev, msg]
                })
            })
            if (sub) { subRef.current = sub; setConnected(true) }
        }, 500)

        return () => { subRef.current?.unsubscribe?.() }
    }, [incidentId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function handleSend(e) {
        e.preventDefault()
        if (!text.trim() || !connected) return
        sendChatMessage(incidentId, text.trim(), myRole)
        setText('')
    }

    if (!incidentId) return (
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Chat becomes available once an officer is assigned to your incident.
            </p>
        </div>
    )

    return (
        <div className="glass-card animate-fade-in-up" id="chat-panel"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px' }}>

            {/* Header */}
            <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1rem' }}>💬</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Officer Chat
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {officerName ? `With ${officerName}` : 'Secure messaging channel'}
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '9999px',
                    background: connected ? 'rgba(52,211,153,0.1)' : 'rgba(148,163,184,0.1)',
                    border: `1px solid ${connected ? 'rgba(52,211,153,0.25)' : 'rgba(148,163,184,0.2)'}`,
                    color: connected ? 'var(--accent-emerald)' : 'var(--text-muted)',
                }}>
                    {connected ? '● Live' : '○ Connecting...'}
                </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid var(--border-dim)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: '0.8rem' }}>Loading messages...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔒</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No messages yet. Start the conversation.</p>
                    </div>
                ) : messages.map((msg) => {
                    const isMe = msg.senderId === myId
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '75%',
                                padding: '0.5rem 0.875rem',
                                borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                background: isMe
                                    ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))'
                                    : 'rgba(255,255,255,0.05)',
                                border: isMe ? '1px solid rgba(56,189,248,0.25)' : '1px solid var(--border-subtle)',
                                fontSize: '0.825rem',
                                color: 'var(--text-primary)',
                                lineHeight: 1.5,
                            }}>
                                {msg.message}
                            </div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                                {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
                padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)',
                display: 'flex', gap: '0.5rem', flexShrink: 0,
                background: 'rgba(255,255,255,0.01)',
            }}>
                <input
                    type="text"
                    className="glass-input"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 0.875rem', borderRadius: '10px', fontSize: '0.825rem' }}
                />
                <button type="submit" disabled={!text.trim() || !connected}
                    style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                        color: '#04060d', border: 'none', cursor: 'pointer',
                        opacity: (!text.trim() || !connected) ? 0.5 : 1, transition: 'opacity 0.2s',
                        flexShrink: 0,
                    }}>
                    Send
                </button>
            </form>
        </div>
    )
}
