import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { ScrollToTop } from "./components/ScrollToTop";
import { PasswordGate, isAuthenticated } from "./components/PasswordGate";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
