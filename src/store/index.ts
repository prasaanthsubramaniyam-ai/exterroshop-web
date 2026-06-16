import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import favoritesReducer from "./slices/favoritesSlice";
import uiReducer from "./slices/uiSlice";
import aiReducer from "./slices/aiSlice";

/** SSR-safe storage that gracefully no-ops on the server */
const createNoopStorage = () => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, value: unknown) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("redux-persist/lib/storage").default
    : createNoopStorage();

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  favorites: favoritesReducer,
  ui: uiReducer,
  ai: aiReducer,
});

const persistedReducer = persistReducer(
  {
    key: "exterroshop:v2",
    storage,
    whitelist: ["auth", "favorites"],
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
