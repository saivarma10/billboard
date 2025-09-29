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
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ItemState {
  items: Item[]
  currentItem: Item | null
  loading: boolean
  error: string | null
}

const initialState: ItemState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchItems = createAsyncThunk(
  'item/fetchItems',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await itemAPI.getItems(shopId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch items')
    }
  }
)

export const createItem = createAsyncThunk(
  'item/createItem',
  async ({ shopId, itemData }: { shopId: string; itemData: any }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.createItem(shopId, itemData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create item')
    }
  }
)

export const updateItem = createAsyncThunk(
  'item/updateItem',
  async ({ shopId, itemId, itemData }: { shopId: string; itemId: string; itemData: any }, { rejectWithValue }) => {
    try {
      const response = await itemAPI.updateItem(shopId, itemId, itemData)
      return response.data
    } catch (error: any) {
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
  },
})

export const { clearError, setCurrentItem } = itemSlice.actions
export default itemSlice.reducer
