import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerAPI } from '../services/customerAPI'

export interface Customer {
  id: string
  shop_id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  tax_number: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerStats {
  total_customers: number
  active_customers: number
  new_customers_this_month: number
}

interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  stats: CustomerStats | null
  loading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async ({ shopId, filters }: { shopId: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomers(shopId, filters)
      console.log('fetchCustomers API response:', response.data)
      return response.data.data || []
    } catch (error: any) {
      console.error('fetchCustomers error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customers')
    }
  }
)

export const fetchCustomer = createAsyncThunk(
  'customer/fetchCustomer',
  async ({ shopId, customerId }: { shopId: string; customerId: string }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomer(shopId, customerId)
      console.log('fetchCustomer API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('fetchCustomer error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customer')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async ({ shopId, customerData }: { shopId: string; customerData: any }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(shopId, customerData)
      console.log('createCustomer API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('createCustomer error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to create customer')
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ shopId, customerId, customerData }: { shopId: string; customerId: string; customerData: any }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCustomer(shopId, customerId, customerData)
      console.log('updateCustomer API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('updateCustomer error:', error)
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
      console.error('deleteCustomer error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to delete customer')
    }
  }
)

export const fetchCustomerStats = createAsyncThunk(
  'customer/fetchCustomerStats',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerStats(shopId)
      console.log('fetchCustomerStats API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('fetchCustomerStats error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customer stats')
    }
  }
)

export const setCurrentCustomer = createAsyncThunk(
  'customer/setCurrentCustomer',
  async (customer: Customer) => {
    return customer
  }
)

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null
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
      // Fetch single customer
      .addCase(fetchCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.currentCustomer = action.payload
        state.error = null
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
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
        state.customers = [...state.customers, action.payload]
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
          state.customers = [
            ...state.customers.slice(0, index),
            action.payload,
            ...state.customers.slice(index + 1)
          ]
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
      // Fetch customer stats
      .addCase(fetchCustomerStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Set current customer
      .addCase(setCurrentCustomer.fulfilled, (state, action) => {
        state.currentCustomer = action.payload
      })
  },
})

export const { clearError, clearCurrentCustomer } = customerSlice.actions
export default customerSlice.reducer