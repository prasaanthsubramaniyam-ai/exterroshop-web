import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User, LoginPayload } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      // The login response already contains a fresh UserDTO fetched directly
      // from the DB (userRepository.findByEmail inside AuthService.login).
      // Using auth.user avoids a second /users/me round-trip whose response
      // the browser might serve from its HTTP cache, hiding a stale avatarUrl.
      const auth = await authService.login(payload);
      return auth;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Login failed"));
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load profile"));
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.isLoading = true;
      s.error = null;
    })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        if (a.payload.mfaRequired) {
          // Credentials OK, but no tokens yet — stay unauthenticated
          return;
        }
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = (a.payload as string) ?? "Login failed";
      })
      .addCase(fetchProfileThunk.fulfilled, (s, a) => {
        s.user = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
