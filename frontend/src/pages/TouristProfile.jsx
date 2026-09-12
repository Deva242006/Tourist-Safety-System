import { useEffect, useState, useRef } from 'react'
import { getSession } from '../api/auth'
import { getTouristDetail, updateMyContact } from '../api/tourists'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function TouristProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '' })
    const session = getSession()
    const printRef = useRef()

    useEffect(() => {
        if (!session) return
        getTouristDetail(session.touristId)
            .then(data => {
                setProfile(data)
                setFormData({
                    name: data.emergencyContactName || '',
                    phone: data.emergencyContactPhone || ''
                })
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [session])

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateMyContact({
                emergencyContactName: formData.name,
                emergencyContactPhone: formData.phone
            })
            setProfile(prev => ({ ...prev, emergencyContactName: formData.name, emergencyContactPhone: formData.phone }))
            setEditMode(false)
        } catch (e) {
            alert('Failed to update contact.')
        } finally {
            setSaving(false)
        }
    }

    const downloadPdf = async () => {
        if (!printRef.current) return
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`DigitalID_${profile.fullName}.pdf`)
        } catch (e) {
            console.error(e)
            alert('Failed to generate PDF')
        }
    }

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading Profile...</div>
    if (!profile) return <div style={{ padding: '2rem', color: 'red' }}>Error loading profile</div>

    const itinerary = profile.itineraryJson ? JSON.parse(profile.itineraryJson) : null

    return (
        <div style={{ paddingTop: '1.5rem', paddingBottom: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{
                        fontSize: '1.5rem', fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #8ba3c7 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>My Profile</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>Manage your emergency info and itinerary</p>
                </div>
                <button onClick={downloadPdf} style={{
                    padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                }}>📥 Download Digital ID</button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Digital ID Card for PDF Export */}
                <div ref={printRef} className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-cyan)', background: 'linear-gradient(145deg, rgba(4,6,13,1) 0%, rgba(15,23,42,1) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(56,189,248,0.3)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--accent-cyan)' }}>SafeGuard Digital ID</h2>
                        <span style={{ color: 'var(--text-muted)' }}>ID: {profile.id.split('-')[0]}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Full Name</p>
                            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{profile.fullName}</p>
                            
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Document Number</p>
                            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: 'white' }}>{profile.documentNumber}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Trip Dates</p>
                            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: 'white' }}>
                                {new Date(profile.tripStart).toLocaleDateString()} - {new Date(profile.tripEnd).toLocaleDateString()}
                            </p>
                            
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Emergency Contact</p>
                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-rose)' }}>{profile.emergencyContactName || 'None'}</p>
                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-rose)' }}>{profile.emergencyContactPhone || ''}</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact Edit */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'white' }}>Emergency Contact</h3>
                        {!editMode && <button onClick={() => setEditMode(true)} style={{ background: 'transparent', border: '1px solid var(--border-dim)', color: 'white', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>}
                    </div>
                    {editMode ? (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="Contact Name" 
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-dim)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                            />
                            <input 
                                value={formData.phone} 
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                placeholder="Phone Number" 
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-dim)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                            />
                            <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-emerald)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => {
                                setEditMode(false)
                                setFormData({ name: profile.emergencyContactName || '', phone: profile.emergencyContactPhone || '' })
                            }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: '1px solid var(--border-dim)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>
                            <p><strong>Name:</strong> {profile.emergencyContactName || 'Not specified'}</p>
                            <p><strong>Phone:</strong> {profile.emergencyContactPhone || 'Not specified'}</p>
                        </div>
                    )}
                </div>

                {/* Itinerary */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Trip Itinerary</h3>
                    {itinerary ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {itinerary.map((item, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                                    <strong style={{ color: 'white' }}>{item.date}</strong> - {item.location}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No itinerary provided.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
