import {configureStore} from '@reduxjs/toolkit'
import cartSlice from './cartSlice'
import productSlice from './productSlice';
import notificationSlice from './notificationSlice';

const store = configureStore({
    reducer:{
        cart: cartSlice,
        products: productSlice,
        notification: notificationSlice
    }
})

export default store;