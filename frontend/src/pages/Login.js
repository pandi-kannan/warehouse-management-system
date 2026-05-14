import React, { useState } from 'react';
import API from '../services/Api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

const handleLogin = async () => {
    try {
        const response = await API.post('/auth/login', { username, password });
        localStorage.setItem('token', response.data.token);
        window.location.href = '/dashboard';
    } catch (err) {
        console.log('Full error:', err);
        console.log('Response:', err.response);
        setError('Error: ' + (err.response?.status || 'Network Error - Check if Spring Boot is running'));
    }
};

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>WMS Login</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button style={styles.button} onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '350px' },
    title: { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
    input: { width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '10px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' },
    error: { color: 'red', textAlign: 'center', marginBottom: '12px' },
};

export default Login;