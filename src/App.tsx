import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { ScrollToTop } from "./components/ScrollToTop";
import { PasswordGate, isAuthenticated } from "./components/PasswordGate";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminPlaceholder = lazy(() => import("./pages/admin/AdminPlaceholder"));
import Index from "./pages/Index";
const Shop = lazy(() => import("./pages/Shop"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

function Storefront() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {!authed ? (
        <PasswordGate key="gate" onAuthenticated={() => setAuthed(true)} />
      ) : showSplash ? (
        <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />

            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/sigmaclothingsa">
        <ScrollToTop />
        <AdminAuthProvider>
          <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route
                path="/admin/collections"
                element={
                  <AdminPlaceholder
                    title="Collections"
                    description="Group products into curated drops and edits."
                    features={[
                      "Create and edit collections",
                      "Tops, Hoodies, Accessories",
                      "New Arrivals and Best Sellers",
                      "Limited Drops and Archive",
                      "Assign products to collections",
                      "Order collections on the storefront",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <AdminPlaceholder
                    title="Customers"
                    description="Your customer database and purchase history."
                    features={[
                      "Name, email, phone and address",
                      "Full order history",
                      "Total spent and number of orders",
                      "Last purchase date",
                      "Private customer notes",
                      "Export customer list",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/subscribers"
                element={
                  <AdminPlaceholder
                    title="Newsletter Subscribers"
                    description="Everyone who signed up for SIGMA drops."
                    features={[
                      "Search subscribers",
                      "Export to CSV",
                      "Delete a subscriber",
                      "Signup date and source",
                      "Ready for email campaigns",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/discounts"
                element={
                  <AdminPlaceholder
                    title="Discount Codes"
                    description="Promotional codes for drops and campaigns."
                    features={[
                      "Percentage and fixed discounts",
                      "Free shipping codes",
                      "Expiry dates",
                      "Usage limits and maximum uses",
                      "Minimum purchase amount",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <AdminPlaceholder
                    title="Payments"
                    description="Revenue and transaction health."
                    features={[
                      "Revenue and transactions",
                      "Successful and failed payments",
                      "Refunds and pending payments",
                      "Ready for PayFast, Yoco, Peach and Stripe",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/shipping"
                element={
                  <AdminPlaceholder
                    title="Shipping"
                    description="Zones, rates and fulfilment."
                    features={[
                      "Shipping zones",
                      "Shipping rates",
                      "Courier tracking numbers",
                      "Shipment status",
                      "Order fulfilment queue",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminPlaceholder
                    title="Analytics"
                    description="Performance across the store."
                    features={[
                      "Revenue and sales",
                      "Conversion rate",
                      "Average order value",
                      "Best selling products",
                      "Returning customers",
                      "Revenue and orders by month",
                    ]}
                  />
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminPlaceholder
                    title="Settings"
                    description="Store, brand and staff configuration."
                    features={[
                      "Store name, logo and brand colours",
                      "Domain and store email",
                      "Business information",
                      "Tax and shipping settings",
                      "Payment settings",
                      "Social media and staff accounts",
                    ]}
                  />
                }
              />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Storefront />} />
          </Routes>
          </Suspense>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
