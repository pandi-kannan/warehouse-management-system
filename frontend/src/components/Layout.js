import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function getRole() {
    try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch { return null; }
}

function getUsername() {
    try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    } catch { return 'User'; }
}

function Layout() {
    const navigate = useNavigate();
    const role = getRole();
    const username = getUsername();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'OPERATOR'] },
        { path: '/products', label: 'Products', icon: '📦', roles: ['ADMIN', 'OPERATOR'] },
        { path: '/inventory', label: 'Inventory', icon: '🏷️', roles: ['ADMIN', 'OPERATOR'] },
        { path: '/orders', label: 'Orders', icon: '🛒', roles: ['ADMIN', 'OPERATOR'] },
        { path: '/warehouses', label: 'Warehouses', icon: '🏭', roles: ['ADMIN'] },
        { path: '/bins', label: 'Bins', icon: '🗄️', roles: ['ADMIN'] },
    ];

    const visibleItems = navItems.filter(item => item.roles.includes(role));

    return (
        <div style={styles.shell}>
            <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 64 }}>
                <div style={styles.sidebarHeader}>
                    {sidebarOpen && <span style={styles.logo}>WMS</span>}
                    <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav style={styles.nav}>
                    {visibleItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                ...styles.navItem,
                                background: isActive ? '#3b82f6' : 'transparent',
                                color: isActive ? '#fff' : '#94a3b8',
                            })}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div style={styles.sidebarFooter}>
                    {sidebarOpen && (
                        <div style={styles.userInfo}>
                            <div style={styles.avatar}>{username[0]?.toUpperCase()}</div>
                            <div>
                                <div style={styles.userName}>{username}</div>
                                <div style={styles.userRole}>{role}</div>
                            </div>
                        </div>
                    )}
                    <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
                        🚪
                    </button>
                </div>
            </aside>

            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

const styles = {
    shell: { display: 'flex', height: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', sans-serif" },
    sidebar: { background: '#1e293b', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden', borderRight: '1px solid #334155' },
    sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', borderBottom: '1px solid #334155' },
    logo: { color: '#3b82f6', fontWeight: 800, fontSize: 22, letterSpacing: 2 },
    toggleBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 },
    nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
    navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s', whiteSpace: 'nowrap' },
    navIcon: { fontSize: 18, minWidth: 24, textAlign: 'center' },
    sidebarFooter: { padding: '12px 8px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
    userName: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
    userRole: { color: '#64748b', fontSize: 11 },
    logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 },
    main: { flex: 1, overflow: 'auto', background: '#0f172a', padding: 28 },
};

export default Layout;
