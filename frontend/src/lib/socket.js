import { io } from 'socket.io-client'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const socketUrl = apiBaseUrl.replace(/\/api\/?$/, '')

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
})

export const connectSocket = () => {
  const token = localStorage.getItem('token')
  socket.auth = token ? { token } : {}
  if (socket.connected) {
    socket.disconnect()
  }
  socket.connect()
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}
