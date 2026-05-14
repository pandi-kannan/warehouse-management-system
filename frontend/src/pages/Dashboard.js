import React, { useEffect, useState } from 'react';
import API from '../services/Api';

function StatCard({ label, value, icon, color }) {
    return (
        <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
            <div style={styles.cardIcon}>{icon}</div>
            <div style={styles.cardValue}>{value ?? '...'}</div>
            <div style={styles.cardLabel}>{label}</div>
        </div>
    );
}

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/api/dashboard/stats'),
            API.get('/api/inventory/alerts'),
        ]).then(([statsRes, alertsRes]) => {
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>Dashboard</h1>
                <span style={styles.subtitle}>Warehouse overview at a glance</span>
            </div>

            {loading ? (
                <div style={styles.loading}>Loading...</div>
            ) : (
                <>
                    <div style={styles.statsGrid}>
                        <StatCard label="Total Products" value={stats?.totalProducts} icon="📦" color="#3b82f6" />
                        <StatCard label="Total Orders" value={stats?.totalOrders} icon="🛒" color="#10b981" />
                        <StatCard label="Warehouses" value={stats?.totalWarehouses} icon="🏭" color="#f59e0b" />
                        <StatCard label="Low Stock Alerts" value={alerts?.length} icon="⚠️" color="#ef4444" />
                    </div>

                    {alerts.length > 0 && (
                        <div style={styles.alertSection}>
                            <h2 style={styles.sectionTitle}>⚠️ Low Stock Alerts</h2>
                            <div style={styles.alertTable}>
                                <div style={styles.tableHeader}>
                                    <span>Product</span>
                                    <span>Bin</span>
                                    <span>Quantity</span>
                                </div>
                                {alerts.map(item => (
                                    <div key={item.id} style={styles.tableRow}>
                                        <span style={styles.productName}>{item.product?.name || '—'}</span>
                                        <span style={styles.cell}>{item.bin?.name || '—'}</span>
                                        <span style={styles.badgeDanger}>{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {alerts.length === 0 && (
                        <div style={styles.allGood}>
                            ✅ All inventory levels are healthy!
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const styles = {
    header: { marginBottom: 28 },
    title: { color: '#f1f5f9', fontSize: 28, fontWeight: 700, margin: 0 },
    subtitle: { color: '#64748b', fontSize: 14 },
    loading: { color: '#64748b', fontSize: 16, textAlign: 'center', marginTop: 60 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 },
    card: { background: '#1e293b', borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
    cardIcon: { fontSize: 28 },
    cardValue: { color: '#f1f5f9', fontSize: 36, fontWeight: 800 },
    cardLabel: { color: '#64748b', fontSize: 13, fontWeight: 500 },
    alertSection: { background: '#1e293b', borderRadius: 12, padding: 24 },
    sectionTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 0 },
    alertTable: { display: 'flex', flexDirection: 'column', gap: 1 },
    tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 100px', padding: '8px 12px', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' },
    tableRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 100px', padding: '12px', background: '#0f172a', borderRadius: 8, marginBottom: 4, alignItems: 'center' },
    productName: { color: '#e2e8f0', fontWeight: 600, fontSize: 14 },
    cell: { color: '#94a3b8', fontSize: 14 },
    badgeDanger: { background: '#ef444420', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700, textAlign: 'center' },
    allGood: { background: '#10b98120', color: '#10b981', padding: '16px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600 },
};

export default Dashboard;
