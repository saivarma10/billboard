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
  // Get all bills for a shop
  getBills: async (shopId: string, filters?: any) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.customer_id) params.append('customer_id', filters.customer_id)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    
    const queryString = params.toString()
    const url = `/shops/${shopId}/bills${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response
  },

  // Get a specific bill
  getBill: async (shopId: string, billId: string) => {
    const response = await api.get(`/shops/${shopId}/bills/${billId}`)
    return response
  },

  // Create a new bill
  createBill: async (shopId: string, billData: any) => {
    const response = await api.post(`/shops/${shopId}/bills`, billData)
    return response
  },

  // Update a bill
  updateBill: async (shopId: string, billId: string, billData: any) => {
    const response = await api.put(`/shops/${shopId}/bills/${billId}`, billData)
    return response
  },

  // Delete a bill
  deleteBill: async (shopId: string, billId: string) => {
    const response = await api.delete(`/shops/${shopId}/bills/${billId}`)
    return response
  },

  // Add payment to a bill
  addPayment: async (shopId: string, billId: string, paymentData: any) => {
    const response = await api.post(`/shops/${shopId}/bills/${billId}/payments`, paymentData)
    return response
  },

  // Get bill statistics
  getBillStats: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/bills/stats`)
    return response
  },

  // Generate PDF for a bill
  generatePDF: async (shopId: string, billId: string) => {
    const response = await api.post(`/shops/${shopId}/bills/${billId}/pdf`)
    return response
  },
}