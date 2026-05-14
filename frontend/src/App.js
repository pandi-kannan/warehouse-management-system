import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Warehouses from './pages/Warehouses';
import Bins from './pages/Bin';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'OPERATOR']}>
                            <Products />
                        </ProtectedRoute>
                    } />
                    <Route path="inventory" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'OPERATOR']}>
                            <Inventory />
                        </ProtectedRoute>
                    } />
                    <Route path="orders" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'OPERATOR']}>
                            <Orders />
                        </ProtectedRoute>
                    } />
                    <Route path="warehouses" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Warehouses />
                        </ProtectedRoute>
                    } />
                    <Route path="bins" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Bins />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;