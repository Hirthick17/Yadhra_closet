import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";
import { cms } from "@/lib/cms";

import appCss from "../styles.css?url";

// Global query client — single instance shared across entire app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60_000,  // Data is fresh for 60s — prevents refetch spam
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Yadhra Closet — Editorial Kurtis for the Modern Indian Woman" },
      { name: "description", content: "Discover handcrafted everyday and festive kurtis. Free delivery ₹599+. Made with love in Chennai." },
      { property: "og:title", content: "Yadhra Closet — Editorial Kurtis for the Modern Indian Woman" },
      { property: "og:description", content: "Discover handcrafted everyday and festive kurtis. Free delivery ₹599+. Made with love in Chennai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Yadhra Closet — Editorial Kurtis for the Modern Indian Woman" },
      { name: "twitter:description", content: "Discover handcrafted everyday and festive kurtis. Free delivery ₹599+. Made with love in Chennai." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/71d45f8d-f3be-48b6-94ad-e23d829d0454/id-preview-646e597e--526aac4f-fb47-4907-bece-ff808cc24649.lovable.app-1777997560109.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/71d45f8d-f3be-48b6-94ad-e23d829d0454/id-preview-646e597e--526aac4f-fb47-4907-bece-ff808cc24649.lovable.app-1777997560109.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        // Instrument Serif: italic only — the editorial headline signature
        // DM Sans: 400/500/600/700 — warm UI text at all weights
        // DM Mono: 400/500 — prices, codes, referral numbers (tabular figures)
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },

    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Restore admin JWT session from httpOnly cookie on every page load.
  // If the cookie is absent/expired, cms.isAdmin stays false — no UI shown.
  // This replaces the old localStorage flag approach.
  useEffect(() => {
    cms.restoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
