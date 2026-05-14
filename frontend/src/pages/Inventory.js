import React, { useEffect, useState } from 'react';
import API from '../services/Api';
import { useAuth } from '../context/AuthContext';

function Inventory() {
    const { isAdmin, isOperator } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [receiveForm, setReceiveForm] = useState({ productId: '', quantity: '', binId: '' });
    const [dispatchForm, setDispatchForm] = useState({ productId: '', quantity: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            API.get('/api/inventory'),
            API.get('/api/products'),
            API.get('/api/bins'),
        ]).then(([invRes, prodRes, binRes]) => {
            setInventory(invRes.data);
            setProducts(prodRes.data);
            setBins(binRes.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const showMsg = (msg) => {
        setMessage(msg);
        setError('');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleReceive = async () => {
        if (!receiveForm.productId || !receiveForm.quantity) {
            setError('Product and quantity are required');
            return;
        }
        try {
            await API.post('/api/inventory/receive', {
                productId: parseInt(receiveForm.productId),
                quantity:  parseInt(receiveForm.quantity),
                binId:     receiveForm.binId ? parseInt(receiveForm.binId) : null,
            });
            setReceiveForm({ productId: '', quantity: '', binId: '' });
            showMsg('✅ Stock received successfully!');
            fetchAll();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to receive stock');
        }
    };

    const handleDispatch = async () => {
        if (!dispatchForm.productId || !dispatchForm.quantity) {
            setError('Product and quantity are required');
            return;
        }
        try {
            await API.post('/api/inventory/dispatch', {
                productId: parseInt(dispatchForm.productId),
                quantity:  parseInt(dispatchForm.quantity),
            });
            setDispatchForm({ productId: '', quantity: '' });
            showMsg('✅ Stock dispatched successfully!');
            fetchAll();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to dispatch — check available quantity');
        }
    };

    const lowStock = inventory.filter(i => i.quantity < 10);

    const getProductName = (item) => item.product?.name  || '—';
    const getProductSku  = (item) => item.product?.sku   || '—';
    const getBinCode     = (item) => item.bin?.binCode   || '—';
    const getWarehouse   = (item) => item.bin?.warehouse?.name || '—';

    // Operator tabs — no dispatch (that's automatic via orders)
    const tabs = isAdmin
        ? [
            { key: 'all',      label: '📋 All Stock' },
            { key: 'receive',  label: '📥 Receive Stock' },
            { key: 'dispatch', label: '📤 Dispatch Stock' },
          ]
        : [
            { key: 'all',     label: '📋 All Stock' },
            { key: 'receive', label: '📥 Receive Stock' },
          ];

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Inventory</h1>
                    <span style={styles.subtitle}>{inventory.length} inventory records</span>
                </div>
                {lowStock.length > 0 && (
                    <div style={styles.alertBadge}>⚠️ {lowStock.length} low stock</div>
                )}
            </div>

            {/* Operator info banner */}
            {isOperator && (
                <div style={styles.operatorBanner}>
                    👷 <strong>Your inventory tasks:</strong> Receive incoming stock into the correct bin. Check All Stock to know what's available and where.
                </div>
            )}

            {/* Tabs */}
            <div style={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
                        onClick={() => { setActiveTab(tab.key); setError(''); setMessage(''); }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Receive Stock Form ── */}
            {activeTab === 'receive' && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>📥 Receive Stock into Warehouse</h3>
                    {message && <div style={styles.successMsg}>{message}</div>}
                    {error   && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formGrid}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Product *</label>
                            <select
                                style={styles.input}
                                value={receiveForm.productId}
                                onChange={e => setReceiveForm({ ...receiveForm, productId: e.target.value })}
                            >
                                <option value="">Select Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Quantity *</label>
                            <input
                                style={styles.input}
                                type="number"
                                placeholder="Enter quantity"
                                value={receiveForm.quantity}
                                onChange={e => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                            />
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Storage Bin * (select which bin to store in)</label>
                            <select
                                style={{ ...styles.input, borderColor: !receiveForm.binId ? '#f59e0b' : '#334155' }}
                                value={receiveForm.binId}
                                onChange={e => setReceiveForm({ ...receiveForm, binId: e.target.value })}
                            >
                                <option value="">⚠️ Select a bin</option>
                                {bins.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.binCode} — {b.warehouse?.name || 'No warehouse'}
                                    </option>
                                ))}
                            </select>
                            {!receiveForm.binId && (
                                <span style={styles.binWarning}>Please select a bin — different bins = different warehouse locations</span>
                            )}
                        </div>
                    </div>
                    <button
                        style={{ ...styles.btnPrimary, background: '#10b981' }}
                        onClick={handleReceive}
                    >
                        📥 Receive Stock
                    </button>
                </div>
            )}

            {/* ── Dispatch Stock Form — ADMIN only ── */}
            {activeTab === 'dispatch' && isAdmin && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>📤 Dispatch Stock from Warehouse</h3>
                    {message && <div style={styles.successMsg}>{message}</div>}
                    {error   && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formRow}>
                        <select
                            style={styles.input}
                            value={dispatchForm.productId}
                            onChange={e => setDispatchForm({ ...dispatchForm, productId: e.target.value })}
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                        <input
                            style={styles.input}
                            type="number"
                            placeholder="Quantity"
                            value={dispatchForm.quantity}
                            onChange={e => setDispatchForm({ ...dispatchForm, quantity: e.target.value })}
                        />
                        <button style={{ ...styles.btnPrimary, background: '#ef4444' }} onClick={handleDispatch}>
                            📤 Dispatch
                        </button>
                    </div>
                </div>
            )}

            {/* ── All Stock Table ── */}
            {activeTab === 'all' && (
                loading ? <div style={styles.loading}>Loading inventory...</div> : (
                    <div style={styles.table}>
                        <div style={styles.tableHeader}>
                            <span>Product</span>
                            <span>SKU</span>
                            <span>Bin</span>
                            <span>Warehouse</span>
                            <span>Qty</span>
                            <span>Status</span>
                        </div>
                        {inventory.length === 0 && (
                            <div style={styles.empty}>No inventory records.</div>
                        )}
                        {inventory.map(item => (
                            <div key={item.id} style={styles.tableRow}>
                                <span style={styles.productName}>{getProductName(item)}</span>
                                <span style={styles.badge}>{getProductSku(item)}</span>
                                <span style={styles.binCell}>🗄️ {getBinCode(item)}</span>
                                <span style={styles.cell}>🏭 {getWarehouse(item)}</span>
                                <span style={styles.cellBold}>{item.quantity}</span>
                                <span style={item.quantity < 10 ? styles.badgeDanger : styles.badgeSuccess}>
                                    {item.quantity < 10 ? '⚠️ Low Stock' : 'OK'}
                                </span>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

const styles = {
    header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title:           { color: '#f1f5f9', fontSize: 28, fontWeight: 700, margin: 0 },
    subtitle:        { color: '#64748b', fontSize: 14 },
    alertBadge:      { background: '#ef444420', color: '#ef4444', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
    operatorBanner:  { background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, lineHeight: 1.6 },
    tabs:            { display: 'flex', gap: 8, marginBottom: 24 },
    tab:             { background: '#1e293b', color: '#64748b', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    tabActive:       { background: '#3b82f6', color: '#fff' },
    formCard:        { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle:       { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
    formRow:         { display: 'flex', gap: 12, alignItems: 'center' },
    fieldGroup:      { display: 'flex', flexDirection: 'column', gap: 6 },
    label:           { color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' },
    input:           { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    binWarning:      { color: '#f59e0b', fontSize: 11, marginTop: 4 },
    btnPrimary:      { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' },
    table:           { background: '#1e293b', borderRadius: 12, overflow: 'hidden' },
    tableHeader:     { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.5fr 1fr', padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155' },
    tableRow:        { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.5fr 1fr', padding: '14px 16px', background: '#0f172a', marginBottom: 2, alignItems: 'center', borderRadius: 6 },
    productName:     { color: '#e2e8f0', fontWeight: 600, fontSize: 14 },
    cell:            { color: '#94a3b8', fontSize: 14 },
    binCell:         { color: '#3b82f6', fontSize: 14, fontWeight: 600 },
    cellBold:        { color: '#e2e8f0', fontSize: 14, fontWeight: 700 },
    badge:           { background: '#3b82f620', color: '#3b82f6', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' },
    badgeDanger:     { background: '#ef444420', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' },
    badgeSuccess:    { background: '#10b98120', color: '#10b981', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' },
    loading:         { color: '#64748b', textAlign: 'center', marginTop: 60 },
    empty:           { color: '#64748b', textAlign: 'center', padding: 40 },
    successMsg:      { background: '#10b98120', color: '#10b981', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
    errorMsg:        { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
};

export default Inventory;