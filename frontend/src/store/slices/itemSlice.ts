import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { itemAPI } from '../services/itemAPI'

interface Item {
  id: string
  shop_id: string
  name: string
  description?: string
  sku?: string
  price: number
  cost_price?: number
  tax_rate: number
  category?: string
  quantity: number
  min_quantity: number
  unit: string
  barcode?: string
  is_active: boolean
  is_low_stock: boolean
  created_at: string
  updated_at: string
}

interface ItemState {
  items: Item[]
  currentItem: Item | null
  categories: string[]
  loading: boolean
  error: string | null
}

const initialState: ItemState = {
  items: [],
  currentItem: null,
  categories: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchItems = createAsyncThunk(
  'item/fetchItems',
  async ({ shopId, filters }: { shopId: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.getItems(shopId, filters)
      console.log('fetchItems API response:', response.data)
      return response.data.data || []
    } catch (error: any) {
      console.error('fetchItems error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch items')
    }
  }
)

export const createItem = createAsyncThunk(
  'item/createItem',
  async ({ shopId, itemData }: { shopId: string; itemData: any }, { rejectWithValue }) => {
    console.log('Redux createItem action called with:', { shopId, itemData })
    try {
      console.log('Calling itemAPI.createItem...')
      const response = await itemAPI.createItem(shopId, itemData)
      console.log('API response received:', response)
      return response.data.data
    } catch (error: any) {
      console.error('API call failed:', error)
      console.error('Error response:', error.response)
      return rejectWithValue(error.response?.data?.error || 'Failed to create item')
    }
  }
)

export const updateItem = createAsyncThunk(
  'item/updateItem',
  async ({ shopId, itemId, itemData }: { shopId: string; itemId: string; itemData: any }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.updateItem(shopId, itemId, itemData)
      console.log('updateItem API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('updateItem error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to update item')
    }
  }
)

export const deleteItem = createAsyncThunk(
  'item/deleteItem',
  async ({ shopId, itemId }: { shopId: string; itemId: string }, { rejectWithValue }) => {
    try {
      await itemAPI.deleteItem(shopId, itemId)
      return itemId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete item')
    }
  }
)

export const updateItemQuantity = createAsyncThunk(
  'item/updateItemQuantity',
  async ({ shopId, itemId, quantity }: { shopId: string; itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.updateItemQuantity(shopId, itemId, quantity)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update item quantity')
    }
  }
)

export const getCategories = createAsyncThunk(
  'item/getCategories',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await itemAPI.getCategories(shopId)
      console.log('getCategories API response:', response.data)
      return response.data.data || []
    } catch (error: any) {
      console.error('getCategories error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories')
    }
  }
)

export const getLowStockItems = createAsyncThunk(
  'item/getLowStockItems',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await itemAPI.getLowStockItems(shopId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch low stock items')
    }
  }
)

export const bulkCreateItems = createAsyncThunk(
  'item/bulkCreateItems',
  async ({ shopId, items }: { shopId: string; items: any[] }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.bulkCreateItems(shopId, items)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create items')
    }
  }
)

const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentItem: (state, action: PayloadAction<Item | null>) => {
      state.currentItem = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create item
      .addCase(createItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
        state.error = null
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update item
      .addCase(updateItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload
        }
        state.error = null
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete item
      .addCase(deleteItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null
        }
        state.error = null
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update item quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload
        }
        state.error = null
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
        state.error = null
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get low stock items
      .addCase(getLowStockItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(getLowStockItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Bulk create items
      .addCase(bulkCreateItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkCreateItems.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(...action.payload)
        state.error = null
      })
      .addCase(bulkCreateItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentItem } = itemSlice.actions
export default itemSlice.reducer
