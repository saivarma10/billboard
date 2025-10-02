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
  console.log('API request interceptor - token:', token ? 'present' : 'missing')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Authorization header set:', config.headers.Authorization)
  }
  console.log('Request config:', config)
  return config
})

export const itemAPI = {
  getItems: async (shopId: string, filters?: any) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = `/shops/${shopId}/items${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response
  },

  getItem: async (shopId: string, itemId: string) => {
    const response = await api.get(`/shops/${shopId}/items/${itemId}`)
    return response
  },

  createItem: async (shopId: string, itemData: any) => {
    console.log('itemAPI.createItem called with:', { shopId, itemData })
    console.log('Making POST request to:', `/shops/${shopId}/items`)
    const response = await api.post(`/shops/${shopId}/items`, itemData)
    console.log('API response:', response)
    return response
  },

  updateItem: async (shopId: string, itemId: string, itemData: any) => {
    const response = await api.put(`/shops/${shopId}/items/${itemId}`, itemData)
    return response
  },

  updateItemQuantity: async (shopId: string, itemId: string, quantity: number) => {
    const response = await api.put(`/shops/${shopId}/items/${itemId}/quantity`, { quantity })
    return response
  },

  deleteItem: async (shopId: string, itemId: string) => {
    const response = await api.delete(`/shops/${shopId}/items/${itemId}`)
    return response
  },

  getCategories: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/items/categories`)
    return response
  },

  getLowStockItems: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/items/low-stock`)
    return response
  },

  bulkCreateItems: async (shopId: string, items: any[]) => {
    const response = await api.post(`/shops/${shopId}/items/bulk`, { items })
    return response
  },
}
