import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Product,
  PurchasedProduct,
  ProductFilters,
  CreateProductPayload,
} from "@/types";
import { productService } from "@/services/product.service";

interface ProductState {
  list: Product[];
  featured: Product[];
  mine: Product[];
  purchased: PurchasedProduct[];
  selected: Product | null;
  filters: ProductFilters;
  pagination: { page: number; totalPages: number; total: number };
  isLoading: boolean;
  isMyLoading: boolean;  // tracks mine + purchased fetch so My Marketplace shows skeleton
  isMutating: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  featured: [],
  mine: [],
  purchased: [],
  selected: null,
  filters: {},
  pagination: { page: 1, totalPages: 1, total: 0 },
  isLoading: false,
  isMyLoading: false,
  isMutating: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
};

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchList",
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      return await productService.list(filters);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to fetch products"));
    }
  }
);

export const fetchProductByIdThunk = createAsyncThunk(
  "products/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await productService.getById(id);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load product"));
    }
  }
);

export const fetchFeaturedThunk = createAsyncThunk(
  "products/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.featured();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load featured"));
    }
  }
);

export const fetchMineThunk = createAsyncThunk(
  "products/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.mine();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load my products"));
    }
  }
);

export const fetchPurchasedThunk = createAsyncThunk(
  "products/fetchPurchased",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.purchased();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to load purchases"));
    }
  }
);

export const createProductThunk = createAsyncThunk(
  "products/create",
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      return await productService.create(payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to create product"));
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async (
    args: { id: number; payload: Partial<CreateProductPayload> },
    { rejectWithValue }
  ) => {
    try {
      return await productService.update(args.id, args.payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to update product"));
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await productService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to delete product"));
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
    },
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProductsThunk.pending, (s) => {
      s.isLoading = true;
      s.error = null;
    })
      .addCase(fetchProductsThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload?.data ?? [];
        s.pagination = {
          page: a.payload?.page ?? 1,
          totalPages: a.payload?.totalPages ?? 1,
          total: a.payload?.total ?? 0,
        };
      })
      .addCase(fetchProductsThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = (a.payload as string) ?? "Failed to fetch products";
      })
      .addCase(fetchProductByIdThunk.fulfilled, (s, a) => {
        s.selected = a.payload;
      })
      .addCase(fetchFeaturedThunk.fulfilled, (s, a) => {
        s.featured = a.payload ?? [];
      })
      .addCase(fetchMineThunk.pending, (s) => { s.isMyLoading = true; })
      .addCase(fetchMineThunk.fulfilled, (s, a) => {
        s.isMyLoading = false;
        s.mine = a.payload ?? [];
      })
      .addCase(fetchMineThunk.rejected, (s) => { s.isMyLoading = false; })
      .addCase(fetchPurchasedThunk.pending, (s) => { s.isMyLoading = true; })
      .addCase(fetchPurchasedThunk.fulfilled, (s, a) => {
        s.isMyLoading = false;
        s.purchased = a.payload ?? [];
      })
      .addCase(fetchPurchasedThunk.rejected, (s) => { s.isMyLoading = false; })
      .addCase(createProductThunk.pending, (s) => {
        s.isMutating = true;
      })
      .addCase(createProductThunk.fulfilled, (s, a) => {
        s.isMutating = false;
        s.list = [a.payload, ...s.list];
        s.mine = [a.payload, ...s.mine];
      })
      .addCase(createProductThunk.rejected, (s) => {
        s.isMutating = false;
      })
      .addCase(updateProductThunk.fulfilled, (s, a) => {
        s.list = s.list.map((p) => (p.id === a.payload.id ? a.payload : p));
        s.mine = s.mine.map((p) => (p.id === a.payload.id ? a.payload : p));
        if (s.selected?.id === a.payload.id) s.selected = a.payload;
      })
      .addCase(deleteProductThunk.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p.id !== a.payload);
        s.mine = s.mine.filter((p) => p.id !== a.payload);
        if (s.selected?.id === a.payload) s.selected = null;
      });
  },
});

export const { setFilters, clearSelected } = productSlice.actions;
export default productSlice.reducer;
