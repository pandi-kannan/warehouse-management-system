import React, { useEffect, useState } from 'react';
import API from '../services/Api';

const STATUS_FLOW = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED'];

const STATUS_COLORS = {
    PENDING: { bg: '#f59e0b20', color: '#f59e0b' },
    PICKING: { bg: '#3b82f620', color: '#3b82f6' },
    PACKED: { bg: '#8b5cf620', color: '#8b5cf6' },
    SHIPPED: { bg: '#10b98120', color: '#10b981' },
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ orderNumber: '', customerName: '', productId: '', quantity: '' });
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);

    const fetchAll = () => {
        Promise.all([
            API.get('/api/orders'),
            API.get('/api/products'),
        ]).then(([ordRes, prodRes]) => {
            setOrders(ordRes.data);
            setProducts(prodRes.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const handleCreate = async () => {
        if (!form.orderNumber || !form.customerName || !form.productId || !form.quantity) {
            setError('All fields are required');
            return;
        }
        try {
            await API.post('/api/orders', {
                orderNumber: form.orderNumber,
                customerName: form.customerName,
                productId: parseInt(form.productId),
                quantity: parseInt(form.quantity),
            });
            setForm({ orderNumber: '', customerName: '', productId: '', quantity: '' });
            setShowForm(false);
            setError('');
            fetchAll();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create order');
        }
    };

    const handleStatusUpdate = async (orderId, nextStatus) => {
        setUpdating(orderId);
        try {
            await API.put(`/api/orders/${orderId}/status?status=${nextStatus}`);
            fetchAll();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const getNextStatus = (current) => {
        const idx = STATUS_FLOW.indexOf(current);
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Orders</h1>
                    <span style={styles.subtitle}>{orders.length} total orders</span>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Order'}
                </button>
            </div>

            {/* Create Order Form */}
            {showForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Create New Order</h3>
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formGrid}>
                        <input style={styles.input} placeholder="Order Number *" value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} />
                        <input style={styles.input} placeholder="Customer Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                        <select style={styles.input} value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
                            <option value="">Select Product *</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input style={styles.input} placeholder="Quantity *" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                    <button style={styles.btnPrimary} onClick={handleCreate}>Create Order</button>
                </div>
            )}

            {/* Status Legend */}
            <div style={styles.legend}>
                {STATUS_FLOW.map(s => (
                    <span key={s} style={{ ...styles.badge, background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].color }}>
                        {s}
                    </span>
                ))}
                <span style={styles.legendNote}>→ Orders progress left to right</span>
            </div>

            {loading ? (
                <div style={styles.loading}>Loading orders...</div>
            ) : (
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <span>Order #</span>
                        <span>Customer</span>
                        <span>Product</span>
                        <span>Qty</span>
                        <span>Status</span>
                        <span>Action</span>
                    </div>
                    {orders.length === 0 && <div style={styles.empty}>No orders yet.</div>}
                    {orders.map(order => {
                        const next = getNextStatus(order.status);
                        const colors = STATUS_COLORS[order.status] || {};
                        return (
                            <div key={order.id} style={styles.tableRow}>
                                <span style={styles.orderNum}>{order.orderNumber}</span>
                                <span style={styles.cell}>{order.customerName}</span>
                                <span style={styles.cell}>{order.product?.name || '—'}</span>
                                <span style={styles.cell}>{order.quantity}</span>
                                <span style={{ ...styles.badge, background: colors.bg, color: colors.color }}>
                                    {order.status}
                                </span>
                                {next ? (
                                    <button
                                        style={styles.btnAdvance}
                                        disabled={updating === order.id}
                                        onClick={() => handleStatusUpdate(order.id, next)}
                                    >
                                        {updating === order.id ? '...' : `→ ${next}`}
                                    </button>
                                ) : (
                                    <span style={styles.done}>✅ Done</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { color: '#f1f5f9', fontSize: 28, fontWeight: 700, margin: 0 },
    subtitle: { color: '#64748b', fontSize: 14 },
    btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnAdvance: { background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    formCard: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle: { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
    input: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    legend: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
    legendNote: { color: '#475569', fontSize: 12, marginLeft: 8 },
    badge: { padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block' },
    table: { background: '#1e293b', borderRadius: 12, overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr 1fr 1fr', padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155' },
    tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr 1fr 1fr', padding: '14px 16px', background: '#0f172a', marginBottom: 2, alignItems: 'center', borderRadius: 6 },
    orderNum: { color: '#e2e8f0', fontWeight: 700, fontSize: 14 },
    cell: { color: '#94a3b8', fontSize: 14 },
    done: { color: '#10b981', fontSize: 13 },
    loading: { color: '#64748b', textAlign: 'center', marginTop: 60 },
    empty: { color: '#64748b', textAlign: 'center', padding: 40 },
    errorMsg: { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
};

export default Orders;
