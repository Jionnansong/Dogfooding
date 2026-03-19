
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserVersion } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateQuota: (state, action: PayloadAction<{ used: number }>) => {
      if (state.user) {
        state.user.tokenQuota.used = action.payload.used;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    consumeTokens: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.tokenQuota.used = Math.min(
          state.user.tokenQuota.total,
          state.user.tokenQuota.used + action.payload
        );
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
});

export const { setCredentials, logout, updateQuota, consumeTokens } = authSlice.actions;
export default authSlice.reducer;
