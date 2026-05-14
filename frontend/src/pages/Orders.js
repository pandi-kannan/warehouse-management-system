import React, { useEffect, useState } from 'react';
import API from '../services/Api';
import { useAuth } from '../context/AuthContext';

const STATUS_FLOW = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED'];

const STATUS_COLORS = {
    PENDING: { bg: '#f59e0b20', color: '#f59e0b' },
    PICKING: { bg: '#3b82f620', color: '#3b82f6' },
    PACKED:  { bg: '#8b5cf620', color: '#8b5cf6' },
    SHIPPED: { bg: '#10b98120', color: '#10b981' },
};

function Orders() {
    const { isAdmin, isOperator } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ orderNumber: '', customerName: '', productId: '', quantity: '' });
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchAll = () => {
        Promise.all([
            API.get('/api/orders'),
            API.get('/api/products'),
            API.get('/api/inventory'),
        ]).then(([ordRes, prodRes, invRes]) => {
            setOrders(ordRes.data);
            setProducts(prodRes.data);
            setInventory(invRes.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    // Find bin + warehouse for a product from inventory
    const getStockLocation = (productId) => {
        return inventory
            .filter(i => i.product?.id === productId && i.quantity > 0)
            .map(r => ({
                binCode:   r.bin?.binCode   || '—',
                warehouse: r.bin?.warehouse?.name || '—',
                quantity:  r.quantity,
            }));
    };

    const handleCreate = async () => {
        if (!form.orderNumber || !form.customerName || !form.productId || !form.quantity) {
            setError('All fields are required');
            return;
        }
        try {
            await API.post('/api/orders', {
                orderNumber:  form.orderNumber,
                customerName: form.customerName,
                productId:    parseInt(form.productId),
                quantity:     parseInt(form.quantity),
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

    // Operator sees only active orders (not SHIPPED)
    const visibleOrders = isAdmin
        ? orders
        : orders.filter(o => o.status !== 'SHIPPED');

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Orders</h1>
                    <span style={styles.subtitle}>{orders.length} total orders</span>
                </div>
                {isAdmin && (
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Order'}
                    </button>
                )}
            </div>

            {/* Create Order Form — ADMIN only */}
            {showForm && isAdmin && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Create New Order</h3>
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formGrid}>
                        <input style={styles.input} placeholder="Order Number *"  value={form.orderNumber}  onChange={e => setForm({ ...form, orderNumber:  e.target.value })} />
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

            {/* Operator instruction banner */}
            {isOperator && (
                <div style={styles.operatorBanner}>
                    👷 <strong>Your Job:</strong> Click <em>"📍 Find Stock"</em> on each order to see bin location → Go pick the item → Click <strong>→ PACKED</strong> → Hand to courier → Click <strong>→ SHIPPED</strong>
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
                <div style={styles.orderList}>
                    {visibleOrders.length === 0 && (
                        <div style={styles.empty}>No active orders.</div>
                    )}

                    {visibleOrders.map(order => {
                        const next       = getNextStatus(order.status);
                        const colors     = STATUS_COLORS[order.status] || {};
                        const locations  = getStockLocation(order.product?.id);
                        const isExpanded = expandedOrder === order.id;
                        const isPicking  = order.status === 'PICKING';

                        return (
                            <div key={order.id} style={{
                                ...styles.orderCard,
                                borderLeft: `4px solid ${colors.color || '#334155'}`,
                                background: isPicking ? '#1a2744' : '#1e293b',
                            }}>

                                {/* ── Order Header Row ── */}
                                <div style={styles.orderRow}>
                                    <div style={styles.orderInfo}>
                                        <span style={styles.orderNum}>{order.orderNumber}</span>
                                        <span style={styles.customerName}>👤 {order.customerName}</span>
                                        <span style={styles.productLabel}>
                                            📦 {order.product?.name || '—'}
                                            <span style={styles.qtyBadge}>×{order.quantity}</span>
                                        </span>
                                    </div>

                                    <div style={styles.orderActions}>
                                        <span style={{ ...styles.badge, background: colors.bg, color: colors.color }}>
                                            {order.status}
                                        </span>

                                        {/* Find Stock button — only for active picking orders */}
                                        {(order.status === 'PENDING' || order.status === 'PICKING') && (
                                            <button
                                                style={styles.btnLocation}
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            >
                                                📍 {isExpanded ? 'Hide' : 'Find Stock'}
                                            </button>
                                        )}

                                        {next ? (
                                            <button
                                                style={{
                                                    ...styles.btnAdvance,
                                                    background: isPicking ? '#3b82f6'    : '#3b82f620',
                                                    color:      isPicking ? '#ffffff'    : '#3b82f6',
                                                }}
                                                disabled={updating === order.id}
                                                onClick={() => handleStatusUpdate(order.id, next)}
                                            >
                                                {updating === order.id ? '...' : `→ ${next}`}
                                            </button>
                                        ) : (
                                            <span style={styles.done}>✅ Done</span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Stock Location Panel ── */}
                                {isExpanded && (
                                    <div style={styles.locationPanel}>
                                        <div style={styles.locationTitle}>
                                            📍 Where to find: <strong style={{ color: '#f1f5f9' }}>{order.product?.name}</strong>
                                        </div>

                                        {locations.length === 0 ? (
                                            <div style={styles.noStock}>
                                                ❌ No stock found in any bin! Contact Admin to receive stock first.
                                            </div>
                                        ) : (
                                            <div style={styles.locationGrid}>
                                                {locations.map((loc, idx) => (
                                                    <div key={idx} style={styles.locationCard}>
                                                        <div style={styles.binBadge}>🗄️ Bin: {loc.binCode}</div>
                                                        <div style={styles.warehouseName}>🏭 {loc.warehouse}</div>
                                                        <div style={styles.stockQty}>
                                                            Stock Available:{' '}
                                                            <strong style={{ color: loc.quantity >= order.quantity ? '#10b981' : '#ef4444' }}>
                                                                {loc.quantity} units
                                                            </strong>
                                                        </div>
                                                        {loc.quantity < order.quantity && (
                                                            <div style={styles.insufficientWarning}>
                                                                ⚠️ Only {loc.quantity} available, need {order.quantity}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Step-by-step picking instructions */}
                                        {locations.length > 0 && (
                                            <div style={styles.instructions}>
                                                <div style={styles.instructionTitle}>📋 Picking Instructions:</div>
                                                <div style={styles.steps}>
                                                    <div style={styles.step}>1️⃣ Go to <strong style={{ color: '#f59e0b' }}>{locations[0].warehouse}</strong> warehouse</div>
                                                    <div style={styles.step}>2️⃣ Find bin <strong style={{ color: '#3b82f6' }}>{locations[0].binCode}</strong></div>
                                                    <div style={styles.step}>3️⃣ Pick <strong style={{ color: '#10b981' }}>{order.quantity} × {order.product?.name}</strong></div>
                                                    <div style={styles.step}>4️⃣ Return here and click <strong style={{ color: '#8b5cf6' }}>→ PACKED</strong></div>
                                                    <div style={styles.step}>5️⃣ Hand to courier, then click <strong style={{ color: '#10b981' }}>→ SHIPPED</strong></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
    header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title:           { color: '#f1f5f9', fontSize: 28, fontWeight: 700, margin: 0 },
    subtitle:        { color: '#64748b', fontSize: 14 },
    btnPrimary:      { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    formCard:        { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle:       { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
    input:           { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    operatorBanner:  { background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, lineHeight: 1.6 },
    legend:          { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
    legendNote:      { color: '#475569', fontSize: 12, marginLeft: 8 },
    badge:           { padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block' },
    orderList:       { display: 'flex', flexDirection: 'column', gap: 12 },
    orderCard:       { borderRadius: 12, padding: 20, borderLeft: '4px solid #334155' },
    orderRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    orderInfo:       { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
    orderNum:        { color: '#f1f5f9', fontWeight: 800, fontSize: 16 },
    customerName:    { color: '#94a3b8', fontSize: 14 },
    productLabel:    { color: '#e2e8f0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
    qtyBadge:        { background: '#334155', color: '#e2e8f0', padding: '1px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 },
    orderActions:    { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    btnAdvance:      { border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    btnLocation:     { background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
    done:            { color: '#10b981', fontSize: 13, fontWeight: 600 },
    locationPanel:   { marginTop: 16, background: '#0f172a', borderRadius: 10, padding: 16, border: '1px solid #334155' },
    locationTitle:   { color: '#94a3b8', fontSize: 13, marginBottom: 12 },
    noStock:         { color: '#ef4444', fontSize: 13, padding: '8px 0' },
    locationGrid:    { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
    locationCard:    { background: '#1e293b', borderRadius: 8, padding: 14, minWidth: 200, border: '1px solid #334155' },
    binBadge:        { color: '#3b82f6', fontWeight: 700, fontSize: 15, marginBottom: 6 },
    warehouseName:   { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
    stockQty:        { color: '#94a3b8', fontSize: 13 },
    insufficientWarning: { color: '#ef4444', fontSize: 11, marginTop: 6, background: '#ef444415', padding: '4px 8px', borderRadius: 4 },
    instructions:    { background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #334155' },
    instructionTitle:{ color: '#f59e0b', fontSize: 13, fontWeight: 700, marginBottom: 10 },
    steps:           { display: 'flex', flexDirection: 'column', gap: 8 },
    step:            { color: '#cbd5e1', fontSize: 13, padding: '2px 0' },
    loading:         { color: '#64748b', textAlign: 'center', marginTop: 60 },
    empty:           { color: '#64748b', textAlign: 'center', padding: 40 },
    errorMsg:        { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
};

export default Orders;