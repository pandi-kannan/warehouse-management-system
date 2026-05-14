import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const getPayload = () => {
        try {
            const token = localStorage.getItem('token');
            return JSON.parse(atob(token.split('.')[1]));
        } catch { return null; }
    };

    const payload = getPayload();

    const user = {
        username: payload?.sub || 'User',
        role: payload?.role || null,
    };

    const isAdmin = user.role === 'ADMIN';
    const isOperator = user.role === 'OPERATOR';

    return (
        <AuthContext.Provider value={{ user, isAdmin, isOperator }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
