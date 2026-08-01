import client from './client'

export async function getMySafetyScore() {
    const { data } = await client.get('/safety-score/me')
    return data
}