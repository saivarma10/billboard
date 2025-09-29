import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { customerAPI } from '../services/customerAPI'

interface Customer {
  id: string
  shop_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  gst_number?: string
  created_at: string
  updated_at: string
}

interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  loading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomers(shopId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customers')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async ({ shopId, customerData }: { shopId: string; customerData: any }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(shopId, customerData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create customer')
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ shopId, customerId, customerData }: { shopId: string; customerId: string; customerData: any }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCustomer(shopId, customerId, customerData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update customer')
    }
  }
)

export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async ({ shopId, customerId }: { shopId: string; customerId: string }, { rejectWithValue }) => {
    try {
      await customerAPI.deleteCustomer(shopId, customerId)
      return customerId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete customer')
    }
  }
)

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload
        state.error = null
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers.push(action.payload)
        state.error = null
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false
        const index = state.customers.findIndex(customer => customer.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.currentCustomer?.id === action.payload.id) {
          state.currentCustomer = action.payload
        }
        state.error = null
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers = state.customers.filter(customer => customer.id !== action.payload)
        if (state.currentCustomer?.id === action.payload) {
          state.currentCustomer = null
        }
        state.error = null
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentCustomer } = customerSlice.actions
export default customerSlice.reducer
