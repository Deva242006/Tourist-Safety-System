import client from './client'

export async function getIncidents() {
    const { data } = await client.get('/incidents')
    return data
}

export async function getIncidentDetail(incidentId) {
    const { data } = await client.get(`/incidents/${incidentId}`)
    return data
}

export async function fileIncident(alertId, description) {
    const { data } = await client.post('/incidents', { alertId, description })
    return data
}

export async function updateIncidentStatus(incidentId, status) {
    const { data } = await client.patch(`/incidents/${incidentId}/status`, null, { params: { status } })
    return data
}