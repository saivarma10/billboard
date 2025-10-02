import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

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

export const shopAPI = {
  getShops: async () => {
    console.log('shopAPI.getShops: Making API call to /shops')
    const response = await api.get('/shops')
    console.log('shopAPI.getShops: Response received:', response.data)
    return response
  },

  getShop: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}`)
    return response
  },

  createShop: async (shopData: any) => {
    const response = await api.post('/shops', shopData)
    return response
  },

  updateShop: async (shopId: string, shopData: any) => {
    const response = await api.put(`/shops/${shopId}`, shopData)
    return response
  },

  deleteShop: async (shopId: string) => {
    const response = await api.delete(`/shops/${shopId}`)
    return response
  },

  inviteUser: async (shopId: string, userData: any) => {
    const response = await api.post(`/shops/${shopId}/invite`, userData)
    return response
  },

  getDashboard: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/analytics/dashboard`)
    return response
  },

  getSalesAnalytics: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/analytics/sales`)
    return response
  },

  getPendingAmounts: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/analytics/pending-amounts`)
    return response
  },
}
