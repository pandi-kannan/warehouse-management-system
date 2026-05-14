import React, { useEffect, useState } from 'react';
import API from '../services/Api';

function Bins() {
    const [bins, setBins] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ binCode: '', warehouseId: '' });
    const [error, setError] = useState('');

    const fetchAll = () => {
        Promise.all([
            API.get('/api/bins'),
            API.get('/api/warehouses'),
        ]).then(([binsRes, whRes]) => {
            setBins(binsRes.data);
            setWarehouses(whRes.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSubmit = async () => {
        if (!form.binCode || !form.warehouseId) {
            setError('Bin code and warehouse are required');
            return;
        }
        try {
            await API.post('/api/bins', {
                binCode: form.binCode,
                warehouse: { id: parseInt(form.warehouseId) },
            });
            setForm({ binCode: '', warehouseId: '' });
            setShowForm(false);
            setError('');
            fetchAll();
        } catch {
            setError('Failed to add bin');
        }
    };

    // Group bins by warehouse
    const grouped = warehouses.map(wh => ({
        warehouse: wh,
        bins: bins.filter(b => b.warehouse?.id === wh.id),
    }));

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Storage Bins</h1>
                    <span style={styles.subtitle}>{bins.length} bins across {warehouses.length} warehouses</span>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Bin'}
                </button>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>New Storage Bin</h3>
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    <div style={styles.formRow}>
                        <input
                            style={styles.input}
                            placeholder="Bin Code (e.g. A1, B2) *"
                            value={form.binCode}
                            onChange={e => setForm({ ...form, binCode: e.target.value })}
                        />
                        <select
                            style={styles.input}
                            value={form.warehouseId}
                            onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                        >
                            <option value="">Select Warehouse *</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name} — {w.location}</option>
                            ))}
                        </select>
                        <button style={styles.btnPrimary} onClick={handleSubmit}>Save Bin</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>Loading bins...</div>
            ) : (
                <div style={styles.warehouseList}>
                    {grouped.map(({ warehouse, bins: whBins }) => (
                        <div key={warehouse.id} style={styles.warehouseCard}>
                            <div style={styles.warehouseHeader}>
                                <span style={styles.warehouseIcon}>🏭</span>
                                <div>
                                    <div style={styles.warehouseName}>{warehouse.name}</div>
                                    <div style={styles.warehouseLocation}>📍 {warehouse.location}</div>
                                </div>
                                <span style={styles.binCount}>{whBins.length} bins</span>
                            </div>

                            {whBins.length === 0 ? (
                                <div style={styles.noBins}>No bins in this warehouse yet.</div>
                            ) : (
                                <div style={styles.binGrid}>
                                    {whBins.map(bin => (
                                        <div key={bin.id} style={styles.binCard}>
                                            <div style={styles.binIcon}>📦</div>
                                            <div style={styles.binCode}>{bin.binCode}</div>
                                            <div style={styles.binId}>ID #{bin.id}</div>
                                            <div style={styles.invCount}>
                                                {bin.inventories?.length ?? 0} product(s)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
    btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' },
    formCard: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24 },
    formTitle: { color: '#f1f5f9', marginTop: 0, marginBottom: 16 },
    formRow: { display: 'flex', gap: 12, alignItems: 'center' },
    input: { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' },
    warehouseList: { display: 'flex', flexDirection: 'column', gap: 20 },
    warehouseCard: { background: '#1e293b', borderRadius: 12, padding: 24 },
    warehouseHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #334155' },
    warehouseIcon: { fontSize: 32 },
    warehouseName: { color: '#f1f5f9', fontWeight: 700, fontSize: 18 },
    warehouseLocation: { color: '#64748b', fontSize: 13 },
    binCount: { marginLeft: 'auto', background: '#3b82f620', color: '#3b82f6', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
    binGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 },
    binCard: { background: '#0f172a', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '1px solid #334155' },
    binIcon: { fontSize: 24, marginBottom: 8 },
    binCode: { color: '#e2e8f0', fontWeight: 700, fontSize: 16, marginBottom: 4 },
    binId: { color: '#475569', fontSize: 11, marginBottom: 6 },
    invCount: { color: '#64748b', fontSize: 12 },
    noBins: { color: '#475569', fontSize: 14, fontStyle: 'italic' },
    loading: { color: '#64748b', textAlign: 'center', marginTop: 60 },
    errorMsg: { background: '#ef444420', color: '#ef4444', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
};

export default Bins;
