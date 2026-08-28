import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';
import About from './pages/About';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WishlistPage from './pages/WishlistPage';
import TrackOrderPage from './pages/TrackOrderPage';
import SearchPage from './pages/SearchPage';
import ClientCare from './pages/ClientCare';
import GiftBoxComposer from './pages/GiftBoxComposer';
import BottomNav from './components/BottomNav';

// Storefront layout (with Navbar/Footer)
function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <ChatWidget />
      <main className="flex-1">{children}</main>
      <BottomNav />
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Admin — no storefront chrome */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Storefront */}
      <Route
        path="*"
        element={
          <StorefrontLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections/:slug" element={<CollectionPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account/*" element={<Account />} />
              <Route path="/about" element={<About />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/client-care" element={<ClientCare />} />
              <Route path="/gift-box" element={<GiftBoxComposer />} />
            </Routes>
          </StorefrontLayout>
        }
      />
    </Routes>
  );
}
