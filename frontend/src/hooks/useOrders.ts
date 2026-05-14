// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

// ── Types — match the MongoDB Order model ─────────────────────────────────
export interface CartItem {
  productId: string;   // MongoDB _id
  name:      string;
  price:     number;
  image?:    string;
  quantity:  number;
  size?:     string;
  color?:    string;
}

export interface OrderAddress {
  firstName: string;
  lastName:  string;
  phone:     string;
  line1:     string;
  line2?:    string;
  city:      string;
  pincode:   string;
}

export interface Order {
  _id:       string;
  items:     { product: string; name: string; price: number; quantity: number; size?: string }[];
  total:     number;
  status:    'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  address:   OrderAddress;
  referralCode?: string;
  socialApplied?: boolean;
  createdAt: string;
  user:      string;
}

// ── My orders (logged-in customer) ───────────────────────────────────────
export function useMyOrders() {
  return useQuery<{ success: boolean; data: Order[] }>({
    queryKey: ['orders', 'my'],
    queryFn:  () => apiFetch('/orders/my'),
    staleTime: 30_000,
  });
}

// ── Single order ─────────────────────────────────────────────────────────
export function useOrder(id: string) {
  return useQuery<{ success: boolean; data: Order }>({
    queryKey: ['orders', id],
    queryFn:  () => apiFetch(`/orders/${id}`),
    enabled:  !!id,
  });
}

// ── Place order (checkout) ────────────────────────────────────────────────
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { items: CartItem[]; address: OrderAddress; total: number; referralCode?: string; socialApplied?: boolean }) =>
      apiFetch<{ success: boolean; data: Order }>('/orders', {
        method: 'POST',
        body:   JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ── Admin: get all orders ─────────────────────────────────────────────────
export function useAllOrders() {
  return useQuery<{ success: boolean; data: Order[] }>({
    queryKey: ['orders', 'all'],
    queryFn:  () => apiFetch('/orders'),
  });
}

// ── Admin: update order status ────────────────────────────────────────────
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body:   JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
