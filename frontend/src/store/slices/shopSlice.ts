import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { shopAPI } from '../services/shopAPI'

interface Shop {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  gst_number?: string
  logo_url?: string
  settings: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ShopState {
  shops: Shop[]
  currentShop: Shop | null
  loading: boolean
  error: string | null
}

const initialState: ShopState = {
  shops: [],
  currentShop: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchShops = createAsyncThunk(
  'shop/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getShops()
      console.log('fetchShops API response:', response.data)
      return response.data.data || []
    } catch (error: any) {
      console.error('fetchShops error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch shops')
    }
  }
)

export const createShop = createAsyncThunk(
  'shop/createShop',
  async (shopData: any, { rejectWithValue }) => {
    try {
      const response = await shopAPI.createShop(shopData)
      console.log('createShop API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('createShop error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to create shop')
    }
  }
)

export const updateShop = createAsyncThunk(
  'shop/updateShop',
  async ({ shopId, shopData }: { shopId: string; shopData: any }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateShop(shopId, shopData)
      console.log('updateShop API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('updateShop error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to update shop')
    }
  }
)

export const deleteShop = createAsyncThunk(
  'shop/deleteShop',
  async (shopId: string, { rejectWithValue }) => {
    try {
      await shopAPI.deleteShop(shopId)
      return shopId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete shop')
    }
  }
)

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentShop: (state, action: PayloadAction<Shop | null>) => {
      state.currentShop = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shops
      .addCase(fetchShops.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false
        state.shops = action.payload
        state.error = null
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create shop
      .addCase(createShop.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false
        state.shops = [...state.shops, action.payload]
        state.error = null
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update shop
      .addCase(updateShop.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.loading = false
        const index = state.shops.findIndex(shop => shop.id === action.payload.id)
        if (index !== -1) {
          state.shops = [
            ...state.shops.slice(0, index),
            action.payload,
            ...state.shops.slice(index + 1)
          ]
        }
        if (state.currentShop?.id === action.payload.id) {
          state.currentShop = action.payload
        }
        state.error = null
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete shop
      .addCase(deleteShop.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteShop.fulfilled, (state, action) => {
        state.loading = false
        state.shops = state.shops.filter(shop => shop.id !== action.payload)
        if (state.currentShop?.id === action.payload) {
          state.currentShop = null
        }
        state.error = null
      })
      .addCase(deleteShop.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentShop } = shopSlice.actions
export default shopSlice.reducer
