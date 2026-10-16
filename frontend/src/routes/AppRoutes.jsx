import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AdminLayout from '../components/AdminLayout.jsx';
import Home from '../pages/Home.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Category from '../pages/Category.jsx';
import Search from '../pages/Search.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Profile from '../pages/Profile.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminProducts from '../pages/admin/Products.jsx';
import AdminProductForm from '../pages/admin/ProductForm.jsx';
import AdminOrders from '../pages/admin/Orders.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminRoute from '../components/AdminRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/:id" element={<AdminProductForm />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}
