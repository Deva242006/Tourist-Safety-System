import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null
const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

export function connectSocket({ onTracking, onAlert } = {}) {
    if (client && client.active) return client

    client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 3000,
        onConnect: () => {
            if (onTracking) {
                client.subscribe('/topic/tracking', (msg) => onTracking(JSON.parse(msg.body)))
            }
            if (onAlert) {
                client.subscribe('/topic/alerts', (msg) => onAlert(JSON.parse(msg.body)))
            }
        }
    })

    client.activate()
    return client
}

export function disconnectSocket() {
    if (client) {
        client.deactivate()
        client = null
    }
}

export function sendLocationUpdate(touristId, latitude, longitude) {
    if (!client || !client.active) return
    client.publish({
        destination: '/app/location.update',
        body: JSON.stringify({ touristId, latitude, longitude })
    })
}

export function sendSos(touristId, latitude, longitude, message = '') {
    if (!client || !client.active) return
    client.publish({
        destination: '/app/sos',
        body: JSON.stringify({ touristId, latitude, longitude, message })
    })
}

export function subscribeToAlerts(onAlert) {
    if (!client || !client.active) {
        setTimeout(() => {
            if (client && client.active) {
                client.subscribe('/topic/alerts', (msg) => onAlert(JSON.parse(msg.body)))
            }
        }, 700)
        return { unsubscribe: () => {} }
    }
    return client.subscribe('/topic/alerts', (msg) => onAlert(JSON.parse(msg.body)))
}

export function subscribeToChat(incidentId, onMessage) {
    if (!client || !client.active) return null
    return client.subscribe(`/topic/chat/${incidentId}`, (msg) => onMessage(JSON.parse(msg.body)))
}

export function sendChatMessage(incidentId, message, senderRole) {
    if (!client || !client.active) return
    client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ incidentId, message, senderRole })
    })
}