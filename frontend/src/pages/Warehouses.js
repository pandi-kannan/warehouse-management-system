import React, { useEffect, useState } from 'react';
import API from '../services/Api';

function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', location: '', capacity: '' });
    const [error, setError] = useState('');

    const fetchWarehouses = () => {
        API.get('/api/warehouses')
            .then(res => setWarehouses(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchWarehouses(); }, []);

    const handleSubmit = async () => {
        if (!form.name || !form.location) { setError('Name and location are required'); return; }
        try {
            await API.post('/api/warehouses', form);
            setForm({ name: '', location: '', capacity: '' });
            setShowForm(false);
            setError('');
            fetchWarehouses();
        } catch {
            setError('Failed to add warehouse');
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Warehouses</h1>
                    <span style={styles.subtitle}>{warehouses.length} warehouses</span>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Warehouse'}
                </button>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>New Warehouse</h3>
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formGrid}>
                        <input style={styles.input} placeholder="Warehouse Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input style={styles.input} placeholder="Location *" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        <input style={styles.input} placeholder="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                    </div>
                    <button style={styles.btnPrimary} onClick={handleSubmit}>Save Warehouse</button>
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>Loading warehouses...</div>
            ) : (
                <div style={styles.grid}>
                    {warehouses.length === 0 && <div style={styles.empty}>No warehouses yet.</div>}
                    {warehouses.map(w => (
                        <div key={w.id} style={styles.card}>
                            <div style={styles.cardIcon}>🏭</div>
                            <div style={styles.cardName}>{w.name}</div>
                            <div style={styles.cardDetail}>📍 {w.location || '—'}</div>
                            {w.capacity && <div style={styles.cardDetail}>📦 Capacity: {w.capacity}</div>}
                            <div style={styles.cardId}>ID #{w.id}</div>
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
    formCard: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle: { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 },
    input: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
    card: { background: '#1e293b', borderRadius: 12, padding: 24, borderTop: '3px solid #f59e0b' },
    cardIcon: { fontSize: 32, marginBottom: 12 },
    cardName: { color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 8 },
    cardDetail: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
    cardId: { color: '#475569', fontSize: 12, marginTop: 12 },
    loading: { color: '#64748b', textAlign: 'center', marginTop: 60 },
    empty: { color: '#64748b', textAlign: 'center', padding: 40, gridColumn: '1/-1' },
    errorMsg: { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
};

export default Warehouses;
