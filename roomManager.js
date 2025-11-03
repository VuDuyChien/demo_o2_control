// roomManager.js
import _ from 'lodash'
import { WebSocket } from 'ws'

class RoomManager {
  constructor() {
    if (RoomManager.instance) return RoomManager.instance

    this.rooms = new Map() // Map<string, Set<WebSocket>>
    RoomManager.instance = this
  }

  joinRoom({ roomName, client }) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set())
    }

    const room = this.rooms.get(roomName)
    room.add(client)

    // Lưu thông tin phòng trong client
    if (!client.customInfo) client.customInfo = {}
    if (!client.customInfo.rooms) client.customInfo.rooms = new Set()

    client.customInfo.rooms.add(roomName)
  }

  leaveRoom({ roomName, client }) {
    const room = this.rooms.get(roomName)
    if (room) {
      room.delete(client)
      if (room.size === 0) this.rooms.delete(roomName)
    }

    if (client.customInfo?.rooms) {
      client.customInfo.rooms.delete(roomName)
    }
  }

  leaveAllRooms(client) {
    if (!client?.customInfo?.rooms) return

    for (const roomName of client.customInfo.rooms) {
      this.leaveRoom({ roomName, client })
    }

    client.customInfo.rooms.clear()
  }

  getClientsInRoom(roomName) {
    const room = this.rooms.get(roomName)
    return room ? Array.from(room) : []
  }

  sendMessageToRoom({ roomName, message }) {
    const room = this.rooms.get(roomName)
    if (!room) return

    const msg = _.isString(message) ? message : JSON.stringify(message)
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    })
  }

  roomExists(roomName) {
    return this.rooms.has(roomName)
  }

  isClientInAnyRoom(client) {
    return client?.customInfo?.rooms?.size > 0
  }
}

// ✅ Singleton instance (chỉ tạo 1 lần)
const roomManager = new RoomManager()

// ✅ Export dùng trực tiếp
export default roomManager
