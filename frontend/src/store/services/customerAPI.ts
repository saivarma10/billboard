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

export const customerAPI = {
  getCustomers: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/customers`)
    return response
  },

  getCustomer: async (shopId: string, customerId: string) => {
    const response = await api.get(`/shops/${shopId}/customers/${customerId}`)
    return response
  },

  createCustomer: async (shopId: string, customerData: any) => {
    const response = await api.post(`/shops/${shopId}/customers`, customerData)
    return response
  },

  updateCustomer: async (shopId: string, customerId: string, customerData: any) => {
    const response = await api.put(`/shops/${shopId}/customers/${customerId}`, customerData)
    return response
  },

  deleteCustomer: async (shopId: string, customerId: string) => {
    const response = await api.delete(`/shops/${shopId}/customers/${customerId}`)
    return response
  },
}
