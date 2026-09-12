import { useState, useEffect, useRef } from 'react'
import { getChatHistory, markChatRead } from '../api/chat'
import { subscribeToChat, sendChatMessage } from '../api/socket'

export default function OfficerChatPanel({ incidentId, touristName, myId }) {
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)
    const subRef = useRef(null)

    useEffect(() => {
        if (!incidentId) return
        getChatHistory(incidentId).then(setMessages).catch(() => setMessages([]))
            .finally(() => setLoading(false))
        markChatRead(incidentId).catch(() => {})

        const sub = subscribeToChat(incidentId, (msg) => {
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        })
        if (sub) subRef.current = sub
        return () => { subRef.current?.unsubscribe?.() }
    }, [incidentId])

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    function handleSend(e) {
        e.preventDefault()
        if (!text.trim()) return
        sendChatMessage(incidentId, text.trim(), 'OFFICER')
        setText('')
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ fontSize: '1.5rem' }}>💬</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>No messages yet with {touristName}</p>
                    </div>
                ) : messages.map((msg) => {
                    const isMe = msg.senderRole === 'OFFICER'
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '80%', padding: '0.4rem 0.75rem',
                                borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                                background: isMe ? 'linear-gradient(135deg,rgba(56,189,248,0.18),rgba(99,102,241,0.18))' : 'rgba(255,255,255,0.05)',
                                border: isMe ? '1px solid rgba(56,189,248,0.2)' : '1px solid var(--border-subtle)',
                                fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5,
                            }}>
                                {msg.message}
                            </div>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '0.15rem', padding: '0 0.2rem' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>
            {/* Input */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <input type="text" className="glass-input" placeholder={`Reply to ${touristName}...`}
                    value={text} onChange={e => setText(e.target.value)}
                    style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }} />
                <button type="submit" disabled={!text.trim()} style={{
                    padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                    background: 'linear-gradient(135deg,#38bdf8,#818cf8)', color: '#04060d',
                    border: 'none', cursor: 'pointer', opacity: !text.trim() ? 0.5 : 1,
                }}>Send</button>
            </form>
        </div>
    )
}
