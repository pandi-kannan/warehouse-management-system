import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Warehouses from './pages/Warehouses';
import Bins from './pages/Bin';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard"  element={<Dashboard />} />
                        <Route path="products"   element={<Products />} />
                        <Route path="inventory"  element={<Inventory />} />
                        <Route path="orders"     element={<Orders />} />
                        <Route path="warehouses" element={<Warehouses />} />
                        <Route path="bins"       element={<Bins />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
