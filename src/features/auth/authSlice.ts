import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type User = {
  id: number;
  name: string;
  role: string;
};

type AuthState = {
  user: User | null;
  isLogin: boolean;
};

const initialState: AuthState = {
  user: null,
  isLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLogin = true;
    },
    logout(state) {
      state.user = null;
      state.isLogin = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
