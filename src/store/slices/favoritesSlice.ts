import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Product } from "@/types";
import { favoriteService } from "@/services/favorite.service";

interface FavoritesState {
  list: Product[];   // backend returns List<ProductDTO>, not wrapped Favorite objects
  ids: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  list: [],
  ids: [],
  isLoading: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
};

export const fetchFavoritesThunk = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await favoriteService.list();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load favorites"));
    }
  }
);

export const toggleFavoriteThunk = createAsyncThunk(
  "favorites/toggle",
  async (
    args: { productId: number; isFavorite: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (args.isFavorite) {
        await favoriteService.remove(args.productId);
        return { productId: args.productId, added: false };
      }
      await favoriteService.add(args.productId);
      return { productId: args.productId, added: true };
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to toggle favorite"));
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFavoritesThunk.pending, (s) => {
      s.isLoading = true;
    })
      .addCase(fetchFavoritesThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload;
        s.ids = a.payload.map((p) => p.id);  // payload is Product[], use p.id
      })
      .addCase(fetchFavoritesThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = (a.payload as string) ?? "Failed";
      })
      .addCase(toggleFavoriteThunk.fulfilled, (s, a) => {
        const { productId, added } = a.payload;
        if (added && !s.ids.includes(productId)) {
          s.ids.push(productId);
        } else if (!added) {
          s.ids = s.ids.filter((id) => id !== productId);
          s.list = s.list.filter((p) => p.id !== productId);  // list is Product[]
        }
      });
  },
});

export default favoritesSlice.reducer;
