import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Article from "./pages/Article";
import BookDetail from "./pages/BookDetail";
import BookPayment from "./pages/BookPayment";
import BookDownload from "./pages/BookDownload";
import Books from "./pages/Books";
import Videos from "./pages/Videos";
import Donate from "./pages/Donate";
import About from "./pages/About";
import Authors from "./pages/Authors";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HowWeMakeMoney from "./pages/HowWeMakeMoney";
import AdvertiseWithUs from "./pages/AdvertiseWithUs";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBooks from "./pages/AdminBooks";
import AdminVideos from "./pages/AdminVideos";
import AdminPayments from "./pages/AdminPayments";
import PaymentStatus from "./pages/PaymentStatus";
import DonationStatus from "./pages/DonationStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/book/:slug/payment" element={<BookPayment />} />
            <Route path="/download/:token" element={<BookDownload />} />
            <Route path="/payment-status/:transactionId" element={<PaymentStatus />} />
            <Route path="/books" element={<Books />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/donation-status/:transactionId" element={<DonationStatus />} />
            <Route path="/about" element={<About />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/how-we-make-money" element={<HowWeMakeMoney />} />
            <Route path="/advertise" element={<AdvertiseWithUs />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="payments" element={<AdminPayments />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
