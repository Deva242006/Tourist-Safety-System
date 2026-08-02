import client from './client'

export async function getTourists() {
    const { data } = await client.get('/tourists')
    return data
}

export async function getTouristDetail(touristId) {
    const { data } = await client.get(`/tourists/${touristId}`)
    return data
}