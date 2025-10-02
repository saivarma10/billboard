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

export const customerAPI = {
  // Get all customers for a shop
  getCustomers: async (shopId: string, filters?: any) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.city) params.append('city', filters.city)
    
    const queryString = params.toString()
    const url = `/shops/${shopId}/customers${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response
  },

  // Get a specific customer
  getCustomer: async (shopId: string, customerId: string) => {
    const response = await api.get(`/shops/${shopId}/customers/${customerId}`)
    return response
  },

  // Create a new customer
  createCustomer: async (shopId: string, customerData: any) => {
    const response = await api.post(`/shops/${shopId}/customers`, customerData)
    return response
  },

  // Update a customer
  updateCustomer: async (shopId: string, customerId: string, customerData: any) => {
    const response = await api.put(`/shops/${shopId}/customers/${customerId}`, customerData)
    return response
  },

  // Delete a customer
  deleteCustomer: async (shopId: string, customerId: string) => {
    const response = await api.delete(`/shops/${shopId}/customers/${customerId}`)
    return response
  },

  // Get customer statistics
  getCustomerStats: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/customers/stats`)
    return response
  },
}