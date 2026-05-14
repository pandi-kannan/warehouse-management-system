import React from 'react';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
    const navigate = useNavigate();
    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <div style={styles.icon}>🚫</div>
                <h1 style={styles.title}>Access Denied</h1>
                <p style={styles.msg}>You don't have permission to view this page.</p>
                <button style={styles.btn} onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' },
    box: { background: '#1e293b', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 360 },
    icon: { fontSize: 56, marginBottom: 16 },
    title: { color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: '0 0 8px' },
    msg: { color: '#64748b', fontSize: 15, marginBottom: 28 },
    btn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};

export default Unauthorized;
