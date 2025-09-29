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

export const billAPI = {
  getBills: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/bills`)
    return response
  },

  getBill: async (shopId: string, billId: string) => {
    const response = await api.get(`/shops/${shopId}/bills/${billId}`)
    return response
  },

  createBill: async (shopId: string, billData: any) => {
    const response = await api.post(`/shops/${shopId}/bills`, billData)
    return response
  },

  updateBill: async (shopId: string, billId: string, billData: any) => {
    const response = await api.put(`/shops/${shopId}/bills/${billId}`, billData)
    return response
  },

  deleteBill: async (shopId: string, billId: string) => {
    const response = await api.delete(`/shops/${shopId}/bills/${billId}`)
    return response
  },

  generatePDF: async (shopId: string, billId: string) => {
    const response = await api.post(`/shops/${shopId}/bills/${billId}/pdf`)
    return response
  },

  addPayment: async (shopId: string, billId: string, paymentData: any) => {
    const response = await api.post(`/shops/${shopId}/bills/${billId}/payments`, paymentData)
    return response
  },
}
