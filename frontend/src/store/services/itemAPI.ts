import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const itemAPI = {
  getItems: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/items`)
    return response
  },

  getItem: async (shopId: string, itemId: string) => {
    const response = await api.get(`/shops/${shopId}/items/${itemId}`)
    return response
  },

  createItem: async (shopId: string, itemData: any) => {
    const response = await api.post(`/shops/${shopId}/items`, itemData)
    return response
  },

  updateItem: async (shopId: string, itemId: string, itemData: any) => {
    const response = await api.put(`/shops/${shopId}/items/${itemId}`, itemData)
    return response
  },

  deleteItem: async (shopId: string, itemId: string) => {
    const response = await api.delete(`/shops/${shopId}/items/${itemId}`)
    return response
  },
}
