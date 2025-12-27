import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fb'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>GearGuard — Login</h1>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          {error && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="btn"
            style={{ width: '100%' }}
          >
            Login
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  );
}