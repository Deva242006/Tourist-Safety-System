import client from './client'

export async function createGroup(payload) {
    const { data } = await client.post('/groups', payload)
    return data
}

export async function getMyGroups() {
    const { data } = await client.get('/groups/mine')
    return data
}

export async function getAllGroups() {
    const { data } = await client.get('/groups')
    return data
}

export async function getGroup(id) {
    const { data } = await client.get(`/groups/${id}`)
    return data
}

export async function joinGroup(id) {
    const { data } = await client.post(`/groups/${id}/join`)
    return data
}

export async function leaveGroup(id) {
    const { data } = await client.delete(`/groups/${id}/leave`)
    return data
}

export async function removeGroupMember(groupId, touristId) {
    const { data } = await client.delete(`/groups/${groupId}/members/${touristId}`)
    return data
}
