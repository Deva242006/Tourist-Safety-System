import client from './client'

export async function getZones() {
    const { data } = await client.get('/zones')
    return data
}

export async function createZone(payload) {
    const { data } = await client.post('/zones', payload)
    return data
}

export async function checkLocation(latitude, longitude) {
    const { data } = await client.post('/zones/check', { latitude, longitude })
    return data
}