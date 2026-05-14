// src/routes/orders.tsx
// My Orders page — fetches from GET /api/orders/my
// Only accessible when logged in. Shows live order history from MongoDB.

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { useMyOrders } from "@/hooks/useOrders";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "My Orders — Yadhra Closet" }] }),
});

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Order Placed",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Confirmed",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:   { label: "Shipped",       cls: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled",     cls: "bg-red-50 text-red-600 border-red-200" },
};

// ── Loading skeleton ──────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white border border-border-grey rounded-[18px] p-6">
          <div className="flex justify-between mb-3">
            <div className="h-3 bg-secondary-bg rounded w-32" />
            <div className="h-5 bg-secondary-bg rounded w-20" />
          </div>
          <div className="h-4 bg-secondary-bg rounded w-24 mb-1" />
          <div className="h-3 bg-secondary-bg rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function OrdersPage() {
  const { data, isLoading, isError } = useMyOrders();
  const orders = data?.data ?? [];

  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 md:px-10 py-12">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Your purchases</p>
          <h1 className="font-serif text-4xl mt-2 text-deep-blue">My Orders</h1>
        </div>

        {isLoading && <OrderSkeleton />}

        {isError && (
          <div className="text-center py-16">
            <p className="text-text-muted">Please log in to view your orders.</p>
            <Link to="/" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-deep-blue text-white text-[13px] font-semibold">
              Go Home
            </Link>
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-text-muted" />
            </div>
            <p className="font-serif text-2xl text-deep-blue">No orders yet</p>
            <p className="text-[13px] text-text-muted mt-2">Your beautiful kurtis are waiting.</p>
            <Link to="/catalog" className="inline-block mt-6 px-7 py-3 rounded-full bg-deep-blue text-white text-[13px] font-semibold hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] transition">
              Shop Now →
            </Link>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={order._id}
                  className="bg-white border border-border-grey rounded-[18px] p-5 hover:border-deep-blue/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Icon + info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-5 h-5 text-deep-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-[14px] text-deep-blue">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[12px] text-text-muted mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                        <p className="text-[13px] text-text-muted mt-1">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Status + price */}
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${status.cls}`}>
                        {status.label}
                      </span>
                      <p className="font-serif text-[20px] font-semibold text-deep-blue mt-2">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Item names */}
                  <div className="mt-4 pt-4 border-t border-border-grey flex items-center justify-between">
                    <p className="text-[12px] text-text-muted truncate max-w-[70%]">
                      {order.items.map(i => i.name).join(", ")}
                    </p>
                    <span className="text-[12px] font-semibold text-deep-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
