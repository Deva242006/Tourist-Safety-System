import client from './client'

export async function registerOfficer(payload) {
    const { data } = await client.post('/officer/auth/register', payload)
    return data
}

export async function loginOfficer(payload) {
    const { data } = await client.post('/officer/auth/login', payload)
    return data
}

export async function getOfficers() {
    const { data } = await client.get('/officers')
    return data
}

export async function getOfficer(id) {
    const { data } = await client.get(`/officers/${id}`)
    return data
}

export async function getMyOfficerProfile() {
    const { data } = await client.get('/officers/me')
    return data
}

export function saveOfficerSession(res) {
    localStorage.setItem('officerToken', res.token)
    localStorage.setItem('officerId', res.officerId)
    localStorage.setItem('officerName', res.fullName)
    localStorage.setItem('officerEmail', res.email)
    localStorage.setItem('officerBadge', res.badgeNumber)
    localStorage.setItem('officerRole', res.role)
    localStorage.setItem('officerStation', res.station || '')
    // Also set main token so axios interceptor sends it
    localStorage.setItem('token', res.token)
}

export function clearOfficerSession() {
    ['officerToken', 'officerId', 'officerName', 'officerEmail',
     'officerBadge', 'officerRole', 'officerStation', 'token'].forEach(k => localStorage.removeItem(k))
}

export function getOfficerSession() {
    const token = localStorage.getItem('officerToken')
    if (!token) return null
    return {
        token,
        officerId: localStorage.getItem('officerId'),
        fullName: localStorage.getItem('officerName'),
        email: localStorage.getItem('officerEmail'),
        badgeNumber: localStorage.getItem('officerBadge'),
        role: localStorage.getItem('officerRole'),
        station: localStorage.getItem('officerStation'),
    }
}
