import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null

export function connectSocket({ onTracking, onAlert } = {}) {
    if (client && client.active) return client

    client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
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