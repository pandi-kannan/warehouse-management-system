import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Decode JWT payload to get role
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        if (allowedRoles && !allowedRoles.includes(role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    } catch (e) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
