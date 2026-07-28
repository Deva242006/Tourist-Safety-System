import axios from 'axios'

// Vite proxy forwards /api to http://localhost:8080 (see vite.config.js)
const client = axios.create({
  baseURL: '/api'
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client