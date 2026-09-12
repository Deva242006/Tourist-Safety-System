import client from './client'

export async function getChatHistory(incidentId) {
    const { data } = await client.get(`/chat/${incidentId}/history`)
    return data
}

export async function markChatRead(incidentId) {
    await client.patch(`/chat/${incidentId}/read`)
}

export async function getChatUnreadCount(incidentId) {
    const { data } = await client.get(`/chat/${incidentId}/unread`)
    return data.unread
}
