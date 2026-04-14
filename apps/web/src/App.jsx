import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/AdminDashboard';
import AdminProductManager from './pages/AdminProductManager';
import AdminOrderManager from './pages/AdminOrderManager';
import AdminCouponManager from './pages/AdminCouponManager';
import AdminSalesAnalytics from './pages/AdminSalesAnalytics';
import AdminUserManager from './pages/AdminUserManager';
import AdminCategoryManager from './pages/AdminCategoryManager';
import AdminSettings from './pages/AdminSettings';
import AdminDealManager from './pages/AdminDealManager';
import AdminSlideshowManager from './pages/AdminSlideshowManager';
import AdminLayout from './components/layouts/AdminLayout';

import { AuthProvider } from './context/AuthProvider';
import { CartProvider } from './context/CartProvider';
import { WishlistProvider } from './context/WishlistProvider';
import { ToastProvider } from './components/Toast';

import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Routes>
                            {/* Admin Auth (no layout) */}
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin/register" element={<AdminRegister />} />

                            {/* Protected Admin Routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProductManager />} />
                                    <Route path="orders" element={<AdminOrderManager />} />
                                    <Route path="coupons" element={<AdminCouponManager />} />
                                    <Route path="analytics" element={<AdminSalesAnalytics />} />
                                    <Route path="users" element={<AdminUserManager />} />
                                    <Route path="inventory" element={<AdminCategoryManager />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                    <Route path="deals" element={<AdminDealManager />} />
                                    <Route path="slideshow" element={<AdminSlideshowManager />} />
                                </Route>
                            </Route>

                            {/* User Routes (with Navbar + Footer) */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="catalog" element={<Catalog />} />
                                <Route path="categories" element={<Catalog />} />
                                <Route path="brands" element={<Catalog />} />
                                <Route path="deals" element={<Catalog />} />
                                <Route path="product/:id" element={<ProductDetails />} />
                                <Route path="cart" element={<Cart />} />
                                <Route path="checkout" element={<Checkout />} />
                                <Route path="order-success/:id" element={<OrderSuccess />} />
                                <Route path="dashboard" element={<UserDashboard />} />
                                <Route path="account/orders/:id" element={<OrderDetail />} />
                                <Route path="wishlist" element={<Wishlist />} />
                                <Route path="about" element={<About />} />
                                <Route path="contact" element={<Contact />} />
                                {/* 404 catch-all inside layout */}
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Routes>
                    </WishlistProvider>
                </CartProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
