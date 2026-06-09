"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  fetchFeaturedThunk,
  fetchMineThunk,
  fetchPurchasedThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  setFilters,
} from "@/store/slices/productSlice";
import { toggleFavoriteThunk } from "@/store/slices/favoritesSlice";
import type {
  ProductFilters,
  CreateProductPayload,
} from "@/types";

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.products);
  const favoriteIds = useAppSelector((s) => s.favorites?.ids ?? []);

  // Defensive defaults — protects against persist rehydration race & failed fetches
  const list = state?.list ?? [];
  const featured = state?.featured ?? [];
  const mine = state?.mine ?? [];
  const purchased = state?.purchased ?? [];
  const selected = state?.selected ?? null;
  const pagination = state?.pagination ?? { page: 1, totalPages: 1, total: 0 };
  const filters = state?.filters ?? {};
  const isLoading = state?.isLoading ?? false;
  const isMyLoading = state?.isMyLoading ?? false;
  const isMutating = state?.isMutating ?? false;
  const error = state?.error ?? null;

  const fetchAll = useCallback(
    (filters?: ProductFilters) => dispatch(fetchProductsThunk(filters)).unwrap(),
    [dispatch]
  );

  const fetchById = useCallback(
    (id: number) => dispatch(fetchProductByIdThunk(id)).unwrap(),
    [dispatch]
  );

  const fetchFeatured = useCallback(
    () => dispatch(fetchFeaturedThunk()).unwrap(),
    [dispatch]
  );

  const fetchMine = useCallback(
    () => dispatch(fetchMineThunk()).unwrap(),
    [dispatch]
  );

  const fetchPurchased = useCallback(
    () => dispatch(fetchPurchasedThunk()).unwrap(),
    [dispatch]
  );

  const create = useCallback(
    (payload: CreateProductPayload) => dispatch(createProductThunk(payload)).unwrap(),
    [dispatch]
  );

  const update = useCallback(
    (id: number, payload: Partial<CreateProductPayload>) =>
      dispatch(updateProductThunk({ id, payload })).unwrap(),
    [dispatch]
  );

  const remove = useCallback(
    (id: number) => dispatch(deleteProductThunk(id)).unwrap(),
    [dispatch]
  );

  const toggleFavorite = useCallback(
    (productId: number) => {
      const isFavorite = favoriteIds.includes(productId);
      return dispatch(toggleFavoriteThunk({ productId, isFavorite })).unwrap();
    },
    [dispatch, favoriteIds]
  );

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const updateFilters = useCallback(
    (filters: ProductFilters) => dispatch(setFilters(filters)),
    [dispatch]
  );

  return {
    list,
    featured,
    mine,
    purchased,
    selected,
    pagination,
    filters,
    isLoading,
    isMyLoading,
    isMutating,
    error,
    favoriteIds,
    fetchAll,
    fetchById,
    fetchFeatured,
    fetchMine,
    fetchPurchased,
    create,
    update,
    remove,
    toggleFavorite,
    isFavorite,
    updateFilters,
  };
};
