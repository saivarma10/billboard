import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { billAPI } from '../services/billAPI'

export interface BillItem {
  id: string
  bill_id: string
  item_id: string
  item_name: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  bill_id: string
  amount: number
  payment_date: string
  payment_method: string
  reference: string
  notes: string
  created_at: string
  updated_at: string
}

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

export interface Bill {
  id: string
  shop_id: string
  customer_id?: string
  bill_number: string
  bill_date: string
  due_date?: string
  sub_total: number
  tax_amount: number
  discount: number
  total_amount: number
  paid_amount: number
  balance: number
  status: string
  notes: string
  terms: string
  customer?: Customer
  items: BillItem[]
  payments: Payment[]
  created_at: string
  updated_at: string
}

export interface BillStats {
  total_bills: number
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  overdue_amount: number
  this_month_bills: number
  this_month_amount: number
}

interface BillState {
  bills: Bill[]
  currentBill: Bill | null
  stats: BillStats | null
  loading: boolean
  error: string | null
}

const initialState: BillState = {
  bills: [],
  currentBill: null,
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async ({ shopId, filters }: { shopId: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBills(shopId, filters)
      console.log('fetchBills API response:', response.data)
      return response.data.data || []
    } catch (error: any) {
      console.error('fetchBills error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bills')
    }
  }
)

export const fetchBill = createAsyncThunk(
  'bill/fetchBill',
  async ({ shopId, billId }: { shopId: string; billId: string }, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBill(shopId, billId)
      console.log('fetchBill API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('fetchBill error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bill')
    }
  }
)

export const createBill = createAsyncThunk(
  'bill/createBill',
  async ({ shopId, billData }: { shopId: string; billData: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.createBill(shopId, billData)
      console.log('createBill API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('createBill error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to create bill')
    }
  }
)

export const updateBill = createAsyncThunk(
  'bill/updateBill',
  async ({ shopId, billId, billData }: { shopId: string; billId: string; billData: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.updateBill(shopId, billId, billData)
      console.log('updateBill API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('updateBill error:', error)
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
      console.error('deleteBill error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to delete bill')
    }
  }
)

export const addPayment = createAsyncThunk(
  'bill/addPayment',
  async ({ shopId, billId, paymentData }: { shopId: string; billId: string; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await billAPI.addPayment(shopId, billId, paymentData)
      console.log('addPayment API response:', response.data)
      return { billId, payment: response.data.data }
    } catch (error: any) {
      console.error('addPayment error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to add payment')
    }
  }
)

export const fetchBillStats = createAsyncThunk(
  'bill/fetchBillStats',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBillStats(shopId)
      console.log('fetchBillStats API response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('fetchBillStats error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bill stats')
    }
  }
)

export const generatePDF = createAsyncThunk(
  'bill/generatePDF',
  async ({ shopId, billId }: { shopId: string; billId: string }, { rejectWithValue }) => {
    try {
      const response = await billAPI.generatePDF(shopId, billId)
      console.log('generatePDF API response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('generatePDF error:', error)
      return rejectWithValue(error.response?.data?.error || 'Failed to generate PDF')
    }
  }
)

export const setCurrentBill = createAsyncThunk(
  'bill/setCurrentBill',
  async (bill: Bill) => {
    return bill
  }
)

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentBill: (state) => {
      state.currentBill = null
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
      // Fetch single bill
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
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false
        state.bills = [action.payload, ...state.bills]
        state.error = null
      })
      .addCase(createBill.rejected, (state, action) => {
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
          state.bills = [
            ...state.bills.slice(0, index),
            action.payload,
            ...state.bills.slice(index + 1)
          ]
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
      // Add payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false
        const { billId, payment } = action.payload
        const billIndex = state.bills.findIndex(bill => bill.id === billId)
        if (billIndex !== -1) {
          state.bills[billIndex].payments = [...state.bills[billIndex].payments, payment]
          // Update paid amount and balance
          const totalPaid = state.bills[billIndex].payments.reduce((sum, p) => sum + p.amount, 0)
          state.bills[billIndex].paid_amount = totalPaid
          state.bills[billIndex].balance = state.bills[billIndex].total_amount - totalPaid
        }
        if (state.currentBill?.id === billId) {
          state.currentBill.payments = [...state.currentBill.payments, payment]
          const totalPaid = state.currentBill.payments.reduce((sum, p) => sum + p.amount, 0)
          state.currentBill.paid_amount = totalPaid
          state.currentBill.balance = state.currentBill.total_amount - totalPaid
        }
        state.error = null
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch bill stats
      .addCase(fetchBillStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBillStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchBillStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Generate PDF
      .addCase(generatePDF.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generatePDF.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(generatePDF.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Set current bill
      .addCase(setCurrentBill.fulfilled, (state, action) => {
        state.currentBill = action.payload
      })
  },
})

export const { clearError, clearCurrentBill } = billSlice.actions
export default billSlice.reducer