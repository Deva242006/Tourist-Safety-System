import client from './client'

export async function getRecentAlerts() {
    const { data } = await client.get('/alerts')
    return data
}