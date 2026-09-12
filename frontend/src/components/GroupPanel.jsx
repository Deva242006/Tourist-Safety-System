import { useState, useEffect } from 'react'
import { createGroup, getMyGroups, joinGroup, leaveGroup } from '../api/groups'

export default function GroupPanel({ myId }) {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({ name: '', description: '' })
    const [joinId, setJoinId] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [expanded, setExpanded] = useState(null)

    useEffect(() => { load() }, [])

    function load() {
        setLoading(true)
        getMyGroups().then(setGroups).catch(() => setGroups([])).finally(() => setLoading(false))
    }

    function flash(msg, isError = false) {
        if (isError) { setError(msg); setTimeout(() => setError(''), 3500) }
        else { setSuccess(msg); setTimeout(() => setSuccess(''), 3500) }
    }

    async function handleCreate(e) {
        e.preventDefault()
        setCreating(true)
        try {
            await createGroup(form)
            setForm({ name: '', description: '' })
            flash('Group created!')
            load()
        } catch { flash('Failed to create group', true) }
        finally { setCreating(false) }
    }

    async function handleJoin(e) {
        e.preventDefault()
        if (!joinId.trim()) return
        try {
            await joinGroup(joinId.trim())
            flash('Joined group!'); setJoinId(''); load()
        } catch { flash('Invalid group ID or already a member', true) }
    }

    async function handleLeave(groupId) {
        if (!confirm('Leave this group?')) return
        try { await leaveGroup(groupId); flash('Left group'); load() }
        catch { flash('Could not leave group', true) }
    }

    return (
        <div className="glass-card animate-fade-in-up" id="group-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                background: 'linear-gradient(135deg,rgba(129,140,248,0.07) 0%,transparent 100%)',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
                <span style={{ fontSize: '1rem' }}>👥</span>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Travel Groups</h3>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>Create or join a travel group</p>
                </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Feedback */}
                {error && <div style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--accent-rose)', fontSize: '0.775rem' }}>{error}</div>}
                {success && <div style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--accent-emerald)', fontSize: '0.775rem' }}>{success}</div>}

                {/* Create Group Form */}
                <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Create New Group</p>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input className="glass-input" placeholder="Group name" required value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.825rem' }} />
                        <input className="glass-input" placeholder="Description (optional)" value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.825rem' }} />
                        <button type="submit" disabled={creating} style={{
                            padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                            background: 'linear-gradient(135deg,#818cf8,#a78bfa)', color: 'white',
                            border: 'none', cursor: 'pointer', opacity: creating ? 0.6 : 1,
                        }}>
                            {creating ? 'Creating...' : '+ Create Group'}
                        </button>
                    </form>
                </div>

                {/* Join Group */}
                <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Join by Group ID</p>
                    <form onSubmit={handleJoin} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="glass-input" placeholder="Paste group ID..." value={joinId}
                            onChange={e => setJoinId(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }} />
                        <button type="submit" style={{
                            padding: '0.5rem 0.875rem', borderRadius: '8px', fontSize: '0.775rem', fontWeight: 700,
                            background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)',
                            color: 'var(--accent-cyan)', cursor: 'pointer',
                        }}>Join</button>
                    </form>
                </div>

                {/* My Groups List */}
                <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        My Groups ({groups.length})
                    </p>
                    {loading ? (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <span style={{ width: '12px', height: '12px', border: '2px solid var(--border-dim)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                            Loading...
                        </div>
                    ) : groups.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No groups yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {groups.map(g => (
                                <div key={g.id} style={{
                                    borderRadius: '10px', border: '1px solid var(--border-subtle)',
                                    background: 'rgba(255,255,255,0.02)', overflow: 'hidden',
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.625rem 0.875rem', cursor: 'pointer',
                                    }} onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '8px',
                                                background: 'linear-gradient(135deg,rgba(129,140,248,0.15),rgba(167,139,250,0.15))',
                                                border: '1px solid rgba(129,140,248,0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                                            }}>👥</div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                    Led by {g.leaderName} · {g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{expanded === g.id ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {expanded === g.id && (
                                        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '0.75rem 0.875rem', background: 'rgba(0,0,0,0.1)' }}>
                                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                {g.description || 'No description'}
                                            </p>
                                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Members:</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                                                {g.members?.map(m => (
                                                    <span key={m.id} style={{
                                                        padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.68rem',
                                                        background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.15)',
                                                        color: 'var(--text-secondary)',
                                                    }}>{m.fullName}</span>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    ID: {g.id}
                                                </span>
                                                <button onClick={() => { navigator.clipboard.writeText(g.id); flash('Group ID copied!') }}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                    Copy ID
                                                </button>
                                                {g.leaderId !== myId && (
                                                    <button onClick={() => handleLeave(g.id)}
                                                        style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                                                        Leave
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
