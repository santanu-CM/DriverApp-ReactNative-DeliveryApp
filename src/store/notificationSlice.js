import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasNewOrder: false,
  hasNewShipping: false
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNewOrder: (state, action) => {
      state.hasNewOrder = action.payload;
    },
    setNewShipping: (state, action) => {
      state.hasNewShipping = action.payload;
    },
    clearNotifications: (state) => {
      state.hasNewOrder = false;
      state.hasNewShipping = false;
    }
  }
});

export const { setNewOrder, setNewShipping, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 