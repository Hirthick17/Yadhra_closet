// src/hooks/useProducts.ts
// One hook per operation — components don't know about fetch, cache, or URLs.
// TanStack Query handles caching, deduplication, and background refresh.

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

// ── Types — match the MongoDB Product model exactly ───────────────────────
export interface Product {
  _id:           string;
  slug:          string;
  name:          string;
  subtitle?:     string;
  description:   string;
  category:      string; // Dynamic — no longer restricted to a fixed enum
  categoryLabel: string;
  price:         number;
  oldPrice?:     number;
  image?:        string;
  images:        string[];
  colors:        string[];
  sizes:         string[];
  outOfStockSizes: string[];
  rating:        number;
  ratingCount:   number;
  badge?:        'new' | 'sale' | null;
  stock:         number;
  isActive:      boolean;
  createdAt:     string;
}

export interface ProductsResponse {
  success:    boolean;
  data:       Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface SingleProductResponse {
  success: boolean;
  data:    Product;
}

// ── List all products ─────────────────────────────────────────────────────
export function useProducts(params?: {
  category?: string;
  search?:   string;
  badge?:    string;
  page?:     number;
  limit?:    number;
}) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.search)   qs.set('search',   params.search);
  if (params?.badge)    qs.set('badge',    params.badge);
  if (params?.page)     qs.set('page',     String(params.page));
  if (params?.limit)    qs.set('limit',    String(params.limit));

  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn:  () => apiFetch<ProductsResponse>(`/products?${qs.toString()}`),
    staleTime:            5 * 60_000, // Fresh for 5 minutes — reduces DB hits on repeat visits
    gcTime:              10 * 60_000, // Keep in memory cache for 10 minutes
    placeholderData:     keepPreviousData, // Show previous data while loading new category filter
    refetchOnWindowFocus: false,      // Don't re-fetch when user switches tabs back
  });
}

// ── Single product by slug or _id ─────────────────────────────────────────
export function useProduct(id: string) {
  return useQuery<SingleProductResponse>({
    queryKey: ['products', id],
    queryFn:  () => apiFetch<SingleProductResponse>(`/products/${id}`),
    enabled:              !!id,
    staleTime:            60_000,
    refetchOnWindowFocus: false,
  });
}

// ── Admin: create ─────────────────────────────────────────────────────────
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── Admin: update ─────────────────────────────────────────────────────────
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['products', vars.id] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── Admin: delete (soft delete) ───────────────────────────────────────────
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── List distinct categories from DB ─────────────────────────────────────
export interface Category {
  slug:  string;
  label: string;
  count: number;
}

export interface CategoriesResponse {
  success: boolean;
  data:    Category[];
}

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn:  () => apiFetch<CategoriesResponse>('/products/categories'),
    staleTime:            5 * 60_000,
    gcTime:              15 * 60_000,
    refetchOnWindowFocus: false,
  });
}
