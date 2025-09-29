import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { billAPI } from '../services/billAPI'

interface BillItem {
  id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  tax_rate: number
}

interface Bill {
  id: string
  shop_id: string
  customer_id?: string
  bill_number: string
  bill_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  pending_amount: number
  status: 'pending' | 'paid' | 'overdue'
  payment_terms?: string
  notes?: string
  pdf_url?: string
  created_by: string
  created_at: string
  updated_at: string
  items: BillItem[]
}

interface BillState {
  bills: Bill[]
  currentBill: Bill | null
  loading: boolean
  error: string | null
}

const initialState: BillState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBills(shopId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bills')
    }
  }
)

export const createBill = createAsyncThunk(
  'bill/createBill',
  async ({ shopId, billData }: { shopId: string; billData: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.createBill(shopId, billData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create bill')
    }
  }
)

export const fetchBill = createAsyncThunk(
  'bill/fetchBill',
  async ({ shopId, billId }: { shopId: string; billId: string }, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBill(shopId, billId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bill')
    }
  }
)

export const updateBill = createAsyncThunk(
  'bill/updateBill',
  async ({ shopId, billId, billData }: { shopId: string; billId: string; billData: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.updateBill(shopId, billId, billData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update bill')
    }
  }
)

export const deleteBill = createAsyncThunk(
  'bill/deleteBill',
  async ({ shopId, billId }: { shopId: string; billId: string }, { rejectWithValue }) => {
    try {
      await billAPI.deleteBill(shopId, billId)
      return billId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete bill')
    }
  }
)

export const generatePDF = createAsyncThunk(
  'bill/generatePDF',
  async ({ shopId, billId }: { shopId: string; billId: string }, { rejectWithValue }) => {
    try {
      const response = await billAPI.generatePDF(shopId, billId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate PDF')
    }
  }
)

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBill: (state, action: PayloadAction<Bill | null>) => {
      state.currentBill = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bills
      .addCase(fetchBills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false
        state.bills = action.payload
        state.error = null
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false
        state.bills.push(action.payload)
        state.error = null
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch bill
      .addCase(fetchBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBill.fulfilled, (state, action) => {
        state.loading = false
        state.currentBill = action.payload
        state.error = null
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update bill
      .addCase(updateBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false
        const index = state.bills.findIndex(bill => bill.id === action.payload.id)
        if (index !== -1) {
          state.bills[index] = action.payload
        }
        if (state.currentBill?.id === action.payload.id) {
          state.currentBill = action.payload
        }
        state.error = null
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete bill
      .addCase(deleteBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false
        state.bills = state.bills.filter(bill => bill.id !== action.payload)
        if (state.currentBill?.id === action.payload) {
          state.currentBill = null
        }
        state.error = null
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentBill } = billSlice.actions
export default billSlice.reducer
