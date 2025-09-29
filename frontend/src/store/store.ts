import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import billSlice from './slices/billSlice'
import itemSlice from './slices/itemSlice'
import customerSlice from './slices/customerSlice'
import shopSlice from './slices/shopSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    bill: billSlice,
    item: itemSlice,
    customer: customerSlice,
    shop: shopSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
