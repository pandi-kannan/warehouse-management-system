import React, { useEffect, useState } from 'react';
import API from '../services/Api';
import { useAuth } from '../context/AuthContext';

function Products() {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', sku: '', description: '', price: '' });
    const [barcodeImg, setBarcodeImg] = useState(null);
    const [barcodeProduct, setBarcodeProduct] = useState(null);
    const [error, setError] = useState('');

    const fetchProducts = () => {
        API.get('/api/products')
            .then(res => setProducts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async () => {
        if (!form.name || !form.sku) { setError('Name and SKU are required'); return; }
        try {
            await API.post('/api/products', form);
            setForm({ name: '', sku: '', description: '', price: '' });
            setShowForm(false);
            setError('');
            fetchProducts();
        } catch (e) {
            setError('Failed to add product');
        }
    };

    const handleBarcode = async (sku, name) => {
        try {
            const res = await API.get(`/api/products/barcode/${sku}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            setBarcodeImg(url);
            setBarcodeProduct(name);
        } catch {
            alert('Failed to load barcode');
        }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Products</h1>
                    <span style={styles.subtitle}>{products.length} products total</span>
                </div>
                {/* Only ADMIN can add products */}
                {isAdmin && (
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Product'}
                    </button>
                )}
            </div>

            {/* Add Product Form — ADMIN only */}
            {showForm && isAdmin && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>New Product</h3>
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formGrid}>
                        <input style={styles.input} placeholder="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input style={styles.input} placeholder="SKU *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                        <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <input style={styles.input} placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <button style={styles.btnPrimary} onClick={handleSubmit}>Save Product</button>
                </div>
            )}

            {/* Search */}
            <input
                style={styles.search}
                placeholder="🔍 Search by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Barcode Modal */}
            {barcodeImg && (
                <div style={styles.modal} onClick={() => setBarcodeImg(null)}>
                    <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>Barcode — {barcodeProduct}</h3>
                        <img src={barcodeImg} alt="barcode" style={{ width: '100%', borderRadius: 8 }} />
                        <button style={{ ...styles.btnPrimary, marginTop: 16 }} onClick={() => setBarcodeImg(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Operator notice */}
            {!isAdmin && (
                <div style={styles.infoMsg}>
                    👁️ View only — contact Admin to add or modify products.
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div style={styles.loading}>Loading products...</div>
            ) : (
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <span>Name</span>
                        <span>SKU</span>
                        <span>Description</span>
                        <span>Price</span>
                        <span>Barcode</span>
                    </div>
                    {filtered.length === 0 && <div style={styles.empty}>No products found.</div>}
                    {filtered.map(p => (
                        <div key={p.id} style={styles.tableRow}>
                            <span style={styles.productName}>{p.name}</span>
                            <span style={styles.badge}>{p.sku}</span>
                            <span style={styles.cell}>{p.description || '—'}</span>
                            <span style={styles.cell}>{p.price ? `₹${p.price}` : '—'}</span>
                            <button style={styles.btnSmall} onClick={() => handleBarcode(p.sku, p.name)}>
                                🔲 View
                            </button>
                        </div>
                    ))}
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
    btnSmall: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
    formCard: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle: { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
    input: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    search: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, marginBottom: 20, boxSizing: 'border-box', outline: 'none' },
    table: { background: '#1e293b', borderRadius: 12, overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr', padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr', padding: '14px 16px', borderBottom: '1px solid #1e293b', background: '#0f172a', marginBottom: 2, alignItems: 'center', borderRadius: 6 },
    productName: { color: '#e2e8f0', fontWeight: 600, fontSize: 14 },
    cell: { color: '#94a3b8', fontSize: 14 },
    badge: { background: '#3b82f620', color: '#3b82f6', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' },
    loading: { color: '#64748b', textAlign: 'center', marginTop: 60 },
    empty: { color: '#64748b', textAlign: 'center', padding: 40 },
    errorMsg: { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
    infoMsg: { background: '#3b82f620', color: '#3b82f6', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 },
    modal: { position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalBox: { background: '#1e293b', borderRadius: 12, padding: 28, width: 360 },
};

export default Products;
