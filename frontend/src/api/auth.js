import client from './client'

export async function registerTourist(payload) {
    const { data } = await client.post('/auth/register', payload)
    return data
}

export async function loginTourist(payload) {
    const { data } = await client.post('/auth/login', payload)
    return data
}

export async function getMyDigitalId() {
    const { data } = await client.get('/digital-id/me')
    return data
}

export async function verifyDigitalId(touristId) {
    const { data } = await client.get(`/digital-id/verify/${touristId}`)
    return data
}

export function saveSession(authResponse) {
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('touristId', authResponse.touristId)
    localStorage.setItem('fullName', authResponse.fullName)
    localStorage.setItem('email', authResponse.email)
}

export function clearSession() {
    localStorage.removeItem('token')
    localStorage.removeItem('touristId')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
}

export function getSession() {
    const token = localStorage.getItem('token')
    if (!token) return null
    return {
        token,
        touristId: localStorage.getItem('touristId'),
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email')
    }
}