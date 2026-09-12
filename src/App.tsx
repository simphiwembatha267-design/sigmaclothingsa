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
import { useSiteGate } from "./lib/site-settings";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminShipping = lazy(() => import("./pages/admin/AdminShipping"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
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
  const { gateEnabled } = useSiteGate();

  return (
    <AnimatePresence mode="wait">
      {!authed && gateEnabled ? (
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
      <BrowserRouter basename={import.meta.env.BASE_URL}>
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
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/collections" element={<AdminCollections />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/subscribers" element={<AdminSubscribers />} />
              <Route path="/admin/discounts" element={<AdminDiscounts />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/shipping" element={<AdminShipping />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
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
